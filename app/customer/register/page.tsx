"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { customerRegisterRequest, customerRegisterVerify } from "@/lib/services"
import { OtpInput } from "@/components/otp-input"
import { AddressMapPicker, type LocationValue } from "@/components/address-map-picker"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import type { Gender } from "@/lib/types"

export default function CustomerRegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<"details" | "otp">("details")
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  
  const [location, setLocation] = useState<LocationValue>({ address: "", lat: null, lng: null })
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState<Gender | "">("")

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!location.address || location.lat === null || location.lng === null) {
      toast.error("Please select a location on the map.")
      return
    }

    if (!dob) {
      toast.error("Please enter your date of birth.")
      return
    }

    if (!gender) {
      toast.error("Please select your gender.")
      return
    }

    setLoading(true)
    try {
      const body = {
        dob: new Date(dob).toISOString(),
        gender: gender,
        lat: location.lat,
        lng: location.lng,
      }
      
      await customerRegisterRequest(body)
      toast.success("OTP sent to your phone.")
      setStep("otp")
    } catch (err) {
      toast.error("Could not send OTP. Please try again.")
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
      const res = await customerRegisterVerify({ otpCode: otp })
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
      }
      toast.success("Registered as Customer!")
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
              {step === "details" ? "Register as Customer" : "Verify your phone"}
            </CardTitle>
            <CardDescription>
              {step === "details"
                ? "Tell us a few details. An OTP will be sent to confirm."
                : "Enter the OTP sent to your registered phone number."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "details" ? (
              <form onSubmit={requestOtp} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dob">Date of birth</Label>
                    <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <AddressMapPicker
                  value={location}
                  onChange={setLocation}
                  label="Your address"
                />

                <Button type="submit" disabled={loading}>
                  {loading ? "Sending OTP…" : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="flex flex-col gap-5">
                <OtpInput value={otp} onChange={setOtp} />
                <Button type="submit" disabled={loading}>
                  {loading ? "Verifying…" : "Complete registration"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Edit details
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
