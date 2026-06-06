import { AnimatedThemeToggler } from "../animated-theme-toggler";
import { GlobalSearch } from "../global-search";
import AccountDropdown from "./AccountDropdown";
import { AppSignature } from "./AppSignature";
import Notification from "./notification-dropdown";

export function AppTopbar() {
    return (

        <header className="flex h-12 shrink-0 items-center gap-3 px-4 w-full sticky z-20 top-0 border-b !border-muted-foreground/20 bg-background transition-all duration-200 ease-linear">
            <AppSignature />
            <div className="flex flex-1" />
            <GlobalSearch />
            <Notification />
            <AnimatedThemeToggler variant="circle" duration={600} />
            <AccountDropdown />
        </header>
    )
}