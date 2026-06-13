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
import { UpdateSecuritySettingsInput } from "@/lib/validations/security-settings.schema";

export function RetentionPolicyCard() {
    const form = useFormContext<UpdateSecuritySettingsInput>();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Audit Retention</CardTitle>
                <CardDescription>
                    Configure how long security logs and histories are stored.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="securityEventsRetention"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Security Events Retention (Days)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="loginHistoryRetention"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Login History Retention (Days)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="logoutHistoryRetention"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logout History Retention (Days)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="failedLoginRetention"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Failed Login Retention (Days)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
