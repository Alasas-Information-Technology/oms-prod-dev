import { supabase } from '../supabaseClient';

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

    // 2. Role-Based Visibility Filters
    if (['HOD', 'LINE_MANAGER', 'DEPT_REQUESTOR'].includes(role)) {
      // Departmental Visibility: Only see rows belonging to their specific department
      query = query.eq('department', currentUser.department);
    } 
    else if (role === 'PROCUREMENT_OFFICER') {
      // Stage-Gated Visibility: Only see requests ready for vendor distribution or further along (Stage 3+)
      query = query.gte('stage_id', 3);
    } 
    else if (role === 'INTERVIEWER') {
      // Stage-Gated Visibility: Only see requests that reached Selection or further (Stage 4+)
      query = query.gte('stage_id', 4);
    }
    // Note: SYSTEM_ADMIN, HR_ADMIN, FINANCE_OFFICER have global visibility (no filter)

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
   * Create a new requisition.
   * Generates a readable ID like OMS-2026-XXXX.
   * SECURITY: Automatically populates requestor_id and department from currentUser.
   */
  async createRequisition(requisitionData, currentUser) {
    if (!currentUser) throw new Error('Authentication required for creation');

    // 1. Generate sequential ID
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

    // 2. Prepare data for insert (Matching SQL Schema)
    const insertData = {
      req_number: formattedId,
      position_title: requisitionData.positionTitle,
      department: currentUser.department, // Auto-populated for safety
      requestor_id: currentUser.id,         // Auto-populated for safety
      reserved_budget_aed: Number(requisitionData.reservedBudget),
      target_start_date: requisitionData.targetStartDate,
      work_location: requisitionData.workLocation === 'Onshore (UAE)' ? 'Onshore' : 'Offshore',
      req_laptop: requisitionData.reqLaptop,
      req_mobile: requisitionData.reqMobilePhone,
      req_email: requisitionData.reqEmailAccess,
      req_software: requisitionData.reqSoftwareLicenses ? 'Standard Suite' : 'None',
      seating_accommodations: requisitionData.officeSeating,
      funding_category: (requisitionData.fundingType || 'Budgeted').toUpperCase(), // Match uppercase enum
      stage_id: 1 
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

    return data;
  },

  /**
   * Fetch audit logs for a specific requisition.
   */
  async getAuditLogs(requisitionId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requisitionId);
    let resolvedId = requisitionId;

    // If it's a slug, resolve the real UUID first
    if (!isUuid) {
        const { data } = await supabase
            .from('requisitions')
            .select('id')
            .eq('req_number', requisitionId)
            .single();
        if (data) resolvedId = data.id;
    }

    // 1. Fetch logs
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

    // 2. Fetch profiles for actors manually to bypass missing join relation
    const actorIds = [...new Set(logs.map(log => log.actor_id))].filter(Boolean);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', actorIds);

    if (profilesError) {
      console.error('Error fetching actor profiles:', profilesError);
      return logs; // Return logs even if profile fetch fails
    }

    // 3. Map profiles back to logs
    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
    return logs.map(log => ({
      ...log,
      profiles: profileMap[log.actor_id] || { full_name: 'Unknown Actor' }
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

    // 1. Get count of SUBMITTED candidates
    const { count: totalSubmitted, error: countError } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('requisition_id', resolvedId)
      .eq('status', 'SUBMITTED');

    // 2. Check if there are any QUALIFIED candidates
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
