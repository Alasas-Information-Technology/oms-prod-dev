import Image from "next/image";
import { SidebarTrigger } from "../sidebar";

export function AppSignature() {
    return (
        <div className="flex items-center gap-2 h-12 w-full">
            <Image src={"/c-logo.png"} alt="DIEZ_logo" className="ml-0 !dark:invert" width={80} height={32} />
            {/* <span className="text-md font-semibold whitespace-nowrap">
                Diez OMS
            </span> */}
            <div className="flex flex-1" />
            <SidebarTrigger className="-ml-1" />
        </div>

    )
}