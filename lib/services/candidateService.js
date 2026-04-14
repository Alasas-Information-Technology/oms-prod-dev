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
  },

  /**
   * Update multiple candidate rankings and statuses.
   * @param {Record<string, string | null>} rankings - Map of candidateId -> ranking (P1, P2, P3, Rejected, or null)
   * @param {boolean} finalize - If true, promotes ranked candidates to QUALIFIED status.
   */
  async updateCandidateRankings(rankings, finalize = false) {
    const updates = Object.entries(rankings).map(async ([candidateId, ranking]) => {
      const updatePayload = {
        priority_ranking: ranking === 'Rejected' ? null : ranking,
      };

      if (finalize) {
        if (ranking === 'Rejected') {
          updatePayload.status = 'REJECTED';
        } else if (ranking) {
          updatePayload.status = 'QUALIFIED';
        }
      }

      return supabase
        .from('candidates')
        .update(updatePayload)
        .eq('id', candidateId);
    });

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      console.error('Errors updating candidate rankings:', errors);
      throw new Error('Failed to update one or more candidate rankings.');
    }
    
    return true;
  }
};
