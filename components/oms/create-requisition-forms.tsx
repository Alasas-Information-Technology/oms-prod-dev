"use client";

import { useState } from "react";
import { X, CheckCircle2, Circle } from "lucide-react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const departments = ["", "IT", "HR", "Finance", "Operations", "Procurement", "Legal", "Marketing", "Sales", "Administration", "Customer Service"];
const positions = ["", "Software Engineer", "Business Analyst", "Project Manager", "HR Executive", "Financial Analyst", "Procurement Officer", "Operations Coordinator", "Accountant", "Systems Administrator", "Recruitment Specialist"];
const people = ["", "Ahmed Khan", "Sarah Ali", "Mohammed Noor", "Fatima Hassan", "Omar Saleh", "Aisha Rahman", "Ali Hamad", "Noura Ahmed", "Khalid Saeed", "Mariam Yusuf"];
const budgetLines = ["BL-1001 Recruitment", "BL-1002 IT Infrastructure", "BL-1003 ERP Upgrade", "BL-1004 Training", "BL-1005 Operations", "BL-1006 Procurement"];
const hardware = ["Laptop", "Desktop", "Monitor", "Docking Station", "Keyboard", "Mouse", "Headset", "Mobile Phone"];
const software = ["Microsoft 365", "Teams", "Outlook", "SAP", "Oracle ERP", "Power BI", "Jira", "VPN Access"];

