import { AppSidebar } from "@/components/ui/layouts/app-sidebar"
import { AppTopbar } from "@/components/ui/layouts/app-topbar"
import { AppBreadcrumb } from "@/components/ui/layouts/app-breadcrumb"
import {
    SidebarInset,
    SidebarProvider
} from "@/components/ui/sidebar"
import { LayoutGroup } from "motion/react"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "16rem",
                } as React.CSSProperties
            }
        >
            <LayoutGroup id="main-layout">
                <AppSidebar />
                <div className="flex flex-1 bg-slate-50/50 dark:bg-zinc-950/50 min-h-screen">
                    <SidebarInset className="bg-transparent flex flex-col">
                        <AppTopbar />
                        <main className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col max-w-[1600px] mx-auto w-full">
                            <AppBreadcrumb />
                            {children}

                        </main>
                    </SidebarInset>
                </div>
            </LayoutGroup>

        </SidebarProvider>
    )
}
