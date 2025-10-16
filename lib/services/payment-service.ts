// Payment service for handling payment-related API calls
import { api, ApiResponse } from "@/lib/api"

// Payment interface
export interface Payment {
  id: number
  patient_id: number
  amount: number
  payment_method: string
  payment_status: string
  payment_date: string
  description: string
  created_at: string
  updated_at: string
}

// Payment processing interface
interface ProcessPaymentData {
  patient_id: number
  amount: number
  payment_method: string
  description: string
}

export class PaymentService {
  // Process payment
  static async processPayment(data: ProcessPaymentData): Promise<ApiResponse<Payment>> {
    return api.post<Payment>("/payments/process-payment", data)
  }

  // Get payment history for patient
  static async getPaymentHistory(patientId: number): Promise<ApiResponse<Payment[]>> {
    return api.get<Payment[]>(`/payments/payment-history/${patientId}`)
  }

  // Get payment by ID
  static async getPaymentById(paymentId: number): Promise<ApiResponse<Payment>> {
    return api.get<Payment>(`/payments/${paymentId}`)
  }
}