import { supabase } from '../supabaseClient';

/**
 * Requisition API Service
 * Handles data fetching and stage advancement for Manpower Requisitions.
 */

export const requisitionService = {
  /**
   * Fetch all active requisitions with requestor name and workflow stage name.
   */
  async getRequisitions() {
    const { data, error } = await supabase
      .from('requisitions')
      .select('*, profiles!requestor_id(full_name), workflow_stages(stage_name, required_role_id)')
      .order('created_at', { ascending: false });

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
    const { data, error } = await supabase
      .from('requisitions')
      .select('*, profiles!requestor_id(full_name), workflow_stages(stage_name, required_role_id)')
      .eq('id', reqId)
      .single();

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
   */
  async createRequisition(requisitionData) {
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

    // 2. Prepare data for insert
    const insertData = {
      req_id: formattedId,
      title: requisitionData.positionTitle,
      department: requisitionData.department,
      requestor_id: requisitionData.requestorId,
      budget_aed: Number(requisitionData.reservedBudget),
      target_start_date: requisitionData.targetStartDate,
      work_location: requisitionData.workLocation,
      req_laptop: requisitionData.reqLaptop,
      req_mobile_phone: requisitionData.reqMobilePhone,
      req_email_access: requisitionData.reqEmailAccess,
      req_software_licenses: requisitionData.reqSoftwareLicenses,
      office_seating: requisitionData.officeSeating,
      funding_type: requisitionData.fundingType,
      stage_id: 1 // Defaults to first stage
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
  }
};
