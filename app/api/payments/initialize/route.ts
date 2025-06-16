import { type NextRequest, NextResponse } from "next/server"
import { flutterwaveService } from "@/lib/flutterwave"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { orderId, amount, currency, customer, description, items, addresses, notes } = body

    if (!orderId || !amount || !customer || !customer.email || !customer.name || !customer.phone_number) {
      return NextResponse.json({ error: "Missing required payment information" }, { status: 400 })
    }

    // Validate environment variables
    if (!process.env.FLUTTERWAVE_SECRET_KEY || !process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY) {
      console.error("Missing Flutterwave environment variables")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    // Create payment link using the service
    const paymentData = {
      orderId,
      amount,
      currency: currency || "UGX",
      customer,
      description: description || `Order ${orderId}`,
    }

    const paymentLink = await flutterwaveService.createPaymentLink(paymentData)

    // Store order details in a database or session (for now, we'll rely on localStorage)
    // In production, you'd save this to your database
    const orderDetails = {
      orderId,
      amount,
      currency: currency || "UGX",
      customer,
      items,
      addresses,
      notes,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      paymentLink,
      orderId,
      message: "Payment link created successfully",
    })
  } catch (error) {
    console.error("Payment initialization error:", error)

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        return NextResponse.json(
          { error: "Payment service authentication failed. Please check API keys." },
          { status: 401 },
        )
      }
      if (error.message.includes("400")) {
        return NextResponse.json(
          { error: "Invalid payment request. Please check the payment details." },
          { status: 400 },
        )
      }
    }

    return NextResponse.json({ error: "Failed to initialize payment. Please try again." }, { status: 500 })
  }
}
