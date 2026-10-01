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

export function AccountLockoutCard() {
    const form = useFormContext<UpdateSecuritySettingsInput>();

    const attempts = form.watch("maxFailedLoginAttempts");
    const duration = form.watch("lockoutDuration");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Lockout Policy</CardTitle>
                <CardDescription>
                    Protect user accounts against brute-force attacks by locking them out.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="maxFailedLoginAttempts"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maximum Failed Login Attempts</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                />
                            </FormControl>
                            <FormDescription>
                                Number of failures allowed before account is locked.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lockoutDuration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lockout Duration (Minutes)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                />
                            </FormControl>
                            <FormDescription>
                                How long an account stays locked before it can be used again.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Preview:</strong> 
                        A user account will be locked for {duration} minutes after {attempts} failed login attempts.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
