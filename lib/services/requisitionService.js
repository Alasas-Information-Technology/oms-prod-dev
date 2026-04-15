import { supabase } from '../supabaseClient';
import { hasGlobalView } from '../utils/permissions';

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

    let query = supabase
      .from('requisitions')
      .select('*, profiles!requestor_id(full_name), workflow_stages(stage_name, required_role_id)')
      .order('created_at', { ascending: false });

    const isGlobal = hasGlobalView(role);

    // 2. Role-Based Visibility Filters
    if (isGlobal) {
      if (role === 'PROCUREMENT_OFFICER') {
        // Procurement: Global visibility but only for Stage 3+ (Distributed)
        query = query.gte('stage_id', 3);
      }
      // Note: SYSTEM_ADMIN, HR_ADMIN, FINANCE_OFFICER have no additional filters (Global All)
    } 
    else if (role === 'INTERVIEWER') {
      // Interviewer: Restricted to their department AND Stage 4+ (Selection)
      query = query.gte('stage_id', 4).eq('department_id', currentUser.department_id);
    }
    else {
      // Default Departmental Visibility (HOD, LINE_MANAGER, DEPT_REQUESTOR)
      query = query.eq('department_id', currentUser.department_id);
    }

    const { data, error } = await query;

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
      .select('*, profiles!requestor_id(full_name), workflow_stages(stage_name, required_role_id)');

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
        // We don't throw here to avoid rollback confusion since update succeeded
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
  }
};
