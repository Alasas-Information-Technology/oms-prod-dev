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
  }
};
