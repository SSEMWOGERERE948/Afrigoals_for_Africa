"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Download,
  AlertCircle,
  User,
} from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/lib/cart-store"
import { useToast } from "@/hooks/use-toast"

interface OrderDetails {
  orderId: string
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shippingAddress: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  billingAddress: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    totalPrice: number
    image?: string
    variant?: {
      name: string
      value: string
    }
  }>
  totals: {
    subtotal: number
    tax: number
    shipping: number
    total: number
  }
  notes?: string
  timestamp: string
}

interface PaymentDetails {
  id: string
  txRef: string
  amount: number
  currency: string
  status: string
  customer: any
  createdAt: string
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { clearCart } = useCartStore()

  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | "pending">("pending")
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  const txRef = searchParams.get("tx_ref")
  const transactionId = searchParams.get("transaction_id")
  const status = searchParams.get("status")

  useEffect(() => {
    const verifyPayment = async () => {
      if (!txRef && !transactionId) {
        setError("No transaction reference found")
        setPaymentStatus("failed")
        setIsVerifying(false)
        return
      }

      try {
        // Get order details from localStorage
        const storedOrder = localStorage.getItem("pending_order")
        if (storedOrder) {
          setOrderDetails(JSON.parse(storedOrder))
        }

        // Verify payment with our API
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId: transactionId || txRef,
            txRef,
          }),
        })

        const result = await response.json()

        if (result.success && result.verified) {
          setPaymentStatus("success")
          setPaymentDetails(result.payment)

          // Clear cart on successful payment
          clearCart()

          // Remove pending order from localStorage
          localStorage.removeItem("pending_order")

          toast({
            title: "Payment Successful!",
            description: "Your order has been confirmed and will be processed shortly.",
          })
        } else {
          setPaymentStatus("failed")
          setError(result.message || "Payment verification failed")

          toast({
            title: "Payment Failed",
            description: "Your payment could not be verified. Please contact support.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        setPaymentStatus("failed")
        setError(error instanceof Error ? error.message : "An error occurred during verification")

        toast({
          title: "Verification Error",
          description: "Unable to verify payment. Please contact support.",
          variant: "destructive",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [txRef, transactionId, clearCart, toast])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Payment</h1>
          <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  const renderStatusIcon = () => {
    switch (paymentStatus) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-600" />
      case "failed":
        return <XCircle className="h-16 w-16 text-red-600" />
      default:
        return <Clock className="h-16 w-16 text-yellow-600" />
    }
  }

  const renderStatusMessage = () => {
    switch (paymentStatus) {
      case "success":
        return {
          title: "Payment Successful!",
          description: "Thank you for your order. We've received your payment and will process your order shortly.",
          bgColor: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-900 dark:text-green-100",
        }
      case "failed":
        return {
          title: "Payment Failed",
          description: error || "Your payment could not be processed. Please try again or contact support.",
          bgColor: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-900 dark:text-red-100",
        }
      default:
        return {
          title: "Payment Pending",
          description: "Your payment is being processed. Please wait for confirmation.",
          bgColor: "bg-yellow-50 dark:bg-yellow-950",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-900 dark:text-yellow-100",
        }
    }
  }

  const statusInfo = renderStatusMessage()

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          {renderStatusIcon()}
          <h1 className="text-3xl font-bold text-foreground mt-4 mb-2">{statusInfo.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{statusInfo.description}</p>
        </div>

        {/* Status Card */}
        <Card className={`mb-8 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <CardContent className="p-6">
            <div className={`flex items-start gap-4 ${statusInfo.textColor}`}>
              {paymentStatus === "success" ? (
                <CheckCircle className="h-6 w-6 mt-0.5" />
              ) : paymentStatus === "failed" ? (
                <AlertCircle className="h-6 w-6 mt-0.5" />
              ) : (
                <Clock className="h-6 w-6 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {paymentStatus === "success"
                    ? "Order Confirmed"
                    : paymentStatus === "failed"
                      ? "Payment Issue"
                      : "Processing Payment"}
                </h3>
                {paymentDetails && (
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Transaction ID:</strong> {paymentDetails.id}
                    </p>
                    <p>
                      <strong>Reference:</strong> {paymentDetails.txRef}
                    </p>
                    <p>
                      <strong>Amount:</strong> {paymentDetails.currency} {paymentDetails.amount.toLocaleString()}
                    </p>
                  </div>
                )}
                {orderDetails && (
                  <p className="text-sm mt-2">
                    <strong>Order ID:</strong> {orderDetails.orderId}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Customer & Shipping Info */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{orderDetails.customerInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{orderDetails.customerInfo.phone}</span>
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
                <CardContent>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="text-sm">
                      <p>{orderDetails.shippingAddress.street}</p>
                      <p>
                        {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}
                      </p>
                      <p>
                        {orderDetails.shippingAddress.country} {orderDetails.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted rounded-lg">
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

                  <Separator />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>UGX {orderDetails.totals.subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className={orderDetails.totals.shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {orderDetails.totals.shipping > 0
                          ? `UGX ${orderDetails.totals.shipping.toLocaleString()}`
                          : "Free"}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>UGX {orderDetails.totals.tax.toLocaleString()}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-green-600">UGX {orderDetails.totals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push("/store")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>

          {paymentStatus === "success" && (
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          )}

          {paymentStatus === "failed" && (
            <Button onClick={() => router.push("/checkout")} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          )}
        </div>

        {/* Next Steps */}
        {paymentStatus === "success" && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Order Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll prepare your items for shipping within 1-2 business days.
                  </p>
                </div>
                <div className="text-center p-4">
                  <Truck className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Your order will be shipped and you'll receive tracking information.
                  </p>
                </div>
                <div className="text-center p-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    Enjoy your new gear! Expected delivery in 3-7 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
