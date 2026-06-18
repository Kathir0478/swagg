"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { updateRider, deleteRider } from "@/lib/services"
import { OtpInput } from "@/components/otp-input"
import { apiRequest, getAccessToken } from "@/lib/api"
import { AddressMapPicker, type LocationValue } from "@/components/address-map-picker"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bike, Trash2, Save } from "lucide-react"
import type { Gender } from "@/lib/types"

export default function RiderPage() {
  const router = useRouter()
  const { roles, activeRole, logout, login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [deleteStep, setDeleteStep] = useState<"confirm" | "otp">("confirm")
  const [deleteOtp, setDeleteOtp] = useState("")
  
  const [riderData, setRiderData] = useState({
    riderId: "",
    riderName: "",
    riderAddress: "",
    riderDob: "",
    riderGender: "" as Gender | "",
    riderLat: null as number | null,
    riderLng: null as number | null,
    riderVehicleNumber: "",
    riderDlNumber: "",
    riderIsActive: false,
    riderIsVerified: false,
    riderCreatedAt: "",
    riderUpdatedAt: "",
    address: "",
    email: "",
    phone: "",
  })
  
  const [location, setLocation] = useState<LocationValue>({ address: "", lat: null, lng: null })

  useEffect(() => {
    fetchRiderDetails()
  }, [])

  const fetchRiderDetails = async () => {
    const token = getAccessToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const profile = await apiRequest<{
        roles: string[]
        registeredRoles: string[]
        riderId?: string
        riderName?: string
        riderAddress?: string
        riderDob?: string
        riderGender?: string
        riderLat?: number
        riderLng?: number
        riderVehicleNumber?: string
        riderDlNumber?: string
        riderIsActive?: boolean
        riderIsVerified?: boolean
        riderCreatedAt?: string
        riderUpdatedAt?: string
        address?: string
        email?: string
        phone?: string
      }>("/auth/me", { auth: true })

      if (profile.data) {
        setRiderData({
          riderId: profile.data.riderId || "",
          riderName: profile.data.riderName || "",
          riderAddress: profile.data.riderAddress || "",
          riderDob: profile.data.riderDob ? new Date(profile.data.riderDob).toISOString().split('T')[0] : "",
          riderGender: (profile.data.riderGender as Gender) || "",
          riderLat: profile.data.riderLat ?? null,
          riderLng: profile.data.riderLng ?? null,
          riderVehicleNumber: profile.data.riderVehicleNumber || "",
          riderDlNumber: profile.data.riderDlNumber || "",
          riderIsActive: profile.data.riderIsActive || false,
          riderIsVerified: profile.data.riderIsVerified || false,
          riderCreatedAt: profile.data.riderCreatedAt || "",
          riderUpdatedAt: profile.data.riderUpdatedAt || "",
          address: profile.data.address || "",
          email: profile.data.email || "",
          phone: profile.data.phone || "",
        })
        setLocation({
          address: profile.data.address || profile.data.riderAddress || "",
          lat: profile.data.riderLat ?? null,
          lng: profile.data.riderLng ?? null,
        })
      }
    } catch (err) {
      toast.error("Failed to load rider details")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const updateData: Record<string, unknown> = {
        riderId: riderData.riderId || undefined,
        name: riderData.riderName || undefined,
        vehicleNumber: riderData.riderVehicleNumber || undefined,
        dlNumber: riderData.riderDlNumber || undefined,
        lat: location.lat ?? undefined,
        lng: location.lng ?? undefined,
        address: location.address || undefined,
      }

      if (riderData.riderDob) {
        updateData.dob = new Date(riderData.riderDob).toISOString()
      }
      if (riderData.riderGender) {
        updateData.gender = riderData.riderGender
      }

      const res = await updateRider(updateData)
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
      }
      toast.success("Rider details updated successfully")
      setEditMode(false)
      fetchRiderDetails()
    } catch (err) {
      toast.error("Failed to update rider details")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteRequest = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      await apiRequest("/riders/delete/request", { method: "POST", auth: true })
      toast.success("OTP sent to your phone")
      setDeleteStep("otp")
    } catch (err) {
      toast.error("Failed to send OTP")
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (deleteOtp.length < 4) {
      toast.error("Enter the OTP code")
      return
    }

    setDeleting(true)
    try {
      const res = await apiRequest("/riders/delete/complete", {
        method: "POST",
        body: { otpCode: deleteOtp },
        auth: true,
      })
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
      }
      toast.success("Account deleted successfully")
      logout()
      router.push("/login")
    } catch (err) {
      toast.error("Failed to delete account")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Rider Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your rider profile and account</p>
        </div>
        {!editMode && (
          <Button onClick={() => setEditMode(true)} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="size-5" />
            Rider Profile
          </CardTitle>
          <CardDescription>
            {editMode ? "Update your rider details below" : "Your current rider information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={riderData.riderDob}
                    onChange={(e) => setRiderData({ ...riderData, riderDob: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Gender</Label>
                  <Select
                    value={riderData.riderGender}
                    onValueChange={(v) => setRiderData({ ...riderData, riderGender: v as Gender })}
                  >
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

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="veh">Vehicle number</Label>
                  <Input
                    id="veh"
                    value={riderData.riderVehicleNumber}
                    onChange={(e) => setRiderData({ ...riderData, riderVehicleNumber: e.target.value })}
                    placeholder="KA01AB1234"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dl">DL number</Label>
                  <Input
                    id="dl"
                    value={riderData.riderDlNumber}
                    onChange={(e) => setRiderData({ ...riderData, riderDlNumber: e.target.value })}
                    placeholder="DL14 20110012345"
                  />
                </div>
              </div>

              <AddressMapPicker
                value={location}
                onChange={setLocation}
                label="Your location"
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={updating} className="flex-1">
                  {updating ? (
                    <>Updating...</>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false)
                    fetchRiderDetails()
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Rider Name</Label>
                  <p className="font-medium">{riderData.riderName || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rider ID</Label>
                  <p className="font-medium">{riderData.riderId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{riderData.email || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{riderData.phone || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vehicle Number</Label>
                  <p className="font-medium">{riderData.riderVehicleNumber || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Driving License</Label>
                  <p className="font-medium">{riderData.riderDlNumber || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gender</Label>
                  <p className="font-medium">{riderData.riderGender || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date of Birth</Label>
                  <p className="font-medium">{riderData.riderDob || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{riderData.address || riderData.riderAddress || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">
                    {riderData.riderIsActive ? "Active" : "Inactive"}
                    {riderData.riderIsVerified && " (Verified)"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">
                    {riderData.riderLat && riderData.riderLng
                      ? `${riderData.riderLat.toFixed(6)}, ${riderData.riderLng.toFixed(6)}`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Account Created</Label>
                  <p className="font-medium">
                    {riderData.riderCreatedAt
                      ? new Date(riderData.riderCreatedAt).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                {deleteStep === "confirm" ? (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteRequest}
                    disabled={deleting}
                    className="w-full sm:w-auto"
                  >
                    {deleting ? (
                      <>Sending OTP...</>
                    ) : (
                      <>
                        <Trash2 className="size-4 mr-2" />
                        Delete Account
                      </>
                    )}
                  </Button>
                ) : (
                  <form onSubmit={handleDeleteConfirm} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>Enter OTP to confirm deletion</Label>
                      <OtpInput value={deleteOtp} onChange={setDeleteOtp} />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        variant="destructive"
                        disabled={deleting}
                        className="flex-1"
                      >
                        {deleting ? (
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
                          setDeleteStep("confirm")
                          setDeleteOtp("")
                        }}
                        disabled={deleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
