interface FlutterwaveConfig {
  publicKey: string
  secretKey: string
  baseUrl: string
}

interface FlutterwaveCustomer {
  email: string
  phone_number: string
  name: string
}

interface FlutterwaveCustomization {
  title: string
  description: string
  logo: string
}

interface FlutterwavePaymentPayload {
  tx_ref: string
  amount: number
  currency: string
  customer: FlutterwaveCustomer
  customizations: FlutterwaveCustomization
  redirect_url: string
  payment_options?: string
  meta?: Record<string, any>
}

interface FlutterwaveResponse {
  status: string
  message: string
  data: {
    link: string
    [key: string]: any
  }
}

class FlutterwaveService {
  private config: FlutterwaveConfig

  constructor() {
    this.config = {
      publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY || "",
      baseUrl: "https://api.flutterwave.com/v3",
    }

    // Validate configuration
    if (!this.config.secretKey) {
      console.error("FLUTTERWAVE_SECRET_KEY is not set")
    }
    if (!this.config.publicKey) {
      console.error("NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY is not set")
    }
  }

  async initializePayment(payload: FlutterwavePaymentPayload): Promise<FlutterwaveResponse> {
    try {
      if (!this.config.secretKey) {
        throw new Error("Flutterwave secret key is not configured")
      }

      const response = await fetch(`${this.config.baseUrl}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Flutterwave API error:", result)
        throw new Error(`Flutterwave API error: ${response.status} - ${result.message || response.statusText}`)
      }

      return result
    } catch (error) {
      console.error("Flutterwave initialization error:", error)
      throw error
    }
  }

  async verifyPayment(transactionId: string): Promise<any> {
    try {
      if (!this.config.secretKey) {
        throw new Error("Flutterwave secret key is not configured")
      }

      const response = await fetch(`${this.config.baseUrl}/transactions/${transactionId}/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.secretKey}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Flutterwave verification error:", result)
        throw new Error(`Flutterwave verification error: ${response.status} - ${result.message || response.statusText}`)
      }

      return result
    } catch (error) {
      console.error("Flutterwave verification error:", error)
      throw error
    }
  }

  generateTransactionReference(orderId: string): string {
    return `AFG_${orderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async createPaymentLink(orderData: {
    orderId: string
    amount: number
    currency: string
    customer: FlutterwaveCustomer
    description: string
  }): Promise<string> {
    const payload: FlutterwavePaymentPayload = {
      tx_ref: this.generateTransactionReference(orderData.orderId),
      amount: orderData.amount,
      currency: orderData.currency,
      customer: orderData.customer,
      customizations: {
        title: "Afrigoals Store",
        description: orderData.description,
        logo: `${process.env.NEXT_PUBLIC_BASE_URL || "https://yoursite.com"}/logo.png`,
      },
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://yoursite.com"}/checkout/success`,
      payment_options: "card,banktransfer,ussd,mobilemoney",
      meta: {
        orderId: orderData.orderId,
      },
    }

    const response = await this.initializePayment(payload)

    if (response.status === "success") {
      return response.data.link
    } else {
      throw new Error(response.message || "Failed to create payment link")
    }
  }
}

export const flutterwaveService = new FlutterwaveService()
export default FlutterwaveService
