"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth-shell"
import { OtpInput } from "@/components/otp-input"
import { useAuth } from "@/components/auth-provider"
import { apiRequest, ApiError } from "@/lib/api"
import { getEndpointConfig } from "@/lib/api-endpoints"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<"details" | "otp">("details")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: "", phoneNumber: "", password: "" })
  const [otp, setOtp] = useState("")

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.phoneNumber || !form.password) {
      toast.error("Please fill in all fields.")
      return
    }
    setLoading(true)
    try {
      const config = getEndpointConfig('USERS_SIGNUP_REQUEST')
      const res = await apiRequest(config.path, { method: config.method, body: form })
      toast.success(res.message || "OTP sent to your phone.")
      setStep("otp")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start signup.")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) {
      toast.error("Enter the OTP code.")
      return
    }
    setLoading(true)
    try {
      const config = getEndpointConfig('USERS_SIGNUP_VERIFY')
      const res = await apiRequest(config.path, {
        method: config.method,
        body: { phoneNumber: form.phoneNumber, otpCode: otp },
      })
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
        toast.success("Account created!")
        router.push("/onboarding")
      } else {
        toast.error("Verification did not return tokens.")
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invalid OTP.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={step === "details" ? "Create your account" : "Verify your phone"}
      subtitle={
        step === "details"
          ? "Sign up with your phone number to get started."
          : `Enter the code we sent to ${form.phoneNumber}`
      }
    >
      <Card>
        <CardContent className="pt-6">
          {step === "details" ? (
            <form onSubmit={requestOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="janedoe"
                  autoComplete="username"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? "Sending OTP…" : "Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="flex flex-col gap-5">
              <OtpInput value={otp} onChange={setOtp} />
              <Button type="submit" disabled={loading}>
                {loading ? "Verifying…" : "Verify & create account"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Change details
              </button>
            </form>
          )}
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
