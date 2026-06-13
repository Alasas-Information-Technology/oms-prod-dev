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
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { UpdateSecuritySettingsInput } from "@/lib/validations/security-settings.schema";

export function ReplayDetectionCard() {
    const form = useFormContext<UpdateSecuritySettingsInput>();

    const isDetectionEnabled = form.watch("enableReplayDetection");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Refresh Token Replay Detection</CardTitle>
                <CardDescription>
                    Detect and respond to reuse of rotated refresh tokens.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="enableReplayDetection"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Enable Replay Detection
                                </FormLabel>
                                <FormDescription>
                                    Monitor for token reuse anomalies.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {isDetectionEnabled && (
                    <div className="space-y-4 rounded-lg bg-muted p-4">
                        <h4 className="text-sm font-medium leading-none">
                            If replay is detected:
                        </h4>
                        
                        <FormField
                            control={form.control}
                            name="replayActionRevoke"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Revoke Session</FormLabel>
                                        <FormDescription>
                                            Immediately terminate the compromised session.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="replayActionLog"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Log Security Event</FormLabel>
                                        <FormDescription>
                                            Record the event in the audit trail.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="replayActionLogout"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Force Logout User</FormLabel>
                                        <FormDescription>
                                            Revoke all active sessions for the targeted user.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
