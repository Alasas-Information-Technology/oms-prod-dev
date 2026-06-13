import { Metadata } from "next";
import { getAuthSession } from "@/app/actions/auth";
import { SecuritySettingsDashboard } from "./_components/SecuritySettingsDashboard";

export const metadata: Metadata = {
    title: "Security Settings",
    description: "Manage security administration settings for the OMS Portal.",
};

export default async function SecuritySettingsPage() {
    const user = await getAuthSession();

    if (!user || user === "REFRESH_REQUIRED") {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-red-600">401</h1>
                    <p className="text-xl font-semibold">Unauthorized</p>
                    <p className="text-muted-foreground">You must be logged in to view this page.</p>
                </div>
            </div>
        );
    }

    if (!user.permissions.includes("SECURITY.ADMIN")) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-red-600">403</h1>
                    <p className="text-xl font-semibold">Forbidden</p>
                    <p className="text-muted-foreground">You do not have the required permissions (SECURITY.ADMIN) to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-7xl">
            <SecuritySettingsDashboard />
        </div>
    );
}
