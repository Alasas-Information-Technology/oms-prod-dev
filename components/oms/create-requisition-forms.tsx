"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateRequisitionForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  const steps = ["Basic & Budget", "People & Engagement", "Work Setup & Review"];

  const content = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0 }} className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold">Create Requisition</h2>
          <p className="text-sm text-muted-foreground">Complete the requisition details before submission</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "1.5rem",
          padding: "1.5rem",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Sidebar */}
        <aside className="space-y-4" style={{ overflowY: "auto" }}>
          <h3 className="text-base font-semibold">Step {step} of 3</h3>
          <div className="space-y-3">
            {steps.map((label, index) => {
              const current = step === index + 1;
              const done = step > index + 1;
              return (
                <button
                  key={label}
                  onClick={() => setStep(index + 1)}
                  className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm shadow-sm ${
                    current ? "border-primary text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    {label}
                  </span>
                  {current && <span className="h-2 w-2 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main scrollable area — using inline styles to guarantee scroll works */}
        <main
          style={{
            overflowY: "scroll",
            minHeight: 0,
            paddingRight: "0.5rem",
          }}
        >
          {step === 1 && (
            <div className="space-y-5">
              <Section title="Basic Details" desc="Information about the manpower requisition.">
                <Field label="Department"><Input placeholder="Select department" /></Field>
                <Field label="Position Name / Job Title"><Input placeholder="Software Engineer" /></Field>
                <Field label="Job Profile"><Input placeholder="Enter job profile" /></Field>
                <Field label="No. of Resources"><Input type="number" placeholder="2" /></Field>
                <Field label="Salary Grade"><Input placeholder="Grade 1 / Grade 2" /></Field>
                <Field label="Candidate Type"><Input placeholder="Known / Unknown Candidate" /></Field>
              </Section>
              <Section title="Budget Details" desc="Budget source and estimated cost.">
                <Field label="Budget Amount"><Input placeholder="AED 25,000" /></Field>
                <Field label="Budget Type"><Input placeholder="Budgeted / Unbudgeted / Unallocated" /></Field>
                <Field label="Budget Line"><Input placeholder="Select budget line" /></Field>
              </Section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Section title="People Assignment" desc="Assign managers, interviewers, and completion owners.">
                <Field label="Reporting Line Manager"><Input placeholder="Manager name" /></Field>
                <Field label="Interviewer(s)"><Input placeholder="Add interviewer(s)" /></Field>
                <Field label="Main Interviewer"><Input placeholder="Select main interviewer" /></Field>
                <Field label="Work Completion Assignee"><Input placeholder="Assignee name" /></Field>
              </Section>
              <Section title="Engagement Details" desc="Expected engagement duration and dates.">
                <Field label="Engagement Period"><Input placeholder="6 months" /></Field>
                <Field label="Expected Start Date"><Input type="date" /></Field>
                <Field label="Expected End Date"><Input type="date" /></Field>
              </Section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Section title="Work Setup" desc="Work location, seating, software, and hardware needs.">
                <Field label="Work Location"><Input placeholder="DIEZA Premises / UAE Remote / Vendor Office / Abroad" /></Field>
                <Field label="Office Space Available"><Input placeholder="Yes / No" /></Field>
                <Field label="Seating Location"><Input placeholder="Office / floor / location" /></Field>
                <Field label="Software Requirements"><Input placeholder="Email, apps, access..." /></Field>
                <Field label="Hardware Requirements"><Input placeholder="Laptop, monitor, phone..." /></Field>
              </Section>
              <Section title="Attachments & Justification" desc="Upload required documents and provide business justification.">
                <Field label="CV Attachment if Known"><Input type="file" /></Field>
                <Field label="Job Description if Unknown"><Input type="file" /></Field>
                <Field label="Supporting Attachments"><Input type="file" /></Field>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Business Justification</label>
                  <textarea
                    className="min-h-28 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Explain why this outsourced resource is required..."
                  />
                </div>
              </Section>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0 }} className="flex items-center justify-between border-t bg-white px-6 py-4">
        <Button variant="outline" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        <Button onClick={step === 3 ? onClose : () => setStep(step + 1)}>
          {step === 3 ? "Submit Requisition" : "Next"}
        </Button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mb-5 text-sm text-muted-foreground">{desc}</p>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}