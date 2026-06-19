"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "../ui/progress";

const urgentApprovals = [
    { id: "REQ-2026-012", position: "HR Executive", requestedBy: "Sarah Ali", department: "HR", submittedDate: "09-Feb-2026", deadline: "11-Mar-2026", daysLeft: 4, slaUsed: 86 },
    { id: "REQ-2026-017", position: "Recruitment Specialist", requestedBy: "Ali Hamad", department: "HR", submittedDate: "14-Feb-2026", deadline: "16-Mar-2026", daysLeft: 7, slaUsed: 76 },
    { id: "REQ-2026-014", position: "Procurement Officer", requestedBy: "Fatima Hassan", department: "Procurement", submittedDate: "11-Feb-2026", deadline: "13-Mar-2026", daysLeft: 6, slaUsed: 80 },
];

export function MostUrgentApprovalWidget() {
    const [index, setIndex] = useState(0);
    const item = urgentApprovals[index];

    const next = () => setIndex((prev) => (prev + 1) % urgentApprovals.length);
    const prev = () => setIndex((prev) => (prev === 0 ? urgentApprovals.length - 1 : prev - 1));

    return (
        <div className="h-[220px] rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Approval Nearest to SLA Breach
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold">{item.id}</h2>
                        <p className="text-sm text-muted-foreground">{item.position} • {item.department}</p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Days remaining</p>
                        <p className="text-3xl font-bold text-red-600">{item.daysLeft}</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Requested by</p>
                        <p className="font-medium">{item.requestedBy}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">{item.submittedDate}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="font-medium">{item.deadline}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">SLA used</p>
                        <p className="font-medium">{item.slaUsed}%</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">

                    <Progress  value={item.slaUsed || 0} className="[&>*]:bg-yellow-500" />


                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={prev}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button size="icon" onClick={next}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}