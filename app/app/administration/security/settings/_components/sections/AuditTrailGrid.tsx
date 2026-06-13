import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Placeholder data for demonstration
const AUDIT_LOGS = [
    { id: 1, changedBy: "admin@corp.com", setting: "Maximum Concurrent Sessions", oldVal: "3", newVal: "5", date: "2026-06-12 14:30:00" },
    { id: 2, changedBy: "security_lead@corp.com", setting: "Access Token Lifetime", oldVal: "15", newVal: "30", date: "2026-06-11 09:15:22" },
    { id: 3, changedBy: "system_auto", setting: "Enable Replay Detection", oldVal: "false", newVal: "true", date: "2026-06-10 18:00:00" },
    { id: 4, changedBy: "admin@corp.com", setting: "Lockout Duration", oldVal: "15", newVal: "30", date: "2026-06-09 11:45:10" },
];

export function AuditTrailGrid() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                    Recent modifications to security administration settings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Changed By</TableHead>
                                <TableHead>Setting</TableHead>
                                <TableHead>Old Value</TableHead>
                                <TableHead>New Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {AUDIT_LOGS.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {log.date}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {log.changedBy}
                                    </TableCell>
                                    <TableCell>{log.setting}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400">
                                            {log.oldVal}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400">
                                            {log.newVal}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" disabled>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
