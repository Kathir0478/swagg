"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { updateRestaurant } from "@/lib/services"
import { OtpInput } from "@/components/otp-input"
import { apiRequest, getAccessToken } from "@/lib/api"
import { getEndpointConfig } from "@/lib/api-endpoints"
import { AddressMapPicker, type LocationValue } from "@/components/address-map-picker"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Store, Trash2, Save, Upload, X } from "lucide-react"

export default function RestaurantProfilePage() {
  const router = useRouter()
  const { roles, activeRole, logout, login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [deleteStep, setDeleteStep] = useState<"confirm" | "otp">("confirm")
  const [deleteOtp, setDeleteOtp] = useState("")
  
  const [restaurantData, setRestaurantData] = useState({
    restaurantId: "",
    restaurantName: "",
    description: "",
    restaurantAddress: "",
    restaurantLat: null as number | null,
    restaurantLng: null as number | null,
    opentime: "",
    closetime: "",
    imageurl: "",
    imageFile: null as File | null,
    imagePreview: "",
    isActive: false,
    isVerified: false,
    createdAt: "",
    updatedAt: "",
    address: "",
    rating: 0 as number,
    reviewCount: 0 as number,
  })
  
  const [originalRestaurantData, setOriginalRestaurantData] = useState<typeof restaurantData | null>(null)
  const [location, setLocation] = useState<LocationValue>({ address: "", lat: null, lng: null })
  const [originalLocation, setOriginalLocation] = useState<LocationValue | null>(null)

  useEffect(() => {
    fetchRestaurantDetails()
  }, [])

  const fetchRestaurantDetails = async () => {
    const token = getAccessToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      // Fetch restaurant details from the endpoint through proxy to avoid CORS
      const config = getEndpointConfig('RESTAURANTS_GET_BY_USER')
      const restaurantDataResponse = await apiRequest<{
        restaurantId: string
        userId: string
        name: string
        description: string
        openTime: string | null
        closeTime: string | null
        imageUrl: string
        address: string | null
        rating: number
        reviewCount: number
        lat: number
        lng: number
        isActive: boolean
        isVerified: boolean
        createdAt: string
        updatedAt: string
      }>(config.path, { method: config.method, auth: config.auth })

      // Response might be wrapped in .data or be direct
      const data = (restaurantDataResponse as any).data || restaurantDataResponse
      
      if (data && data.restaurantId) {
        const imageUrl = data.imageUrl
          ? (data.imageUrl.startsWith('http') 
              ? data.imageUrl 
              : `http://localhost:8080${data.imageUrl}`)
          : ""

        const newRestaurantData = {
          restaurantId: data.restaurantId || "",
          restaurantName: data.name || "",
          description: data.description || "",
          restaurantAddress: data.address || "",
          restaurantLat: data.lat ? Number(data.lat) : null,
          restaurantLng: data.lng ? Number(data.lng) : null,
          opentime: data.openTime || "",
          closetime: data.closeTime || "",
          imageurl: imageUrl,
          imageFile: null,
          imagePreview: imageUrl,
          isActive: data.isActive || false,
          isVerified: data.isVerified || false,
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt || "",
          address: data.address || "",
          rating: data.rating ? Number(data.rating) : 0,
          reviewCount: data.reviewCount || 0,
        }
        const newLocation = {
          address: data.address || "",
          lat: data.lat ? Number(data.lat) : null,
          lng: data.lng ? Number(data.lng) : null,
        }
        
        setRestaurantData(newRestaurantData)
        setLocation(newLocation)
        setOriginalRestaurantData(newRestaurantData)
        setOriginalLocation(newLocation)
      }
    } catch (err) {
      toast.error("Failed to load restaurant details")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setRestaurantData({
          ...restaurantData,
          imageFile: file,
          imagePreview: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setRestaurantData({
      ...restaurantData,
      imageFile: null,
      imagePreview: "",
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const updateData: Record<string, unknown> = {}

      // Always include restaurantId as per DTO
      if (restaurantData.restaurantId) {
        updateData.restaurantId = restaurantData.restaurantId
      }

      // Only include changed fields
      if (originalRestaurantData && restaurantData.restaurantName !== originalRestaurantData.restaurantName) {
        updateData.name = restaurantData.restaurantName
      }
      if (originalRestaurantData && restaurantData.description !== originalRestaurantData.description) {
        updateData.description = restaurantData.description
      }
      if (originalLocation && location.lat !== originalLocation.lat) {
        updateData.lat = location.lat ?? undefined
      }
      if (originalLocation && location.lng !== originalLocation.lng) {
        updateData.lng = location.lng ?? undefined
      }
      if (originalRestaurantData && restaurantData.opentime !== originalRestaurantData.opentime && restaurantData.opentime) {
        const [hours, minutes] = restaurantData.opentime.split(':')
        const openDate = new Date()
        openDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        updateData.openTime = openDate.toISOString()
      }
      if (originalRestaurantData && restaurantData.closetime !== originalRestaurantData.closetime && restaurantData.closetime) {
        const [hours, minutes] = restaurantData.closetime.split(':')
        const closeDate = new Date()
        closeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        updateData.closeTime = closeDate.toISOString()
      }

      // Handle image file upload
      if (restaurantData.imageFile) {
        const formData = new FormData()
        formData.append('imageFile', restaurantData.imageFile)
        
        // Add other changed fields to formData
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, String(value))
          }
        })

        const config = getEndpointConfig('RESTAURANTS_UPDATE')
        const token = getAccessToken()
        const res = await fetch(`/api/proxy${config.path}`, {
          method: config.method,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })

        if (!res.ok) {
          throw new Error('Failed to update restaurant')
        }

        const result = await res.json()
        if (result.accessToken && result.refreshToken) {
          login(result.accessToken, result.refreshToken)
        }
      } else if (Object.keys(updateData).length > 1) {
        // Only send update if there are changed fields (more than just restaurantId)
        const res = await updateRestaurant(updateData)
        if (res.accessToken && res.refreshToken) {
          login(res.accessToken, res.refreshToken)
        }
      } else {
        toast.info("No changes to update")
        setEditMode(false)
        setUpdating(false)
        return
      }

      toast.success("Restaurant details updated successfully")
      setEditMode(false)
      fetchRestaurantDetails()
    } catch (err) {
      toast.error("Failed to update restaurant details")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteRequest = async () => {
    if (!confirm("Are you sure you want to delete your restaurant account? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      const config = getEndpointConfig('RESTAURANTS_DELETE_REQUEST')
      await apiRequest(config.path, { method: config.method, auth: config.auth })
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
      const config = getEndpointConfig('RESTAURANTS_DELETE_COMPLETE')
      const res = await apiRequest(config.path, {
        method: config.method,
        body: { otpCode: deleteOtp },
        auth: config.auth,
      })
      if (res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken)
      }
      toast.success("Restaurant account deleted successfully")
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
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Restaurant Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your restaurant profile and account</p>
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
            <Store className="size-5" />
            Restaurant Profile
          </CardTitle>
          <CardDescription>
            {editMode ? "Update your restaurant details below" : "Your current restaurant information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={restaurantData.restaurantName}
                  onChange={(e) => setRestaurantData({ ...restaurantData, restaurantName: e.target.value })}
                  placeholder="My Restaurant"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={restaurantData.description}
                  onChange={(e) => setRestaurantData({ ...restaurantData, description: e.target.value })}
                  placeholder="Authentic wood-fired pizzas and pastas."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="open">Opening Time</Label>
                  <Input
                    id="open"
                    type="time"
                    value={restaurantData.opentime}
                    onChange={(e) => setRestaurantData({ ...restaurantData, opentime: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="close">Closing Time</Label>
                  <Input
                    id="close"
                    type="time"
                    value={restaurantData.closetime}
                    onChange={(e) => setRestaurantData({ ...restaurantData, closetime: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="image">Restaurant Image</Label>
                <div className="flex items-center gap-3">
                  {restaurantData.imagePreview ? (
                    <div className="relative">
                      <img
                        src={restaurantData.imagePreview}
                        alt="Restaurant preview"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25">
                      <Store className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload an image of your restaurant
                    </p>
                  </div>
                </div>
              </div>

              <AddressMapPicker
                value={location}
                onChange={setLocation}
                label="Restaurant location"
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
                    fetchRestaurantDetails()
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
                  <Label className="text-muted-foreground">Restaurant Name</Label>
                  <p className="font-medium">{restaurantData.restaurantName || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rating</Label>
                  <p className="font-medium">{restaurantData.rating.toFixed(1)} / 5.0 ({restaurantData.reviewCount} reviews)</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{restaurantData.description || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Opening Time</Label>
                  <p className="font-medium">{restaurantData.opentime || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Closing Time</Label>
                  <p className="font-medium">{restaurantData.closetime || "Not set"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{restaurantData.address || restaurantData.restaurantAddress || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">
                    {restaurantData.isActive ? "Active" : "Inactive"}
                    {restaurantData.isVerified && " (Verified)"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">
                    {restaurantData.restaurantLat && restaurantData.restaurantLng
                      ? `${restaurantData.restaurantLat.toFixed(6)}, ${restaurantData.restaurantLng.toFixed(6)}`
                      : "Not set"}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Restaurant Image</Label>
                  {restaurantData.imageurl ? (
                    <img
                      src={restaurantData.imageurl}
                      alt="Restaurant"
                      className="mt-2 h-48 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <p className="font-medium text-muted-foreground">No image uploaded</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Account Created</Label>
                  <p className="font-medium">
                    {restaurantData.createdAt
                      ? new Date(restaurantData.createdAt).toLocaleDateString()
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
