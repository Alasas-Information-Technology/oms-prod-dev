import { AppSidebar } from "@/components/ui/layouts/app-sidebar"
import { AppTopbar } from "@/components/ui/layouts/app-topbar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "19rem",
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
