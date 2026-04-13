import { supabase } from "../supabaseClient";

export const vendorService = {
  async getVendors() {
    const { data, error } = await supabase
      .from("vendordetails")
      .select("*")
      .order("company_name", { ascending: true });

    if (error) {
      console.error("❌ getVendors error:", error);
      throw error;
    }
    console.log("✅ getVendors success:", data?.length, "records");
    return data;
  },

  async createVendor(vendorData) {
    console.log("🔄 createVendor called with:", vendorData);

    const { data, error } = await supabase
      .from("vendordetails")
      .insert([vendorData])
      .select()
      .single();

    console.log("createVendor response → data:", data, "| error:", error);

    if (error) {
      console.error("❌ createVendor error:", error);
      throw error;
    }
    console.log("✅ createVendor success:", data);
    return data;
  },

  async updateVendor(id, vendorData) {
    console.log("🔄 updateVendor called with id:", id, "data:", vendorData);

    const { data, error } = await supabase
      .from("vendordetails")
      .update(vendorData)
      .eq("id", id)
      .select()
      .single();

    console.log("updateVendor response → data:", data, "| error:", error);

    if (error) {
      console.error("❌ updateVendor error:", error);
      throw error;
    }
    console.log("✅ updateVendor success:", data);
    return data;
  },

  async deleteVendor(id) {
    console.log("🔄 deleteVendor called with id:", id);

    const { data, error, status, statusText } = await supabase
      .from("vendordetails")
      .delete()
      .eq("id", id)
      .select(); // <-- add .select() so we get confirmation back

    console.log(
      "deleteVendor response → data:",
      data,
      "| error:",
      error,
      "| status:",
      status,
      statusText,
    );

    if (error) {
      console.error("❌ deleteVendor error:", error);
      throw error;
    }
    console.log("✅ deleteVendor success");
    return true;
  },

  async toggleVendorStatus(id, isActive) {
    const { data, error } = await supabase
      .from("vendordetails")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ toggleVendorStatus error:", error);
      throw error;
    }
    return data;
  },
};
