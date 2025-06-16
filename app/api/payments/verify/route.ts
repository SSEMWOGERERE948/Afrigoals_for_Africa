import { type NextRequest, NextResponse } from "next/server"
import { flutterwaveService } from "@/lib/flutterwave"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, txRef } = body

    if (!transactionId && !txRef) {
      return NextResponse.json({ error: "Transaction ID or reference is required" }, { status: 400 })
    }

    // Verify payment with Flutterwave
    const verificationResult = await flutterwaveService.verifyPayment(transactionId || txRef)

    if (verificationResult.status === "success" && verificationResult.data.status === "successful") {
      // Payment is successful
      const paymentData = verificationResult.data

      // Here you would typically:
      // 1. Update order status in database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Log the transaction

      return NextResponse.json({
        success: true,
        verified: true,
        payment: {
          id: paymentData.id,
          txRef: paymentData.tx_ref,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          customer: paymentData.customer,
          createdAt: paymentData.created_at,
        },
        message: "Payment verified successfully",
      })
    } else {
      // Payment failed or pending
      return NextResponse.json({
        success: false,
        verified: false,
        status: verificationResult.data?.status || "failed",
        message: "Payment verification failed",
      })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
