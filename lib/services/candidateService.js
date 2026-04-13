import { supabase } from '../supabaseClient';

/**
 * Candidate API Service
 * Handles data fetching for Blind Candidate Selection.
 */

export const candidateService = {
  /**
   * Fetch candidates for a specific requisition.
   * Explicitly omits vendor_id and financial_quote_aed for security in Blind Selection mode.
   */
  async getCandidatesForRequisition(reqId) {
    const { data, error } = await supabase
      .from('candidates')
      .select('id, alias, total_years_experience, top_skills, education_level, priority_ranking, status')
      .eq('requisition_id', reqId);

    if (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
    return data;
  }
};
