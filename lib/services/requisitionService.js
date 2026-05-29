import { supabase } from '../supabaseClient';
import { hasGlobalView } from '../utils/permissions';
import { notificationService } from './notificationService';

/**
 * Requisition API Service
 * Handles data fetching, stage advancement, and file uploads for Manpower Requisitions.
 */

const STORAGE_BUCKET = 'requisition-documents';

export const requisitionService = {
  /**
   * Internal helper to upload a single file to Supabase Storage.
   */
  async _uploadFile(file, folder = 'general') {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      console.error(`Error uploading file to ${folder}:`, uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Internal helper to upload multiple files and return an array of public URLs.
   */
  async _uploadMultipleFiles(fileList, folder) {
    if (!fileList || fileList.length === 0) return [];
    const uploadPromises = Array.from(fileList).map(file => this._uploadFile(file, folder));
    return (await Promise.all(uploadPromises)).filter(Boolean);
  },

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
        // Interviewers: Must see requisitions in their department Stage 3+ OR any requisition where they are a designated interviewer
        query = query.or(`and(department_id.eq.${currentUser.department_id},stage_id.gte.3),interviewer_ids.cs.{${currentUser.id}}`);
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
    if (!reqId || reqId === 'new') {
      console.log('RequisitionService: skipping fetch for "new" or empty ID');
      return null;
    }

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reqId);
      
      let query = supabase
        .from('requisitions')
        .select(`
          *,
          requestor:profiles!requestor_id(full_name),
          manager:profiles!reporting_line_manager_id(full_name),
          interviewer:profiles!main_interviewer_id(full_name),
          workflow_stages(stage_name, required_role_id),
          departments(dept_name)
        `);

      if (isUuid) {
        query = query.eq('id', reqId);
      } else {
        query = query.eq('req_number', reqId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn(`Requisition ${reqId} not found (PGRST116)`);
          return null;
        }
        console.error('Error fetching requisition detail:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Fatal error in getRequisitionById:', err);
      return null;
    }
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

      // 2. Insert specialized Completion Audit Log (Non-blocking if RLS fails)
      try {
        await supabase
          .from('audit_logs')
          .insert([{
            requisition_id: reqId,
            actor_id: actorId,
            action_type: 'REQUISITION_COMPLETED',
            old_stage_id: 5,
            new_stage_id: 5,
            comments: 'Workflow terminated successfully. Requisition fulfilled.'
          }]);
      } catch (logError) {
        console.error('Non-critical: Audit log write failed (likely RLS):', logError);
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
    // STAGE 3 DEMO BYPASS: Allow Requestors and Interviewers to advance from Stage 3
    const { data: actorProfile } = await supabase
        .from('profiles')
        .select('roles(role_name)')
        .eq('id', actorId)
        .single();
    
    const actorRole = actorProfile?.roles?.role_name;

    if (currentStageId === 3 && (actorRole === 'DEPT_REQUESTOR' || actorRole === 'INTERVIEWER')) {
        // Explicitly allow advancement for these roles during demo sourcing
        const { error: bypassError } = await supabase
            .from('requisitions')
            .update({ stage_id: nextStageId })
            .eq('id', reqId);
        
        if (bypassError) throw bypassError;
    } else {
        const { error } = await supabase.rpc('advance_requisition_stage', {
            p_req_id: reqId,
            p_current_stage_id: currentStageId,
            p_actor_id: actorId
        });

        if (error) {
            console.error('Error advancing requisition stage:', error);
            throw error;
        }
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
   * Create a new requisition with comprehensive fields and real-time budget control.
   */
  async createRequisition(requisitionData, currentUser) {
    if (!currentUser) throw new Error('Authentication required for creation');

    // 1. Handle File Uploads
    let jobDescriptionPath = '';
    if (requisitionData.jobDescription && requisitionData.jobDescription[0]) {
      jobDescriptionPath = await this._uploadFile(requisitionData.jobDescription[0], 'job-descriptions');
    }

    const supportingUrls = await this._uploadMultipleFiles(requisitionData.supportingAttachments, 'supporting');
    const additionalUrls = await this._uploadMultipleFiles(requisitionData.additionalAttachments, 'additional');

    // 2. Prepare Data
    const year = new Date().getFullYear();
    const { count, error: countError } = await supabase
      .from('requisitions')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const nextNumber = (count || 0) + 1;
    const formattedId = `OMS-${year}-${String(nextNumber).padStart(4, '0')}`;

    const reservedAmount = Number(requisitionData.budgetAmount) || 0;
    const finalDeptId = requisitionData.departmentId || currentUser.department_id;

    const insertData = {
      req_number: formattedId,
      position_title: requisitionData.positionTitle,
      num_resources: Number(requisitionData.numResources) || 1,
      job_profile: requisitionData.jobProfile,
      justification: requisitionData.justification,
      department: requisitionData.departmentName || currentUser.department,
      department_id: finalDeptId,
      requestor_id: currentUser.id,
      reporting_line_manager_id: requisitionData.reportingLineManagerId,
      work_completion_assignee_ids: requisitionData.workCompletionAssigneeIds || [],
      interviewer_ids: requisitionData.interviewerIds || [],
      main_interviewer_id: requisitionData.mainInterviewerId,
      engagement_period: Number(requisitionData.engagementPeriod),
      engagement_unit: requisitionData.engagementUnit,
      target_start_date: requisitionData.expectedStartDate,
      expected_end_date: requisitionData.expectedEndDate,
      software_hardware_requirements: requisitionData.softwareHardwareRequirements || [],
      // Map hardware boolean columns from the schema
      req_laptop: (requisitionData.softwareHardwareRequirements || []).includes('Laptop'),
      req_mobile_phone: (requisitionData.softwareHardwareRequirements || []).includes('Mobile Device'),
      req_email_access: (requisitionData.softwareHardwareRequirements || []).includes('Email Access'),
      req_software_licenses: (requisitionData.softwareHardwareRequirements || []).includes('SaaS Subscriptions') || (requisitionData.softwareHardwareRequirements || []).includes('VPN Access'),
      work_location: requisitionData.workLocation,
      seating_available: requisitionData.seatingAvailable === 'Yes',
      seating_location: requisitionData.seatingLocation,
      accommodation_plan: requisitionData.accommodationPlan,
      reserved_budget_aed: reservedAmount,
      salary_grade: requisitionData.salaryGrade,
      funding_category: requisitionData.fundingCategory,
      budget_line_ids: requisitionData.budgetLineIds || [],
      job_description_path: jobDescriptionPath,
      supporting_attachments: supportingUrls,
      additional_attachments: additionalUrls,
      is_draft: !!requisitionData.isDraft,
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

    // 3. Budget reservation logic (only for submitted, budgeted requisitions)
    if (!requisitionData.isDraft && requisitionData.fundingCategory === 'BUDGETED' && finalDeptId && reservedAmount > 0) {
      await supabase.rpc('increment_department_reserved', {
        p_department_id: finalDeptId,
        p_financial_year: year,
        p_amount: reservedAmount,
      });

      await supabase.from('audit_logs').insert([{
        requisition_id: data.id,
        actor_id: currentUser.id,
        action_type: 'BUDGET_RESERVATION',
        comments: `Budget reservation of AED ${reservedAmount.toLocaleString()} locked.`,
      }]);
    }

    return data;
  },

  async updateRequisition(id, updateData) {
    // 1. Handle File Uploads (only if new files are provided)
    let jobDescriptionPath = updateData.jobDescriptionPath;
    if (updateData.jobDescription && updateData.jobDescription[0]) {
      jobDescriptionPath = await this._uploadFile(updateData.jobDescription[0], 'job-descriptions');
    }

    // For attachments, we append for now (or replace if empty list)
    let finalSupporting = updateData.supportingAttachments || [];
    if (updateData.supportingFiles && updateData.supportingFiles.length > 0) {
      const newUrls = await this._uploadMultipleFiles(updateData.supportingFiles, 'supporting');
      finalSupporting = [...finalSupporting, ...newUrls];
    }

    let finalAdditional = updateData.additionalAttachments || [];
    if (updateData.additionalFiles && updateData.additionalFiles.length > 0) {
      const newUrls = await this._uploadMultipleFiles(updateData.additionalFiles, 'additional');
      finalAdditional = [...finalAdditional, ...newUrls];
    }

    const { data, error } = await supabase
      .from('requisitions')
      .update({
        position_title: updateData.positionTitle,
        num_resources: Number(updateData.numResources) || 1,
        job_profile: updateData.jobProfile,
        justification: updateData.justification,
        reporting_line_manager_id: updateData.reportingLineManagerId,
        work_completion_assignee_ids: updateData.workCompletionAssigneeIds || [],
        interviewer_ids: updateData.interviewerIds || [],
        main_interviewer_id: updateData.mainInterviewerId,
        engagement_period: Number(updateData.engagementPeriod),
        engagement_unit: updateData.engagementUnit,
        target_start_date: updateData.expectedStartDate,
        expected_end_date: updateData.expectedEndDate,
        software_hardware_requirements: updateData.softwareHardwareRequirements || [],
        // Map hardware boolean columns from the schema
        req_laptop: (updateData.softwareHardwareRequirements || []).includes('Laptop'),
        req_mobile_phone: (updateData.softwareHardwareRequirements || []).includes('Mobile Device'),
        req_email_access: (updateData.softwareHardwareRequirements || []).includes('Email Access'),
        req_software_licenses: (updateData.softwareHardwareRequirements || []).includes('SaaS Subscriptions') || (updateData.softwareHardwareRequirements || []).includes('VPN Access'),
        work_location: updateData.workLocation,
        seating_available: updateData.seatingAvailable === 'Yes',
        seating_location: updateData.seatingLocation,
        accommodation_plan: updateData.accommodationPlan,
        reserved_budget_aed: Number(updateData.budgetAmount) || 0,
        salary_grade: updateData.salaryGrade,
        funding_category: updateData.fundingCategory,
        budget_line_ids: updateData.budgetLineIds || [],
        job_description_path: jobDescriptionPath,
        supporting_attachments: finalSupporting,
        additional_attachments: finalAdditional,
        is_draft: !!updateData.isDraft,
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
  },

  /**
   * Strictly Enforced Rejection (HR Gatekeeper).
   * Validates actor role and current stage before deactivating.
   */
  async rejectRequisition(reqId, actorId, comments) {
    // 1. Fetch current details for validation
    const { data: requisition, error: fetchError } = await supabase
      .from('requisitions')
      .select('stage_id, requestor_id')
      .eq('id', reqId)
      .single();

    if (fetchError || !requisition) throw new Error('Requisition not found');

    // 2. Strict Governance Validation
    // Rejection is ONLY allowed at Stage 2 (Executive Approval)
    if (requisition.stage_id !== 2) {
      throw new Error('Rejection is only permitted during the Executive Approval stage.');
    }

    // 3. Execute Termination (Reusing existing logic for budget release)
    return this.terminateRequisition(reqId, actorId, `REJECTED: ${comments}`);
  },

  /**
   * Internal Safety Valve: Request or Approve Closure.
   * Handles Stage 10 (Closure Pending HOD) and Final Deactivation.
   */
  async requestRequisitionClosure(reqId, actorId, roleName, justification) {
    const { data: req, error: fetchError } = await supabase
      .from('requisitions')
      .select('id, req_number, stage_id, department_id, requestor_id, reserved_budget_aed')
      .eq('id', reqId)
      .single();

    if (fetchError || !req) throw new Error('Requisition not found');

    // FLOW A: DEPT_REQUESTOR initiates request
    if (roleName === 'DEPT_REQUESTOR') {
      // 1. Advance to Stage 10
      const { error: stageError } = await supabase
        .from('requisitions')
        .update({ 
          stage_id: 10,
          closure_justification: justification
        })
        .eq('id', reqId);
      
      if (stageError) throw stageError;

      // 2. Log Action
      await supabase.from('audit_logs').insert([{
        requisition_id: reqId,
        actor_id: actorId,
        action_type: 'CLOSURE_REQUESTED',
        old_stage_id: req.stage_id,
        new_stage_id: 10,
        comments: justification
      }]);

      // 3. Notify HOD
      await notificationService.dispatchRoleNotification(
        'HOD', 
        req.department_id, 
        reqId, 
        'Action Required: Closure Request', 
        `IT Requestor has requested to close ${req.req_number}. Final HOD approval is required.`
      );

      return { status: 'PENDING_HOD' };
    }

    // FLOW B: HOD directly approves/initiates closure
    if (roleName === 'HOD' || roleName === 'SYSTEM_ADMIN') {
      // 1. Deactivate
      const { error: activeError } = await supabase
        .from('requisitions')
        .update({ is_active: false, closure_justification: justification })
        .eq('id', reqId);
      
      if (activeError) throw activeError;

      // 2. Release Budget
      const reservedAmount = Number(req.reserved_budget_aed) || 0;
      if (reservedAmount > 0 && req.department_id) {
        await supabase.rpc('release_department_reserved', {
          p_department_id: req.department_id,
          p_financial_year: new Date().getFullYear(),
          p_amount: reservedAmount
        });
      }

      // 3. Log
      await supabase.from('audit_logs').insert([{
        requisition_id: reqId,
        actor_id: actorId,
        action_type: 'REQUISITION_CLOSED',
        comments: `Requisition closed by HOD. Justification: ${justification}`
      }]);

      // 4. Notify Requestor
      await notificationService.createNotification({
        recipientId: req.requestor_id,
        requisitionId: reqId,
        title: 'Requisition Closed',
        message: `Your requisition ${req.req_number} has been closed and the budget released.`
      });

      return { status: 'CLOSED' };
    }

    throw new Error('Unauthorized closure request.');
  }
};
