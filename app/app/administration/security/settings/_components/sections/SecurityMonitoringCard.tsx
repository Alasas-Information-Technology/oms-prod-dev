import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SecurityDashboardDto } from "@/lib/types/security.types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
    summary: SecurityDashboardDto | null;
    isLoading: boolean;
}

export function SecurityMonitoringCard({ summary, isLoading }: Props) {
    if (isLoading || !summary) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Security Monitoring</CardTitle>
                    <CardDescription>Loading live metrics...</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                    <span className="text-muted-foreground animate-pulse">Fetching security data...</span>
                </CardContent>
            </Card>
        );
    }

    // Health Score calculation (simple heuristic based on user requirements)
    const failedLoginImpact = Math.min(summary.failedLogins24Hours * 2, 40);
    const replayImpact = Math.min(summary.refreshTokenReplayEvents24Hours * 10, 50);
    const lockedAccountImpact = Math.min(summary.lockedUsers * 5, 30);
    
    const healthScore = Math.max(100 - failedLoginImpact - replayImpact - lockedAccountImpact, 0);

    let healthColor = "#22c55e"; // Green
    let healthText = "Healthy";
    if (healthScore < 70) {
        healthColor = "#ef4444"; // Red
        healthText = "Critical";
    } else if (healthScore < 90) {
        healthColor = "#eab308"; // Yellow
        healthText = "Warning";
    }

    const gaugeData = [
        { name: "Score", value: healthScore, fill: healthColor },
        { name: "Empty", value: 100 - healthScore, fill: "transparent" } // transparent or gray depending on style
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Security Monitoring & Health Dashboard</CardTitle>
                <CardDescription>
                    Live overview of security metrics and system health score.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border rounded-lg p-6 bg-card/50">
                    <div className="flex flex-col items-center justify-center relative h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={gaugeData}
                                    cx="50%"
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={70}
                                    outerRadius={90}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="cell-0" fill={healthColor} />
                                    <Cell key="cell-1" fill="currentColor" className="text-muted" opacity={0.2} />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center" style={{ bottom: '10%' }}>
                            <span className="text-4xl font-bold" style={{ color: healthColor }}>
                                {healthScore}
                            </span>
                            <span className="text-sm text-muted-foreground uppercase tracking-widest mt-1">
                                {healthText}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase text-muted-foreground">System Health Factors</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span>Failed Logins Impact</span>
                                <span className="font-mono text-red-500">-{failedLoginImpact}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Replay Events Impact</span>
                                <span className="font-mono text-red-500">-{replayImpact}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Locked Account Impact</span>
                                <span className="font-mono text-red-500">-{lockedAccountImpact}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <MetricCard title="Active Sessions" value={summary.activeSessions} />
                    <MetricCard title="Locked Users" value={summary.lockedUsers} />
                    <MetricCard title="Failed Logins (24h)" value={summary.failedLogins24Hours} />
                    <MetricCard title="Security Events (24h)" value={summary.securityEvents24Hours} />
                    <MetricCard title="Replay Events (24h)" value={summary.refreshTokenReplayEvents24Hours} />
                </div>
            </CardContent>
        </Card>
    );
}

function MetricCard({ title, value }: { title: string, value: string | number }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col items-center text-center justify-center gap-2">
            <span className="text-xs text-muted-foreground font-medium uppercase">{title}</span>
            <span className="text-2xl font-bold">{value}</span>
        </div>
    );
}
