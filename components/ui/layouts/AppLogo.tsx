import Image from "next/image";
import { cn } from "../utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className="flex items-center h-[20px] py-2">
      <Image
        src="/logos/Logo_DIEZ_xl.svg"
        alt="DIEZ"
        height={28}
        width={140}
        priority
        style={{ width: "auto" }}
        className={cn("h-12 w-auto object-contain cursor-pointer", className)}
      />
    </div>
  );
}
