"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"

import RHFInput from "@/components/ui/formfields/RHFInput"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm, FormProvider } from "react-hook-form"
import Image from "next/image"

const schema = z.object({
  Username: z.string().min(3, "Username is required"),
  Password: z.string().min(8, "Password must be at least 8 characters")
})

type FormFields = z.infer<typeof schema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const form = useForm<FormFields>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      Username: "",
      Password: "",
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setError(null);
    try {
      await login(data.Username, data.Password);
      window.location.href = "/app";
    } catch (err: any) {
      if (err.code === "CONFIRM_REVOKE_OLDEST" || err.message === "CONFIRM_REVOKE_OLDEST") {
        setShowRevokeConfirm(true);
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    }
  }

  const handleConfirmRevoke = async () => {
    setShowRevokeConfirm(false);
    setError(null);
    try {
      await login(form.getValues().Username, form.getValues().Password, true);
      window.location.href = "/app";
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>

      <Card className="relative overflow-hidden border-border/50 shadow-xl">
        <a href="#" className="flex items-center gap-2 self-center font-medium mt-8">
          <Image src={"/c-logo.png"} alt="DIEZ_logo" width={180} height={180} />
        </a>

        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Login with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <RHFInput
                  name="Username"
                  label="Username"
                  type="text"
                  placeholder="Enter username"
                />


                <RHFInput
                  name="Password"
                  label="Password"
                  type="password"
                  placeholder="*********"
                />
                <div className="flex justify-end mt-2">
                  <a
                    href="#"
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>


                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>

                <Field>
                  <Button variant="outline" type="button" className="gap-2">
                    <img
                      src="/microft-logo.png"
                      alt="Microsoft"
                      className="h-5 w-5"
                    />
                    Login with Microsoft
                  </Button>

                </Field>




              </FieldGroup>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>

      <AlertDialog open={showRevokeConfirm} onOpenChange={setShowRevokeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Maximum Sessions Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You have reached the maximum number of active sessions. Do you want to sign out from your oldest session to continue logging in?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRevoke} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Yes, Sign Out Oldest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
