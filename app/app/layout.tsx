import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/ui/layouts/app-topbar"
import {
    SidebarInset,
    SidebarProvider
} from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "17rem",
                } as React.CSSProperties
            }
        >
            <AppTopbar />

            <div className="flex flex-1 pt-12">
                <AppSidebar />

                <SidebarInset>



                    {
                        children
                    }
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
