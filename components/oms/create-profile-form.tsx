"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, Circle } from "lucide-react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const userTypes = ["", "Internal", "External"];
const departments = ["", "IT", "HR", "Finance", "Operations", "Procurement", "Legal", "Marketing", "Sales", "Administration"];
const businessIds = ["", "BUS-001", "BUS-002", "BUS-003", "BUS-004", "BUS-005"];
const sectionIds = ["", "SEC-001", "SEC-002", "SEC-003", "SEC-004", "SEC-005"];

const schema = z.object({
  empId: z.string().min(1, "Employee ID is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  userType: z.string().min(1, "User type is required"),
  userId: z.string().min(1, "User ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z.string().min(8, "Enter a valid mobile number"),
  jobTitle: z.string().min(1, "Job title is required"),
  departmentId: z.string().min(1, "Department is required"),
  businessId: z.string().min(1, "Business ID is required"),
  sectionId: z.string().min(1, "Section ID is required"),
});

type FormValues = z.infer<typeof schema>;

export function CreateProfileForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);

  const { register, handleSubmit, trigger, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      reset();
    }
  }, [open, reset]);

  if (!open) return null;

  const stepFields = {
    1: ["empId", "username", "email", "userType"] as const,
    2: ["firstName", "lastName", "mobile", "jobTitle"] as const,
    3: ["departmentId", "businessId", "sectionId"] as const,
  };

  const nextStep = async () => {
    const valid = await trigger(stepFields[step as 1 | 2 | 3]);
    if (valid) setStep(step + 1);
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50">
      <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-screen flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div><h2 className="text-xl font-semibold">Create Profile</h2><p className="text-sm text-muted-foreground">Create a new user profile for system access</p></div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="grid flex-1 grid-cols-[260px_1fr] gap-6 p-6">
          <aside className="space-y-4">
            <h3 className="text-base font-semibold">Step {step} of 3</h3>
            {["Account Details", "Personal Details", "Organisation Details"].map((label, i) => (
              <button type="button" key={label} className={`flex w-full items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm shadow-sm ${step === i + 1 ? "border-primary text-primary" : "text-muted-foreground"}`}>
                {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {label}
              </button>
            ))}
          </aside>

          <main className="pr-2">
            {step === 1 && (
              <Section title="Account Details" desc="System login and account information.">
                <Field label="Employee ID" error={errors.empId?.message}><Input {...register("empId")} placeholder="EMP-001" /></Field>
                <Field label="Username" error={errors.username?.message}><Input {...register("username")} placeholder="ahmed.khan" /></Field>
                <Field label="Email" error={errors.email?.message}><Input {...register("email")} placeholder="ahmed.khan@diez.ae" /></Field>
                <Field label="User Type" error={errors.userType?.message}><SelectBox register={register("userType")} options={userTypes} /></Field>
              </Section>
            )}

            {step === 2 && (
              <Section title="Personal Details" desc="Employee identity and contact details.">
                <Field label="First Name" error={errors.firstName?.message}><Input {...register("firstName")} placeholder="Ahmed" /></Field>
                <Field label="Last Name" error={errors.lastName?.message}><Input {...register("lastName")} placeholder="Khan" /></Field>
                <Field label="Mobile" error={errors.mobile?.message}><Input {...register("mobile")} placeholder="+971 50 123 4567" /></Field>
                <Field label="Job Title" error={errors.jobTitle?.message}><Input {...register("jobTitle")} placeholder="System Administrator" /></Field>
              </Section>
            )}

            {step === 3 && (
              <Section title="Organisation Details" desc="Department, business, and section mapping.">
                <Field label="Department ID" error={errors.departmentId?.message}><SelectBox register={register("departmentId")} options={departments} /></Field>
                <Field label="Business ID" error={errors.businessId?.message}><SelectBox register={register("businessId")} options={businessIds} /></Field>
                <Field label="Section ID" error={errors.sectionId?.message}><SelectBox register={register("sectionId")} options={sectionIds} /></Field>
              </Section>
            )}
          </main>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between border-t bg-white px-6 py-4">
          <Button type="button" variant="outline" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? "Cancel" : "Back"}</Button>
          <Button type={step === 3 ? "submit" : "button"} onClick={step === 3 ? undefined : nextStep}>{step === 3 ? "Create Profile" : "Next"}</Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return <div className="rounded-xl border bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold">{title}</h3><p className="mb-5 text-sm text-muted-foreground">{desc}</p><div className="grid gap-4 md:grid-cols-2">{children}</div></div>;
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <div><label className="mb-1.5 block text-sm font-medium">{label}</label>{children}{error && <p className="mt-1 text-xs text-red-500">{error}</p>}</div>;
}

function SelectBox({ options, register }: { options: string[]; register: UseFormRegisterReturn }) {
  return <select {...register} className="h-10 w-full rounded-md border bg-white px-3 text-sm">{options.map((o) => <option key={o} value={o}>{o || "Select option"}</option>)}</select>;
}