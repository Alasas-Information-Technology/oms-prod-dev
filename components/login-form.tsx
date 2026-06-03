import { cn } from "@/lib/utils"
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"

import RHFInput from "@/components/ui/formfields/RHFInput"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm, FormProvider } from "react-hook-form"

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.Username, password: data.Password }),
      });

      const result = await response.json();

      if (!response.ok || !result.accessToken) {
        throw new Error(result.message || "Login failed");
      }

      await login(result.accessToken, result.session);
      router.push("/app"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                    {error}
                  </div>
                )}
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
    </div>
  )
}
