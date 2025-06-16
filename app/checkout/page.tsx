"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  CreditCard,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/lib/cart-store"

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, clearCart, getCartTotal, getCartSubtotal, getCartTax, getCartShipping, getCartItemCount } =
    useCartStore()

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"info" | "payment" | "review">("info")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    country: "Uganda",
    postalCode: "",
  })

  const [billingAddress, setBillingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    country: "Uganda",
    postalCode: "",
  })

  const [useSameAddress, setUseSameAddress] = useState(true)
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("flutterwave")
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // Calculate totals
  const subtotal = getCartSubtotal()
  const tax = getCartTax()
  const shipping = getCartShipping()
  const total = getCartTotal()
  const itemCount = getCartItemCount()

  useEffect(() => {
    if (!items || items.length === 0) {
      router.push("/store")
    }
  }, [items, router])

  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress(shippingAddress)
    }
  }, [shippingAddress, useSameAddress])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/
    return phoneRegex.test(phone)
  }

  const validateStep = (currentStep: string) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === "info") {
      if (!customerInfo.firstName.trim()) newErrors.firstName = "First name is required"
      if (!customerInfo.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!customerInfo.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!validateEmail(customerInfo.email)) {
        newErrors.email = "Please enter a valid email address"
      }
      if (!customerInfo.phone.trim()) {
        newErrors.phone = "Phone number is required"
      } else if (!validatePhone(customerInfo.phone)) {
        newErrors.phone = "Please enter a valid phone number"
      }
      if (!shippingAddress.street.trim()) newErrors.street = "Street address is required"
      if (!shippingAddress.city.trim()) newErrors.city = "City is required"
      if (!shippingAddress.state.trim()) newErrors.state = "State/Region is required"
      if (!shippingAddress.country.trim()) newErrors.country = "Country is required"
    }

    if (currentStep === "payment") {
      if (!agreeToTerms) newErrors.terms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAddressChange = (type: "shipping" | "billing", field: keyof Address, value: string) => {
    if (type === "shipping") {
      setShippingAddress((prev) => ({ ...prev, [field]: value }))
    } else {
      setBillingAddress((prev) => ({ ...prev, [field]: value }))
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      if (step === "info") {
        setStep("payment")
      } else if (step === "payment") {
        setStep("review")
      }
    }
  }

  const handlePreviousStep = () => {
    if (step === "payment") {
      setStep("info")
    } else if (step === "review") {
      setStep("payment")
    }
  }

  const processFlutterwavePayment = async () => {
    if (!items || items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Generate unique order ID
      const orderId = `AFG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Prepare order data for the API
      const orderData = {
        orderId,
        amount: total,
        currency: "UGX",
        customer: {
          email: customerInfo.email,
          phone_number: customerInfo.phone,
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        },
        description: `Order for ${itemCount} item${itemCount > 1 ? "s" : ""} from Afrigoals Store`,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        })),
        addresses: {
          shipping: shippingAddress,
          billing: useSameAddress ? shippingAddress : billingAddress,
        },
        notes,
      }

      // Call our API to initialize payment
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to initialize payment")
      }

      if (result.success && result.paymentLink) {
        // Store order details in localStorage for success page
        const orderDetails = {
          orderId: result.orderId,
          customerInfo,
          shippingAddress,
          billingAddress: useSameAddress ? shippingAddress : billingAddress,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            image: item.image,
            variant: item.variant,
          })),
          totals: {
            subtotal,
            tax,
            shipping,
            total,
          },
          notes,
          timestamp: new Date().toISOString(),
        }

        localStorage.setItem("pending_order", JSON.stringify(orderDetails))

        // Show success message
        toast({
          title: "Redirecting to Payment",
          description: "You will be redirected to Flutterwave to complete your payment.",
        })

        // Redirect to Flutterwave payment page
        window.location.href = result.paymentLink
      } else {
        throw new Error("Invalid response from payment service")
      }
    } catch (error) {
      console.error("Payment initialization failed:", error)

      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-8">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to your cart to continue with checkout.</p>
          <Button onClick={() => router.push("/store")} className="bg-green-600 hover:bg-green-700">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/store")}
            className="mb-4 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order in {step === "info" ? "3" : step === "payment" ? "2" : "1"} simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center ${step === "info" ? "text-green-600" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "info" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Information</span>
            </div>
            <div className={`flex items-center ${step === "payment" ? "text-green-600" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "payment" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div className={`flex items-center ${step === "review" ? "text-green-600" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "review" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "info" && (
              <div className="space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={customerInfo.firstName}
                          onChange={(e) => handleCustomerInfoChange("firstName", e.target.value)}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={customerInfo.lastName}
                          onChange={(e) => handleCustomerInfoChange("lastName", e.target.value)}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => handleCustomerInfoChange("email", e.target.value)}
                          className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => handleCustomerInfoChange("phone", e.target.value)}
                          className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                          placeholder="+256 700 000 000"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-green-600" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        value={shippingAddress.street}
                        onChange={(e) => handleAddressChange("shipping", "street", e.target.value)}
                        className={errors.street ? "border-red-500" : ""}
                        placeholder="123 Main Street"
                      />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleAddressChange("shipping", "city", e.target.value)}
                          className={errors.city ? "border-red-500" : ""}
                          placeholder="Kampala"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <Label htmlFor="state">State/Region *</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => handleAddressChange("shipping", "state", e.target.value)}
                          className={errors.state ? "border-red-500" : ""}
                          placeholder="Central Region"
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={shippingAddress.country}
                          onValueChange={(value) => handleAddressChange("shipping", "country", value)}
                        >
                          <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Uganda">Uganda</SelectItem>
                            <SelectItem value="Kenya">Kenya</SelectItem>
                            <SelectItem value="Tanzania">Tanzania</SelectItem>
                            <SelectItem value="Rwanda">Rwanda</SelectItem>
                            <SelectItem value="Burundi">Burundi</SelectItem>
                            <SelectItem value="South Sudan">South Sudan</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={(e) => handleAddressChange("shipping", "postalCode", e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAddress"
                        checked={useSameAddress}
                        onCheckedChange={(checked) => setUseSameAddress(checked as boolean)}
                      />
                      <Label htmlFor="sameAddress">Same as shipping address</Label>
                    </div>

                    {!useSameAddress && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <div>
                          <Label htmlFor="billingStreet">Street Address *</Label>
                          <Input
                            id="billingStreet"
                            value={billingAddress.street}
                            onChange={(e) => handleAddressChange("billing", "street", e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingCity">City *</Label>
                            <Input
                              id="billingCity"
                              value={billingAddress.city}
                              onChange={(e) => handleAddressChange("billing", "city", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingState">State/Region *</Label>
                            <Input
                              id="billingState"
                              value={billingAddress.state}
                              onChange={(e) => handleAddressChange("billing", "state", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingCountry">Country *</Label>
                            <Select
                              value={billingAddress.country}
                              onValueChange={(value) => handleAddressChange("billing", "country", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Uganda">Uganda</SelectItem>
                                <SelectItem value="Kenya">Kenya</SelectItem>
                                <SelectItem value="Tanzania">Tanzania</SelectItem>
                                <SelectItem value="Rwanda">Rwanda</SelectItem>
                                <SelectItem value="Burundi">Burundi</SelectItem>
                                <SelectItem value="South Sudan">South Sudan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="billingPostalCode">Postal Code</Label>
                            <Input
                              id="billingPostalCode"
                              value={billingAddress.postalCode}
                              onChange={(e) => handleAddressChange("billing", "postalCode", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any special instructions for your order..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {step === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="flutterwave"
                          name="payment"
                          value="flutterwave"
                          checked={paymentMethod === "flutterwave"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-green-600"
                        />
                        <Label htmlFor="flutterwave" className="flex items-center gap-3 cursor-pointer">
                          <div className="bg-green-600 p-2 rounded">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">Flutterwave</div>
                            <div className="text-sm text-muted-foreground">Secure payment processing</div>
                          </div>
                        </Label>
                      </div>

                      <div className="mt-4 ml-8 text-sm text-muted-foreground">
                        <p className="font-medium mb-2 text-foreground">Supported payment methods:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Credit/Debit Cards</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Bank Transfer</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Mobile Money</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>USSD</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                        className={errors.terms ? "border-red-500" : ""}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <a href="/terms" className="text-green-600 hover:underline">
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-green-600 hover:underline">
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                    {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Secure Payment</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Your payment information is encrypted and secure. We use industry-standard SSL encryption to
                          protect your data.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "review" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Info Summary */}
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <p>
                        <strong>Name:</strong> {customerInfo.firstName} {customerInfo.lastName}
                      </p>
                      <p>
                        <strong>Email:</strong> {customerInfo.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {customerInfo.phone}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address Summary */}
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <p>{shippingAddress.street}</p>
                      <p>
                        {shippingAddress.city}, {shippingAddress.state}
                      </p>
                      <p>
                        {shippingAddress.country} {shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Payment Method Summary */}
                  <div>
                    <h4 className="font-semibold mb-2">Payment Method</h4>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        <span>Flutterwave - Multiple payment options available</span>
                      </div>
                    </div>
                  </div>

                  {notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Order Notes</h4>
                      <div className="bg-muted p-4 rounded-lg text-sm">
                        <p>{notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                          Ready to Complete Your Order
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Please review all information above. Once you proceed to payment, you'll be redirected to
                          Flutterwave to complete your purchase securely.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step !== "info" && (
                <Button variant="outline" onClick={handlePreviousStep} disabled={isLoading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}

              <div className="ml-auto">
                {step === "review" ? (
                  <Button
                    size="lg"
                    onClick={processFlutterwavePayment}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay UGX {total.toLocaleString()}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleNextStep} className="bg-green-600 hover:bg-green-700">
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-2 bg-muted rounded-lg">
                      <div className="relative h-12 w-12 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg?height=48&width=48&query=product"}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>

                        {item.variant && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Qty: {item.quantity}
                          </Badge>
                          <span className="font-semibold text-sm">
                            UGX {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>UGX {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                      {shipping > 0 ? `UGX ${shipping.toLocaleString()}` : "Free"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Tax (18%)</span>
                    <span>UGX {tax.toLocaleString()}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">UGX {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {subtotal < 100000 && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Free shipping</strong> on orders over UGX 100,000!
                      <br />
                      Add UGX {(100000 - subtotal).toLocaleString()} more to qualify.
                    </p>
                  </div>
                )}

                {/* Security Badge */}
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>Secure checkout powered by Flutterwave</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
