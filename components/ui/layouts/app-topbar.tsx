import { AnimatedThemeToggler } from "../animated-theme-toggler";
import { Separator } from "../separator";
import { SidebarTrigger } from "../sidebar";
import Image from "next/image";
import AccountDropdown from "./AccountDropdown";

export function AppTopbar() {
    return (

        <header className="flex h-12 shrink-0 items-center gap-2 px-4 w-full fixed z-20 top-0 left-0 border-b border-muted/50">
            <Image src={"/c-logo.png"} alt="DIEZ_logo" className="ml-0" width={80} height={32} />
            <Separator orientation="vertical" className="my-2 h-8 mx-3" />
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1" />
            <AnimatedThemeToggler variant="rectangle" duration={500} />
            <AccountDropdown />
        </header>
    )
}