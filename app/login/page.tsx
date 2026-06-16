"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth-shell"
import { OtpInput } from "@/components/otp-input"
import { useAuth } from "@/components/auth-provider"
import { apiRequest, ApiError, decodeToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

const roleHome: Record<string, string> = {
  CUSTOMER: "/customer",
  RESTAURANT: "/restaurant",
  RIDER: "/rider",
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<"details" | "otp">("details")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: "", password: "", phoneNumber: "" })
  const [otp, setOtp] = useState("")

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password || !form.phoneNumber) {
      toast.error("Please fill in all fields.")
      return
    }
    setLoading(true)
    try {
      const res = await apiRequest("/users/login/request", { method: "POST", body: form })
      toast.success(res.message || "OTP sent to your phone.")
      setStep("otp")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start login.")
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
      const res = await apiRequest("/users/login/verify", {
        method: "POST",
        body: { phoneNumber: form.phoneNumber, otpCode: otp },
      })
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
        const { roles } = decodeToken(res.accessToken)
        const primary = roles.find((r) => r !== "USER")
        toast.success("Welcome back!")
        router.push(primary ? roleHome[primary] || "/onboarding" : "/onboarding")
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
      title={step === "details" ? "Welcome back" : "Verify your phone"}
      subtitle={
        step === "details" ? "Log in to your account." : `Enter the code we sent to ${form.phoneNumber}`
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
                  autoComplete="current-password"
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
                {loading ? "Verifying…" : "Verify & log in"}
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
        New to Swigg?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
