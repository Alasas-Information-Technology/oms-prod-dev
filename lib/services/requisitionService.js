import { supabase } from '../supabaseClient';
import { hasGlobalView } from '../utils/permissions';
import { notificationService } from './notificationService';

/**
 * Requisition API Service
 * Handles data fetching and stage advancement for Manpower Requisitions.
 */

export const requisitionService = {
  /**
   * Fetch requisitions based on Role-Based Access Control (RBAC).
   */
  async getRequisitions(currentUser) {
    if (!currentUser || !currentUser.roles) return [];

    const role = currentUser.roles.role_name;

    // 1. Vendor Lockout: Completely block fetch for vendors
    if (role === 'VENDOR_USER') {
      return [];
    }

    // 2. Base Query Setup
    let query = supabase
      .from('requisitions')
      .select('*, profiles!requestor_id(full_name), workflow_stages(stage_name)');

    // 3. Dynamic Filter Matrix
    switch (role) {
      case 'SYSTEM_ADMIN':
      case 'HR_ADMIN':
      case 'FINANCE_OFFICER':
        // Global Visibility: No filters applied
        break;

      case 'PROCUREMENT_OFFICER':
        // Stage-Gated Global: All departments, but only Stage 3+
        query = query.gte('stage_id', 3);
        break;

      case 'HOD':
      case 'LINE_MANAGER':
        // Departmental Managers: Strictly isolated to their own department
        query = query.eq('department_id', currentUser.department_id);
        break;

      case 'INTERVIEWER':
        // Stage-Gated Departmental: Isolated to department AND only Stage 4+
        query = query.eq('department_id', currentUser.department_id).gte('stage_id', 4);
        break;

      case 'DEPT_REQUESTOR':
        // User-Wise Isolation: Only see requisitions personally initiated
        query = query.eq('requestor_id', currentUser.id);
        break;

      default:
        // Complete Lockout for any other roles
        return [];
    }

    // 4. Execution & Return
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requisitions:', error);
      throw error;
    }
    return data;
  },

  /**
   * Fetch a single requisition by ID with full details.
   */
  async getRequisitionById(reqId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reqId);
    
    let query = supabase
      .from('requisitions')
      .select('*, profiles!requestor_id(full_name), workflow_stages(stage_name, required_role_id), departments(dept_name)');

    if (isUuid) {
      query = query.eq('id', reqId);
    } else {
      query = query.eq('req_number', reqId);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching requisition detail:', error);
      throw error;
    }
    return data;
  },

  /**
   * Advance a requisition to the next stage and log the action.
   * Uses an RPC for atomic database operations.
   */
  async advanceRequisitionStage(reqId, currentStageId, actorId) {
    const nextStageId = currentStageId + 1;

    // Stage 5 is the Terminal Stage
    if (currentStageId === 5) {
      // 1. Mark requisition as inactive (Fulfilled)
      const { error: updateError } = await supabase
        .from('requisitions')
        .update({ is_active: false })
        .eq('id', reqId);

      if (updateError) {
        console.error('Error completing requisition:', updateError);
        throw updateError;
      }

      // 2. Insert specialized Completion Audit Log
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert([{
          requisition_id: reqId,
          actor_id: actorId,
          action_type: 'REQUISITION_COMPLETED',
          old_stage_id: 5,
          new_stage_id: 5,
          comments: 'Workflow terminated successfully. Requisition fulfilled.'
        }]);

      if (logError) {
        console.error('Error logging requisition completion:', logError);
      }

      // 3. Trigger Confirmation Notification to Requestor
      const { data: rd } = await supabase.from('requisitions').select('requestor_id, req_number').eq('id', reqId).single();
      if (rd) {
        await notificationService.createNotification({
          recipientId: rd.requestor_id,
          requisitionId: reqId,
          title: 'Requisition Fulfilled',
          message: 'Your requisition has been successfully fulfilled and the candidate is active.'
        });
      }
      
      return true;
    }

    // Default: Advance to next stage using RPC
    const { error } = await supabase.rpc('advance_requisition_stage', {
      p_req_id: reqId,
      p_current_stage_id: currentStageId,
      p_actor_id: actorId
    });

    if (error) {
      console.error('Error advancing requisition stage:', error);
      throw error;
    }

    // ── TRIGGER NOTIFICATIONS ──────────────────────────────────────────────
    // ── TRIGGER AUTOMATED NOTIFICATIONS ────────────────────────────────────
    try {
      const { data: requisition } = await supabase
        .from('requisitions')
        .select('req_number, department_id')
        .eq('id', reqId)
        .single();

      if (requisition) {
        switch (nextStageId) {
          case 2:
            await notificationService.dispatchRoleNotification(
              'HR_ADMIN', null, reqId, 
              'Action Required: Executive Approval', 
              'A new requisition requires HR approval to proceed to Vendor Submission.'
            );
            break;
          case 3:
            await notificationService.dispatchRoleNotification(
              'PROCUREMENT_OFFICER', null, reqId, 
              'Action Required: Publish Requisition', 
              'A requisition has been approved by HR and is ready for vendor distribution.'
            );
            break;
          case 4:
            await notificationService.dispatchRoleNotification(
              'INTERVIEWER', requisition.department_id, reqId, 
              'Action Required: Review Candidates', 
              'Vendor submissions have closed. Please review the blind candidates and orchestrate interviews.'
            );
            break;
          case 5:
            await notificationService.dispatchRoleNotification(
              'LINE_MANAGER', requisition.department_id, reqId, 
              'Action Required: Digital Onboarding', 
              'A candidate has been qualified. Please complete the digital onboarding checklist.'
            );
            break;
        }
      }
    } catch (notifError) {
      console.error('Error triggering automated notifications (non-fatal):', notifError);
    }

    return true;
  },

  /**
   * Create a new requisition with real-time budget control.
   * Generates a readable ID like OMS-2026-XXXX.
   * SECURITY: Automatically populates requestor_id and department from currentUser.
   */
  async createRequisition(requisitionData, currentUser) {
    if (!currentUser) throw new Error('Authentication required for creation');

    // ── Step 1: Generate sequential human-readable ID ──────────────────────
    const year = new Date().getFullYear();
    const { count, error: countError } = await supabase
      .from('requisitions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching requisition count:', countError);
      throw countError;
    }

    const nextNumber = (count || 0) + 1;
    const formattedId = `OMS-${year}-${String(nextNumber).padStart(4, '0')}`;

    // ── Step 2: Insert the requisition row ─────────────────────────────────
    const reservedAmount = Number(requisitionData.reservedBudget) || 0;
    const finalDeptName  = requisitionData.departmentName || currentUser.department;
    const finalDeptId    = requisitionData.departmentId   || currentUser.department_id;

    const insertData = {
      req_number: formattedId,
      position_title: requisitionData.positionTitle,
      department: finalDeptName,
      department_id: finalDeptId,
      requestor_id: currentUser.id,
      reserved_budget_aed: reservedAmount,
      target_start_date: requisitionData.targetStartDate,
      work_location: requisitionData.workLocation === 'Onshore (UAE)' ? 'Onshore' : 'Offshore',
      req_laptop: requisitionData.reqLaptop,
      req_mobile: requisitionData.reqMobilePhone,
      req_email: requisitionData.reqEmailAccess,
      req_software: requisitionData.reqSoftwareLicenses ? 'Standard Suite' : 'None',
      seating_accommodations: requisitionData.officeSeating,
      funding_category: (requisitionData.fundingType || 'BUDGETED').toUpperCase(),
      stage_id: 1,
    };

    const { data, error } = await supabase
      .from('requisitions')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating requisition:', error);
      throw error;
    }

    // ── Step 3: Atomically increment reserved_aed on the budgets table ──────
    const isBudgeted = (requisitionData.fundingType || '').toUpperCase() === 'BUDGETED';

    if (isBudgeted && finalDeptId && reservedAmount > 0) {
      const { error: budgetError } = await supabase.rpc('increment_department_reserved', {
        p_department_id: finalDeptId,
        p_financial_year: year,
        p_amount: reservedAmount,
      });

      if (budgetError) {
        console.error('Budget reservation increment failed (non-fatal):', budgetError);
      }

      // ── Step 4: Write BUDGET_RESERVATION audit log ─────────────────────────
      const { error: auditError } = await supabase.from('audit_logs').insert([{
        requisition_id: data.id,
        actor_id: currentUser.id,
        action_type: 'BUDGET_RESERVATION',
        old_stage_id: null,
        new_stage_id: 1,
        comments: `Budget reservation of AED ${reservedAmount.toLocaleString('en-AE')} locked against ${finalDeptName} (FY ${year}). Req: ${formattedId}.`,
      }]);

      if (auditError) {
        console.error('Audit log write failed (non-fatal):', auditError);
      }
    }

    return data;
  },

  async updateRequisition(id, updateData) {
    const { data, error } = await supabase
      .from('requisitions')
      .update({
        position_title: updateData.positionTitle,
        department: updateData.departmentName,
        department_id: updateData.departmentId,
        target_start_date: updateData.targetStartDate,
        work_location: updateData.workLocation === 'Onshore (UAE)' ? 'Onshore' : 'Offshore',
        req_laptop: updateData.reqLaptop,
        req_mobile: updateData.reqMobilePhone,
        req_email: updateData.reqEmailAccess,
        req_software: updateData.reqSoftwareLicenses ? 'Standard Suite' : 'None',
        seating_accommodations: updateData.officeSeating,
        funding_category: (updateData.fundingType || 'BUDGETED').toUpperCase(),
        reserved_budget_aed: Number(updateData.reservedBudget) || 0,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating requisition:', error);
      throw error;
    }
    return data;
  },

  /**
   * Fetch audit logs for a specific requisition.
   * Leverages the newly established foreign key between audit_logs and profiles.
   */
  async getAuditLogs(requisitionId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requisitionId);
    let resolvedId = requisitionId;

    if (!isUuid) {
        const { data } = await supabase
            .from('requisitions')
            .select('id')
            .eq('req_number', requisitionId)
            .single();
        if (data) resolvedId = data.id;
    }

    // 1. Fetch logs (removing the join that is currently failing)
    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('requisition_id', resolvedId)
      .order('cryptographic_timestamp', { ascending: false });

    if (logsError) {
      console.error('Error fetching audit logs:', logsError);
      throw logsError;
    }

    if (!logs || logs.length === 0) return [];

    // 2. Manual Join Workaround: Fetch profiles for the unique actors in this set
    const actorIds = [...new Set(logs.map(log => log.actor_id))].filter(Boolean);
    
    if (actorIds.length === 0) return logs;

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', actorIds);

    if (profilesError) {
      console.error('Error fetching actor profiles for manual join:', profilesError);
      return logs; // Fallback to raw logs if profile fetch fails
    }

    // 3. Map profiles back to the audit logs
    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    return logs.map(log => ({
      ...log,
      profiles: profileMap[log.actor_id] || { full_name: 'System / Unknown Actor' }
    }));
  },

  /**
   * Fetch all workflow stages.
   */
  async getWorkflowStages() {
    const { data, error } = await supabase
      .from('workflow_stages')
      .select('*')
      .order('stage_id', { ascending: true });

    if (error) {
      console.error('Error fetching workflow stages:', error);
      throw error;
    }
    return data;
  },

  /**
   * Fetch candidate review summary for Stage 4 gating.
   */
  async getCandidateReviewStatus(requisitionId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requisitionId);
    let resolvedId = requisitionId;

    if (!isUuid) {
        const { data } = await supabase
            .from('requisitions')
            .select('id')
            .eq('req_number', requisitionId)
            .single();
        if (data) resolvedId = data.id;
    }

    const { count: totalSubmitted, error: countError } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('requisition_id', resolvedId)
      .eq('status', 'SUBMITTED');

    const { data: qualified, error: qualError } = await supabase
      .from('candidates')
      .select('id')
      .eq('requisition_id', resolvedId)
      .eq('status', 'QUALIFIED')
      .limit(1);

    if (countError || qualError) {
      console.error('Error fetching candidate status:', countError || qualError);
      return { totalSubmitted: 0, hasQualified: false };
    }

    return {
      totalSubmitted: totalSubmitted || 0,
      hasQualified: (qualified && qualified.length > 0) || false
    };
  },

  /**
   * Terminate a requisition (e.g., rejection at Initiation stage).
   * Deactivates the requisition and releases reserved budget if applicable.
   */
  async terminateRequisition(reqId, actorId, reason) {
    // 1. Fetch current requisition to check for reserved budget
    const { data: requisition, error: fetchError } = await supabase
      .from('requisitions')
      .select('req_number, department_id, reserved_budget_aed, funding_category')
      .eq('id', reqId)
      .single();

    if (fetchError) {
      console.error('Error fetching requisition for termination:', fetchError);
      throw fetchError;
    }

    // 2. Deactivate the requisition
    const { error: updateError } = await supabase
      .from('requisitions')
      .update({ is_active: false })
      .eq('id', reqId);

    if (updateError) {
      console.error('Error deactivating requisition:', updateError);
      throw updateError;
    }

    // 3. Release reserved budget if it's a budgeted requisition
    const reservedAmount = Number(requisition.reserved_budget_aed) || 0;
    const isBudgeted = requisition.funding_category === 'BUDGETED';

    if (isBudgeted && requisition.department_id && reservedAmount > 0) {
      const year = new Date().getFullYear();
      const { error: budgetError } = await supabase.rpc('increment_department_reserved', {
        p_department_id: requisition.department_id,
        p_financial_year: year,
        p_amount: -reservedAmount, // Negative to release
      });

      if (budgetError) {
        console.error('Budget reservation release failed (non-fatal):', budgetError);
      }
    }

    // 4. Insert Audit Log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert([{
        requisition_id: reqId,
        actor_id: actorId,
        action_type: 'REQUISITION_TERMINATED',
        comments: reason || 'Requisition terminated by user.'
      }]);

    if (logError) {
      console.error('Error logging termination:', logError);
    }

    // 5. Trigger Rejection Notification to Requestor
    await notificationService.createNotification({
      recipientId: requisition.requestor_id,
      requisitionId: reqId,
      title: 'Requisition Rejected',
      message: 'Your requisition has been rejected and returned to you. Please check the audit logs for comments.'
    });

    return true;
  }
};
