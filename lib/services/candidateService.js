import { supabase } from "../supabaseClient";

export const candidateService = {
  async getCandidates() {
    const { data, error } = await supabase
      .from("candidates")
      .select(
        `
        *,
        vendors:vendor_id(id, company_name),
        requisitions:requisition_id(id, req_number, position_title, department)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ getCandidates error:", error);
      throw error;
    }
    return data;
  },

  async createCandidate(candidateData) {
    console.log("🔄 createCandidate called with:", candidateData);
    const { data, error } = await supabase
      .from("candidates")
      .insert([candidateData])
      .select()
      .single();

    if (error) {
      console.error("❌ createCandidate error:", error);
      throw error;
    }
    console.log("✅ createCandidate success:", data);
    return data;
  },

  async updateCandidate(id, candidateData) {
    console.log("🔄 updateCandidate called with id:", id);
    const { data, error } = await supabase
      .from("candidates")
      .update(candidateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ updateCandidate error:", error);
      throw error;
    }
    return data;
  },

  async deleteCandidate(id) {
    console.log("🔄 deleteCandidate called with id:", id);
    const { data, error, status } = await supabase
      .from("candidates")
      .delete()
      .eq("id", id)
      .select();

    console.log(
      "deleteCandidate response → data:",
      data,
      "| error:",
      error,
      "| status:",
      status,
    );
    if (error) {
      console.error("❌ deleteCandidate error:", error);
      throw error;
    }
    return true;
  },

  async getVendorOptions() {
    const { data, error } = await supabase
      .from("vendordetails")
      .select("id, company_name")
      .eq("is_active", true)
      .order("company_name", { ascending: true });

    if (error) {
      console.error("❌ getVendorOptions error:", error);
      throw error;
    }
    return data;
  },

  async getRequisitionOptions() {
    const { data, error } = await supabase
      .from("requisitions")
      .select("id, req_number, position_title, department")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ getRequisitionOptions error:", error);
      throw error;
    }
    return data;
  },
  async getCandidatesForRequisition(reqId) {
    const { data, error } = await supabase
      .from("candidates")
      .select(
        "id, alias, total_years_experience, top_skills, education_level, priority_ranking, status",
      )
      .eq("requisition_id", reqId);

    if (error) {
      console.error("Error fetching candidates:", error);
      throw error;
    }
    return data;
  },
};