const schema = z.object({
  department: z.string().min(1, "Department is required"),
  positionName: z.string().min(1, "Position is required"),
  jobProfile: z.string().min(1, "Job profile is required").max(150, "Max 150 characters"),
  noOfResources: z.coerce.number().min(1, "Minimum 1 resource"),
  salaryGrade: z.string().min(1, "Salary grade is required"),
  candidateType: z.string().min(1, "Candidate type is required"),
  budgetType: z.string().min(1, "Budget type is required"),
  budgetAmount: z.string().min(1, "Budget amount is required"),
  budgetLine: z.array(z.string()).min(1, "Select at least one budget line"),

  reportingManager: z.string().min(1, "Reporting manager is required"),
  interviewers: z.array(z.string()).min(1, "Select at least one interviewer"),
  mainInterviewer: z.string().min(1, "Main interviewer is required"),
  workCompletionAssignee: z.string().min(1, "Assignee is required"),
  engagementPeriod: z.string().min(1, "Engagement period is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),

  workLocation: z.string().min(1, "Work location is required"),
  officeSpace: z.string().min(1, "Office space is required"),
  seatingLocation: z.string().min(1, "Seating location is required"),
  hardwareRequirements: z.array(z.string()).min(1, "Select at least one hardware item"),
  softwareRequirements: z.array(z.string()).min(1, "Select at least one software item"),
  businessJustification: z.string().min(1, "Business justification is required").max(500, "Max 500 characters"),
});

type FormValues = z.infer<typeof schema>;

export function CreateRequisitionForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      budgetLine: [],
      interviewers: [],
      hardwareRequirements: [],
      softwareRequirements: [],
    },
  });

  if (!open) return null;

  const stepFields = {
    1: ["department", "positionName", "jobProfile", "noOfResources", "salaryGrade", "candidateType", "budgetType", "budgetAmount", "budgetLine"] as const,
    2: ["reportingManager", "interviewers", "mainInterviewer", "workCompletionAssignee", "engagementPeriod", "startDate", "endDate"] as const,
    3: ["workLocation", "officeSpace", "seatingLocation", "hardwareRequirements", "softwareRequirements", "businessJustification"] as const,
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
          <div><h2 className="text-xl font-semibold">Create Requisition</h2><p className="text-sm text-muted-foreground">Complete the requisition details before submission</p></div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="grid flex-1 grid-cols-[260px_1fr] gap-6 p-6">
          <aside className="space-y-4">
            <h3 className="text-base font-semibold">Step {step} of 3</h3>
            {["Basic & Budget", "People & Engagement", "Work Setup & Review"].map((label, i) => (
              <button type="button" key={label} className={`flex w-full items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm shadow-sm ${step === i + 1 ? "border-primary text-primary" : "text-muted-foreground"}`}>
                {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {label}
              </button>
            ))}
          </aside>

          <main className="pr-2">
            {step === 1 && (
              <div className="space-y-5">
                <Section title="Basic Details" desc="Information about the manpower requisition.">
                  <Field label="Department" error={errors.department?.message}><SelectBox register={register("department")} options={departments} /></Field>
                  <Field label="Position Name / Job Title" error={errors.positionName?.message}><SelectBox register={register("positionName")} options={positions} /></Field>
                  <Field label="Job Profile" error={errors.jobProfile?.message}><Textarea maxLength={150} {...register("jobProfile")} placeholder="Enter job profile description..." /></Field>
                  <Field label="No. of Resources" error={errors.noOfResources?.message}><Input type="number" {...register("noOfResources")} /></Field>
                  <Field label="Salary Grade" error={errors.salaryGrade?.message}><SelectBox register={register("salaryGrade")} options={["", "Grade 1", "Grade 2", "Grade 3", "Grade 4"]} /></Field>
                  <Field label="Candidate Type" error={errors.candidateType?.message}><SelectBox register={register("candidateType")} options={["", "Known Candidate", "Unknown Candidate"]} /></Field>
                </Section>

                <Section title="Budget Details" desc="Budget source and estimated cost.">
                  <Field label="Budget Type" error={errors.budgetType?.message}><SelectBox register={register("budgetType")} options={["", "Budgeted", "Unbudgeted", "Unallocated"]} /></Field>
                  <Field label="Budget Amount" error={errors.budgetAmount?.message}><MoneyInput register={register("budgetAmount")} /></Field>
                  <Field label="Budget Line" error={errors.budgetLine?.message}><MultiSelectDropdown options={budgetLines} value={watch("budgetLine")} onChange={(v) => setValue("budgetLine", v, { shouldValidate: true })} placeholder="Select budget line(s)" /></Field>
                </Section>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <Section title="People Assignment" desc="Assign managers, interviewers, and completion owners.">
                  <Field label="Reporting Line Manager" error={errors.reportingManager?.message}><SelectBox register={register("reportingManager")} options={people} /></Field>
                  <Field label="Interviewer(s)" error={errors.interviewers?.message}><MultiSelectDropdown options={people.filter(Boolean)} value={watch("interviewers")} onChange={(v) => setValue("interviewers", v, { shouldValidate: true })} placeholder="Select interviewer(s)" /></Field>
                  <Field label="Main Interviewer" error={errors.mainInterviewer?.message}><SelectBox register={register("mainInterviewer")} options={people} /></Field>
                  <Field label="Work Completion Assignee" error={errors.workCompletionAssignee?.message}><SelectBox register={register("workCompletionAssignee")} options={people} /></Field>
                </Section>

                <Section title="Engagement Details" desc="Expected engagement duration and dates.">
                  <Field label="Engagement Period" error={errors.engagementPeriod?.message}><SelectBox register={register("engagementPeriod")} options={["", ...Array.from({ length: 24 }, (_, i) => `${i + 1} Month${i === 0 ? "" : "s"}`)]} /></Field>
                  <Field label="Expected Start Date" error={errors.startDate?.message}><Input type="date" {...register("startDate")} /></Field>
                  <Field label="Expected End Date" error={errors.endDate?.message}><Input type="date" {...register("endDate")} /></Field>
                </Section>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <Section title="Work Setup" desc="Work location, seating, software, and hardware needs.">
                  <Field label="Work Location" error={errors.workLocation?.message}><SelectBox register={register("workLocation")} options={["", "DIEZA Premises", "UAE Remote (WFH)", "UAE Remote (Vendor Office)", "Remote (Abroad)", "Hybrid"]} /></Field>
                  <Field label="Office Space Available" error={errors.officeSpace?.message}><SelectBox register={register("officeSpace")} options={["", "Yes", "No", "Pending Allocation"]} /></Field>
                  <Field label="Seating Location" error={errors.seatingLocation?.message}><SelectBox register={register("seatingLocation")} options={["", "Head Office", "Branch Office", "Shared Workspace", "Vendor Office", "Remote"]} /></Field>
                  <Field label="Hardware Requirements" error={errors.hardwareRequirements?.message}><MultiSelectDropdown options={hardware} value={watch("hardwareRequirements")} onChange={(v) => setValue("hardwareRequirements", v, { shouldValidate: true })} placeholder="Select hardware" /></Field>
                  <Field label="Software Requirements" error={errors.softwareRequirements?.message}><MultiSelectDropdown options={software} value={watch("softwareRequirements")} onChange={(v) => setValue("softwareRequirements", v, { shouldValidate: true })} placeholder="Select software" /></Field>
                </Section>

                <Section title="Attachments & Justification" desc="Upload required documents and provide business justification." fullWidth>
                  <div className="grid gap-6 md:grid-cols-[350px_1fr]">
                    <div className="grid content-start gap-7">
                      <Field label="CV Attachment"><Input type="file" /></Field>
                      <Field label="Supporting Attachments"><Input type="file" /></Field>
                    </div>
                    <Field label="Business Justification" error={errors.businessJustification?.message}><Textarea maxLength={500} className="min-h-[220px]" {...register("businessJustification")} placeholder="Explain why this outsourced resource is required..." /></Field>
                  </div>
                </Section>
              </div>
            )}
          </main>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between border-t bg-white px-6 py-4">
          <Button type="button" variant="outline" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? "Cancel" : "Back"}</Button>
          <Button type={step === 3 ? "submit" : "button"} onClick={step === 3 ? undefined : nextStep}>{step === 3 ? "Submit Requisition" : "Next"}</Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, desc, children, fullWidth = false }: { title: string; desc: string; children: React.ReactNode; fullWidth?: boolean }) {
  return <div className="rounded-xl border bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold">{title}</h3><p className="mb-5 text-sm text-muted-foreground">{desc}</p><div className={fullWidth ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>{children}</div></div>;
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <div><label className="mb-1.5 block text-sm font-medium">{label}</label>{children}{error && <p className="mt-1 text-xs text-red-500">{error}</p>}</div>;
}

function SelectBox({ options, register }: { options: string[]; register: UseFormRegisterReturn }) {
  return <select {...register} className="h-10 w-full rounded-md border bg-white px-3 text-sm">{options.map((o) => <option key={o} value={o}>{o || "Select option"}</option>)}</select>;
}

function MoneyInput({ register }: { register: UseFormRegisterReturn }) {
  return <div className="flex h-10 overflow-hidden rounded-md border bg-white"><span className="flex items-center border-r bg-slate-50 px-3 text-sm text-muted-foreground">AED</span><input {...register} className="w-full px-3 text-sm outline-none" placeholder="25000" /></div>;
}

function MultiSelectDropdown({ placeholder, options, value = [], onChange }: { placeholder: string; options: string[]; value?: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (option: string) => onChange(value.includes(option) ? value.filter((x) => x !== option) : [...value, option]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm">
        <span className={value.length ? "" : "text-muted-foreground"}>{value.length ? `${value.length} selected` : placeholder}</span>
        <span className="text-muted-foreground">⌄</span>
      </button>
      {open && <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-md border bg-white p-2 shadow-lg">{options.map((o) => <label key={o} className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-slate-50"><input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} />{o}</label>)}</div>}
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${props.className ?? ""}`} />;
}