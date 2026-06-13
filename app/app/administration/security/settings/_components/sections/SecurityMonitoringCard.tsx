import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SecurityDashboardDto } from "@/lib/types/security.types";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <SimpleKpiCard
                        title="Active Sessions"
                        value={summary.activeSessions || 0}
                        icon="mdi:shield-account"
                        description="Currently active"
                        color="text-blue-600"
                        bg="bg-blue-100"
                    />
                    <SimpleKpiCard
                        title="Locked Users"
                        value={summary.lockedUsers || 0}
                        icon="mdi:lock-outline"
                        description="Requires admin unlock"
                        color="text-orange-600"
                        bg="bg-orange-100"
                    />
                    <SimpleKpiCard
                        title="Failed Logins"
                        value={summary.failedLogins24Hours || 0}
                        icon="mdi:alert-circle-outline"
                        description="Last 24 hours"
                        color="text-red-600"
                        bg="bg-red-100"
                    />
                    <SimpleKpiCard
                        title="Security Events"
                        value={summary.securityEvents24Hours || 0}
                        icon="mdi:shield-alert-outline"
                        description="Last 24 hours"
                        color="text-purple-600"
                        bg="bg-purple-100"
                    />
                    <SimpleKpiCard
                        title="Replay Events"
                        value={summary.refreshTokenReplayEvents24Hours || 0}
                        icon="mdi:shield-alert"
                        description="Last 24 hours"
                        color="text-red-700"
                        bg="bg-red-200 dark:bg-red-500/20"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
