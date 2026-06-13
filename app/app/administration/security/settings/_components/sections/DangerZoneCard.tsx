import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SecurityDashboardDto } from "@/lib/types/security.types";

interface Props {
    summary: SecurityDashboardDto | null;
}

export function DangerZoneCard({ summary }: Props) {
    const [isRevoking, setIsRevoking] = useState(false);

    const handleForceLogoutAll = async () => {
        try {
            setIsRevoking(true);
            await axios.post("/api/internal/security/sessions/revoke-all");
            toast.success("Successfully forced logout for all users.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to force logout all users.");
        } finally {
            setIsRevoking(false);
        }
    };

    const handleGenerateSnapshot = () => {
        if (!summary) {
            toast.error("Dashboard data is not ready yet.");
            return;
        }
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(summary, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `security-audit-snapshot-${new Date().toISOString()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        toast.success("Security audit snapshot generated successfully.");
    };

    return (
        <Card className="border-red-200 dark:border-red-900 shadow-sm">
            <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                <CardDescription>
                    Destructive actions that immediately impact all active users and sessions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                    <div className="space-y-1 mb-4 sm:mb-0">
                        <p className="font-medium text-sm">Force Logout All Users</p>
                        <p className="text-sm text-muted-foreground">
                            Immediately revokes all sessions and forces every user to re-authenticate.
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isRevoking}>
                                {isRevoking ? "Revoking..." : "Force Logout All Users"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. It will instantly terminate all active sessions across the entire system.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleForceLogoutAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Yes, Force Logout All
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1 mb-4 sm:mb-0">
                        <p className="font-medium text-sm">Generate Security Audit Snapshot</p>
                        <p className="text-sm text-muted-foreground">
                            Export the current security dashboard metrics and active settings to a JSON file.
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleGenerateSnapshot}>
                        Generate Snapshot
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
