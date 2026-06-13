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
import { Switch } from "@/components/ui/switch";
import { UpdateSecuritySettingsInput } from "@/lib/validations/security-settings.schema";

export function AuthenticationPoliciesCard() {
    const form = useFormContext<UpdateSecuritySettingsInput>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>
                    Manage basic authentication behavior and session lifespans.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="accessTokenLifetime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Access Token Lifetime (minutes)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                />
                            </FormControl>
                            <FormDescription>
                                Lifespan of the short-lived access token (5 - 60 mins).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="refreshTokenLifetime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Refresh Token Lifetime (days)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                />
                            </FormControl>
                            <FormDescription>
                                Lifespan of the long-lived refresh token (1 - 90 days).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="requireSessionFingerprinting"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Require Session Fingerprinting
                                </FormLabel>
                                <FormDescription>
                                    Validate device fingerprint during session validation.
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

                <FormField
                    control={form.control}
                    name="allowMultipleSessions"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Allow Multiple Concurrent Sessions
                                </FormLabel>
                                <FormDescription>
                                    Allow users to login from multiple devices simultaneously.
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
            </CardContent>
        </Card>
    );
}
