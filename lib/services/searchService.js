import { supabase } from '../supabaseClient';

export const searchService = {
  /**
   * Unified search across multiple tables
   * @param {string} queryText 
   */
  async globalSearch(queryText) {
    if (!queryText || queryText.length < 2) return [];

    const query = queryText.toLowerCase();

    // Parallel searches for better performance
    const [reqResults, candResults, vendorResults] = await Promise.all([
      // Search Requisitions
      supabase
        .from('requisitions')
        .select('id, req_number, position_title, department')
        .or(`req_number.ilike.%${query}%,position_title.ilike.%${query}%`)
        .limit(5),

      // Search Candidates
      supabase
        .from('candidates')
        .select('id, alias, status, requisitions(req_number)')
        .ilike('alias', `%${query}%`)
        .limit(5),

      // Search Vendors
      supabase
        .from('vendordetails')
        .select('id, company_name, contact_name')
        .ilike('company_name', `%${query}%`)
        .limit(5)
    ]);

    const results = [];

    // Format Requisitions
    if (reqResults.data) {
      reqResults.data.forEach(item => {
        results.push({
          id: item.id,
          type: 'requisition',
          title: item.req_number,
          subtitle: item.position_title,
          url: `/requisition-management/${item.id}`,
          metadata: item.department
        });
      });
    }

    // Format Candidates
    if (candResults.data) {
      candResults.data.forEach(item => {
        results.push({
          id: item.id,
          type: 'candidate',
          title: item.alias,
          subtitle: `Status: ${item.status}`,
          url: `/candidates`, // Candidates usually handled in the main list/drawer
          metadata: item.requisitions?.req_number
        });
      });
    }

    // Format Vendors
    if (vendorResults.data) {
      vendorResults.data.forEach(item => {
        results.push({
          id: item.id,
          type: 'vendor',
          title: item.company_name,
          subtitle: item.contact_name,
          url: `/system-directory`, // Vendors list
          metadata: 'Vendor'
        });
      });
    }

    return results;
  }
};
