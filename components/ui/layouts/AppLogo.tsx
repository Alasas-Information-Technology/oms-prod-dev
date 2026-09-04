import Image from "next/image";

export function AppLogo() {
  return (
    <div className="flex items-center h-[52px] py-2">
      <Image
        src="/c-logo.png"
        alt="DIEZ"
        height={28}
        width={112}
        priority
        style={{ width: "auto", height: "28px" }}
      />
    </div>
  );
}
