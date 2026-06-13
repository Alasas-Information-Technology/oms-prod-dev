import { useFormContext } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UpdateSecuritySettingsInput } from "@/lib/validations/security-settings.schema";
import { SecurityDashboardDto } from "@/lib/types/security.types";

interface Props {
    summary: SecurityDashboardDto | null;
}

export function ConcurrentSessionPolicyCard({ summary }: Props) {
    const form = useFormContext<UpdateSecuritySettingsInput>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Concurrent Session Controls</CardTitle>
                <CardDescription>
                    Manage active sessions and session revocation policies.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                    <div className="space-y-0.5">
                        <span className="text-sm font-medium">Current Active Sessions</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {summary?.activeSessions ?? "..."}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="maxConcurrentSessions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maximum Concurrent Sessions</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                />
                            </FormControl>
                            <FormDescription>
                                Maximum active sessions allowed per user (1 - 20).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="autoRevokeOldestSession"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Behavior if Limit Exceeded</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(val) => field.onChange(val === "true")}
                                    value={field.value ? "true" : "false"}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="true" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Revoke Oldest Session
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="false" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Deny New Login
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
