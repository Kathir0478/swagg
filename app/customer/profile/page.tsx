"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { getCustomer, updateCustomer, customerDeleteRequest, customerDeleteComplete } from "@/lib/services"
import { OtpInput } from "@/components/otp-input"
import { AddressMapPicker, type LocationValue } from "@/components/address-map-picker"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Trash2, Save, ArrowLeft } from "lucide-react"
import type { Gender } from "@/lib/types"

export default function CustomerProfilePage() {
  const router = useRouter()
  const { roles, activeRole, logout, login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [deleteStep, setDeleteStep] = useState<"confirm" | "otp">("confirm")
  const [deleteOtp, setDeleteOtp] = useState("")
  
  const [customerData, setCustomerData] = useState({
    customerId: "",
    name: "",
    address: "",
    dob: "",
    gender: "" as Gender | "",
    lat: null as number | null,
    lng: null as number | null,
    email: "",
    phone: "",
  })
  
  const [location, setLocation] = useState<LocationValue>({ address: "", lat: null, lng: null })

  useEffect(() => {
    fetchCustomerDetails()
  }, [])

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const fetchCustomerDetails = async () => {
    try {
      const profile = await getCustomer()

      if (profile) {
        setCustomerData({
          customerId: profile.customerId || "",
          name: profile.name || "",
          address: profile.address || "",
          dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
          gender: (profile.gender as Gender) || "",
          lat: profile.lat ?? null,
          lng: profile.lng ?? null,
          email: profile.email || "",
          phone: profile.phone || "",
        })
        setLocation({
          address: profile.address || "",
          lat: profile.lat ?? null,
          lng: profile.lng ?? null,
        })
      }
    } catch (err) {
      console.error("Failed to load customer details:", err)
      toast.error("Failed to load customer details")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const updateData: Record<string, unknown> = {
        customerId: customerData.customerId || undefined,
        name: customerData.name || undefined,
        address: location.address || undefined,
        lat: location.lat ?? undefined,
        lng: location.lng ?? undefined,
      }

      if (customerData.dob) {
        updateData.dob = new Date(customerData.dob).toISOString()
      }
      if (customerData.gender) {
        updateData.gender = customerData.gender
      }

      const res = await updateCustomer(updateData)
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
      }
      toast.success("Customer details updated successfully")
      setEditMode(false)
      fetchCustomerDetails()
    } catch (err) {
      toast.error("Failed to update customer details")
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
      await customerDeleteRequest()
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
      const res = await customerDeleteComplete({ otpCode: deleteOtp })
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Customer Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your customer profile and account</p>
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
            <User className="size-5" />
            Customer Profile
          </CardTitle>
          <CardDescription>
            {editMode ? "Update your customer details below" : "Your current customer information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={customerData.dob}
                    onChange={(e) => setCustomerData({ ...customerData, dob: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Gender</Label>
                  <Select
                    value={customerData.gender}
                    onValueChange={(v) => setCustomerData({ ...customerData, gender: v as Gender })}
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
                    fetchCustomerDetails()
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{customerData.name || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{customerData.address || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gender</Label>
                  <p className="font-medium">{customerData.gender || "Not set"}</p>
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
