"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Hash,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vendorService } from "@/lib/services/vendorService";

interface VendorFormData {
  company_name: string;
  vendor_code: string;
  contact_person: string;
  designation: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_active: boolean;
}

const emptyForm: VendorFormData = {
  company_name: "",
  vendor_code: "",
  contact_person: "",
  designation: "",
  email: "",
  phone: "",
  mobile: "",
  website: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  is_active: true,
};

interface VendorModalProps {
  mode: "create" | "edit";
  vendor?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VendorModal({
  mode,
  vendor,
  onClose,
  onSuccess,
}: VendorModalProps) {
  const [form, setForm] = useState<VendorFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && vendor) {
      setForm({
        company_name: vendor.company_name || "",
        vendor_code: vendor.vendor_code || "",
        contact_person: vendor.contact_person || "",
        designation: vendor.designation || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        mobile: vendor.mobile || "",
        website: vendor.website || "",
        address_line1: vendor.address_line1 || "",
        address_line2: vendor.address_line2 || "",
        city: vendor.city || "",
        state: vendor.state || "",
        country: vendor.country || "",
        postal_code: vendor.postal_code || "",
        is_active: vendor.is_active ?? true,
      });
    }
  }, [mode, vendor]);

  const handleChange = (
    field: keyof VendorFormData,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.company_name.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    try {
      if (mode === "create") {
        await vendorService.createVendor(form);
        toast.success("Vendor created successfully");
      } else {
        await vendorService.updateVendor(vendor.id, form);
        toast.success("Vendor updated successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save vendor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === "create" ? "Add New Vendor" : "Edit Vendor"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "create"
                ? "Register a new vendor in the system"
                : `Editing: ${vendor?.company_name}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Company Info */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={13} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Company Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  placeholder="e.g. Acme Technologies LLC"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Vendor Code
                </label>
                <div className="relative">
                  <Hash
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={form.vendor_code}
                    onChange={(e) =>
                      handleChange("vendor_code", e.target.value)
                    }
                    placeholder="VND-001"
                    className="h-9 text-sm pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Website
                </label>
                <div className="relative">
                  <Globe
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={form.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://example.com"
                    className="h-9 text-sm pl-8"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User size={13} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Contact Details
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Contact Person
                </label>
                <Input
                  value={form.contact_person}
                  onChange={(e) =>
                    handleChange("contact_person", e.target.value)
                  }
                  placeholder="Full name"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Designation
                </label>
                <Input
                  value={form.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  placeholder="e.g. Account Manager"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="contact@vendor.com"
                    className="h-9 text-sm pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+971 4 000 0000"
                    className="h-9 text-sm pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Mobile
                </label>
                <div className="relative">
                  <Phone
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    placeholder="+971 50 000 0000"
                    className="h-9 text-sm pl-8"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={13} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Address
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Address Line 1
                </label>
                <Input
                  value={form.address_line1}
                  onChange={(e) =>
                    handleChange("address_line1", e.target.value)
                  }
                  placeholder="Street address"
                  className="h-9 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Address Line 2
                </label>
                <Input
                  value={form.address_line2}
                  onChange={(e) =>
                    handleChange("address_line2", e.target.value)
                  }
                  placeholder="Suite, floor, building name (optional)"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  City
                </label>
                <Input
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Dubai"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  State / Emirate
                </label>
                <Input
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Dubai"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Country
                </label>
                <Input
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="United Arab Emirates"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Postal Code
                </label>
                <Input
                  value={form.postal_code}
                  onChange={(e) => handleChange("postal_code", e.target.value)}
                  placeholder="00000"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Status */}
          <section>
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div
                onClick={() => handleChange("is_active", !form.is_active)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? "bg-[hsl(214,67%,32%)]" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0"}`}
                />
              </div>
              <span className="text-sm text-slate-700 font-medium">
                Active vendor
              </span>
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            size="sm"
            className="min-w-[100px]"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : mode === "create" ? (
              "Add Vendor"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
