"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { useRequireRole } from "@/lib/use-require-role"
import { apiRequest, ApiError, getAccessToken } from "@/lib/api"
import { getCustomer, getRestaurant, getRider } from "@/lib/services"
import { AddressMapPicker, type LocationValue } from "@/components/address-map-picker"
import { OtpInput } from "@/components/otp-input"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag, Store, Bike, ArrowLeft, Check, Trash2 } from "lucide-react"
import type { Gender, Role } from "@/lib/types"

type Choice = "CUSTOMER" | "RESTAURANT" | "RIDER"

const roleMeta: Record<Choice, { icon: typeof ShoppingBag; title: string; desc: string; base: string }> = {
  CUSTOMER: { icon: ShoppingBag, title: "Customer", desc: "Order food from restaurants near you.", base: "customers" },
  RESTAURANT: { icon: Store, title: "Restaurant", desc: "List your menu and take orders.", base: "restaurants" },
  RIDER: { icon: Bike, title: "Rider", desc: "Deliver orders and earn.", base: "riders" },
}

const roleHome: Record<Choice, string> = {
  CUSTOMER: "/customer",
  RESTAURANT: "/restaurant",
  RIDER: "/rider",
}

export default function OnboardingPage() {
  const { ready } = useRequireRole()
  const router = useRouter()
  const { roles, selectRole, login, logout } = useAuth()

  const [choice, setChoice] = useState<Choice | null>(null)
  const [step, setStep] = useState<"details" | "otp">("details")
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [deletingUser, setDeletingUser] = useState(false)
  const [deleteUserStep, setDeleteUserStep] = useState<"confirm" | "otp">("confirm")
  const [deleteUserOtp, setDeleteUserOtp] = useState("")
  const [userData, setUserData] = useState<{ userId?: string; email?: string; phone?: string } | null>(null)

  // shared fields
  const [location, setLocation] = useState<LocationValue>({ address: "", lat: null, lng: null })
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState<Gender | "">("")
  const [description, setDescription] = useState("")
  const [imageurl, setImageurl] = useState("")
  const [opentime, setOpentime] = useState("")
  const [closetime, setClosetime] = useState("")
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [dlNumber, setDlNumber] = useState("")

  // Fetch user profile on mount and check entity data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = getAccessToken()
      if (!token) return

      try {
        const profile = await apiRequest<{ 
          roles: Role[]; 
          registeredRoles: Role[]; 
          userId?: string; 
          email?: string; 
          phone?: string;
          customerId?: string;
          restaurantId?: string;
          riderId?: string;
        }>("/auth/me", { auth: true })
        
        setUserData({
          userId: profile.data?.userId,
          email: profile.data?.email,
          phone: profile.data?.phone,
        })

        // If user has registered roles, check if entity data exists
        if (profile.data?.registeredRoles && profile.data.registeredRoles.length > 0) {
          const firstRole = profile.data.registeredRoles[0] as Choice
          
          // Check if entity data exists by calling the specific endpoint
          try {
            if (firstRole === "CUSTOMER" && profile.data.customerId) {
              await getCustomer(profile.data.customerId)
            } else if (firstRole === "RESTAURANT" && profile.data.restaurantId) {
              await getRestaurant(profile.data.restaurantId)
            } else if (firstRole === "RIDER" && profile.data.riderId) {
              await getRider(profile.data.riderId)
            }
            
            // If data exists, redirect to dashboard
            selectRole(firstRole as Role)
            router.push(roleHome[firstRole])
          } catch (entityErr) {
            // If entity data not found (404), stay on onboarding page
            if (entityErr instanceof ApiError && entityErr.status === 404) {
              console.log("Entity data not found, showing role selection")
            } else {
              console.error("Error checking entity data:", entityErr)
            }
          }
        }
      } catch (err) {
        // If profile fetch fails, continue with onboarding
        console.error("Failed to fetch user profile:", err)
      }
    }

    fetchUserProfile()
  }, [router, selectRole])

  if (!ready) return null

  const buildBody = (c: Choice) => {
    const time = (t: string) => (t ? new Date(`1970-01-01T${t}:00`).toISOString() : undefined)
    if (c === "CUSTOMER") {
      return {
        dob: dob ? new Date(dob).toISOString() : undefined,
        gender: gender || undefined,
        lat: location.lat ?? undefined,
        lng: location.lng ?? undefined,
      }
    }
    if (c === "RESTAURANT") {
      return {
        description: description || undefined,
        lat: location.lat ?? undefined,
        lng: location.lng ?? undefined,
        opentime: time(opentime),
        closetime: time(closetime),
        imageurl: imageurl || undefined,
      }
    }
    return {
      dob: dob ? new Date(dob).toISOString() : undefined,
      gender: gender || undefined,
      lat: location.lat ?? undefined,
      lng: location.lng ?? undefined,
      vehicleNumber: vehicleNumber || undefined,
      dlNumber: dlNumber || undefined,
    }
  }

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!choice) return

    // Validation
    if (!location.address || location.lat === null || location.lng === null) {
      toast.error("Please select a location on the map.")
      return
    }

    if (choice === "CUSTOMER") {
      if (!dob) {
        toast.error("Please enter your date of birth.")
        return
      }
      if (!gender) {
        toast.error("Please select your gender.")
        return
      }
    }

    if (choice === "RESTAURANT") {
      if (!description) {
        toast.error("Please enter a description for your restaurant.")
        return
      }
      if (!opentime) {
        toast.error("Please enter opening time.")
        return
      }
      if (!closetime) {
        toast.error("Please enter closing time.")
        return
      }
    }

    if (choice === "RIDER") {
      if (!dob) {
        toast.error("Please enter your date of birth.")
        return
      }
      if (!gender) {
        toast.error("Please select your gender.")
        return
      }
      if (!vehicleNumber) {
        toast.error("Please enter your vehicle number.")
        return
      }
      if (!dlNumber) {
        toast.error("Please enter your driving license number.")
        return
      }
    }

    setLoading(true)
    try {
      const res = await apiRequest(`/${roleMeta[choice].base}/register/request`, {
        method: "POST",
        body: buildBody(choice),
        auth: true,
      })
      toast.success(res.message || "OTP sent to your phone.")
      setStep("otp")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not start registration.")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!choice || otp.length < 4) {
      toast.error("Enter the OTP code.")
      return
    }
    setLoading(true)
    try {
      const res = await apiRequest(`/${roleMeta[choice].base}/register/verify`, {
        method: "POST",
        body: { otpCode: otp },
        auth: true,
      })
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
      }
      selectRole(choice as Role)
      toast.success(`Registered as ${roleMeta[choice].title}!`)
      router.push(roleHome[choice])
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invalid OTP.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUserRequest = async () => {
    if (!confirm("Are you sure you want to delete your entire account? This will delete all your data and cannot be undone.")) {
      return
    }

    setDeletingUser(true)
    try {
      await apiRequest("/users/delete/request", { method: "POST", auth: true })
      toast.success("OTP sent to your phone")
      setDeleteUserStep("otp")
    } catch (err) {
      toast.error("Failed to send OTP")
    } finally {
      setDeletingUser(false)
    }
  }

  const handleDeleteUserConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (deleteUserOtp.length < 4) {
      toast.error("Enter the OTP code")
      return
    }

    setDeletingUser(true)
    try {
      await apiRequest("/users/delete/complete", {
        method: "POST",
        body: { otpCode: deleteUserOtp },
        auth: true,
      })
      toast.success("Account deleted successfully")
      logout()
      router.push("/login")
    } catch (err) {
      toast.error("Failed to delete account")
    } finally {
      setDeletingUser(false)
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {!choice ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight">How do you want to use Swigg?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a role to continue. You can add more roles later.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(Object.keys(roleMeta) as Choice[]).map((c) => {
                const meta = roleMeta[c]
                const has = roles.includes(c as Role)
                return (
                  <button
                    key={c}
                    onClick={() => {
                      if (has) {
                        selectRole(c as Role)
                        router.push(roleHome[c])
                      } else {
                        setChoice(c)
                      }
                    }}
                    className="group flex flex-col items-start rounded-xl border bg-card p-5 text-left transition hover:border-primary hover:shadow-sm"
                  >
                    <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <meta.icon className="size-5" />
                    </span>
                    <span className="mt-3 flex items-center gap-1.5 font-semibold">
                      {meta.title}
                      {has && <Check className="size-4 text-primary" />}
                    </span>
                    <span className="mt-0.5 text-sm text-muted-foreground">{meta.desc}</span>
                    <span className="mt-2 text-xs font-medium text-primary">
                      {has ? "Go to dashboard" : "Register"}
                    </span>
                  </button>
                )
              })}
            </div>

            {userData && (
              <Card className="mt-8 border-destructive/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="font-semibold text-destructive">Account Information</h3>
                      <p className="text-sm text-muted-foreground">
                        {userData.email} • {userData.phone}
                      </p>
                    </div>
                    {deleteUserStep === "confirm" ? (
                      <Button
                        variant="destructive"
                        onClick={handleDeleteUserRequest}
                        disabled={deletingUser}
                        className="w-full sm:w-auto"
                      >
                        {deletingUser ? (
                          <>Sending OTP...</>
                        ) : (
                          <>
                            <Trash2 className="size-4 mr-2" />
                            Delete Account
                          </>
                        )}
                      </Button>
                    ) : (
                      <form onSubmit={handleDeleteUserConfirm} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <Label>Enter OTP to confirm account deletion</Label>
                          <OtpInput value={deleteUserOtp} onChange={setDeleteUserOtp} />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            variant="destructive"
                            disabled={deletingUser}
                            className="flex-1"
                          >
                            {deletingUser ? (
                              <>Deleting...</>
                            ) : (
                              <>
                                <Trash2 className="size-4 mr-2" />
                                Confirm Delete
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setDeleteUserStep("confirm")
                              setDeleteUserOtp("")
                            }}
                            disabled={deletingUser}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <button
                onClick={() => {
                  setChoice(null)
                  setStep("details")
                  setOtp("")
                }}
                className="mb-2 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back to roles
              </button>
              <CardTitle>
                {step === "details" ? `Register as ${roleMeta[choice].title}` : "Verify your phone"}
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
                  {choice === "RESTAURANT" ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea
                          id="desc"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Authentic wood-fired pizzas and pastas."
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="img">Cover image URL</Label>
                        <Input
                          id="img"
                          value={imageurl}
                          onChange={(e) => setImageurl(e.target.value)}
                          placeholder="https://…"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="open">Opening time</Label>
                          <Input id="open" type="time" value={opentime} onChange={(e) => setOpentime(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="close">Closing time</Label>
                          <Input
                            id="close"
                            type="time"
                            value={closetime}
                            onChange={(e) => setClosetime(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
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
                      {choice === "RIDER" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="veh">Vehicle number</Label>
                            <Input
                              id="veh"
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              placeholder="KA01AB1234"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="dl">DL number</Label>
                            <Input
                              id="dl"
                              value={dlNumber}
                              onChange={(e) => setDlNumber(e.target.value)}
                              placeholder="DL14 20110012345"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <AddressMapPicker
                    value={location}
                    onChange={setLocation}
                    label={choice === "RESTAURANT" ? "Restaurant location" : "Your address"}
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
        )}
      </main>
    </div>
  )
}
