"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { customerLoginRequest, customerLoginVerify } from "@/lib/services"
import { OtpInput } from "@/components/otp-input"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ShoppingBag } from "lucide-react"

export default function CustomerLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!username) {
      toast.error("Please enter your username.")
      return
    }

    if (!password) {
      toast.error("Please enter your password.")
      return
    }

    if (!phoneNumber) {
      toast.error("Please enter your phone number.")
      return
    }

    setLoading(true)
    try {
      const body = {
        username,
        password,
        phoneNumber,
      }
      
      await customerLoginRequest(body)
      toast.success("OTP sent to your phone.")
      setStep("otp")
    } catch (err) {
      toast.error("Could not send OTP. Please check your credentials.")
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
      const res = await customerLoginVerify({ phoneNumber, otpCode: otp })
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
      }
      toast.success("Login successful!")
      router.push("/customer")
    } catch (err) {
      toast.error("Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <button
              onClick={() => router.back()}
              className="mb-2 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5" />
              {step === "credentials" ? "Customer Login" : "Verify your phone"}
            </CardTitle>
            <CardDescription>
              {step === "credentials"
                ? "Enter your credentials. An OTP will be sent to confirm."
                : "Enter the OTP sent to your registered phone number."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "credentials" ? (
              <form onSubmit={requestOtp} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Sending OTP…" : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="flex flex-col gap-5">
                <OtpInput value={otp} onChange={setOtp} />
                <Button type="submit" disabled={loading}>
                  {loading ? "Verifying…" : "Complete login"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Edit credentials
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
