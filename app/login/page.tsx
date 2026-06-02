"use client"

import { LoginForm } from "@/components/login-form"
import { GalleryVerticalEndIcon } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">

        <a href="#" className="flex items-center gap-2 self-center font-medium">
          
          <Image src={"/c-logo.png"} alt="DIEZ_logo" width={180} height={180} />
        
        </a>


        <LoginForm />
      </div>
    </div>
  )
}
