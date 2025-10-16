// Insurance service for handling insurance-related API calls
import { api, ApiResponse } from "@/lib/api"

// Insurance provider interface
export interface InsuranceProvider {
  id: number
  name: string
  contact_info: string
  coverage_details: string
  created_at: string
  updated_at: string
}

// Insurance claim interface
export interface InsuranceClaim {
  id: number
  patient_id: number
  insurance_provider_id: number
  claim_status: string
  claim_amount: number
  claim_date: string
  created_at: string
  updated_at: string
}

export class InsuranceService {
  // Verify insurance eligibility
  static async verifyEligibility(data: { patient_id: number; insurance_provider_user_id?: number; insurance_provider_id?: number }): Promise<ApiResponse<any>> {
    return api.post<any>("/insurance/verify-eligibility", data)
  }

  // Process insurance claim
  static async processClaim(data: { patient_id: number; insurance_provider_user_id?: number; insurance_provider_id?: number; claim_amount: number }): Promise<ApiResponse<InsuranceClaim>> {
    return api.post<InsuranceClaim>("/insurance/process-claim", data)
  }

  // Get insurance providers
  static async getProviders(): Promise<ApiResponse<InsuranceProvider[]>> {
    return api.get<InsuranceProvider[]>("/insurance/providers")
  }

  // Get patient insurance claims
  static async getPatientClaims(patientId: number): Promise<ApiResponse<InsuranceClaim[]>> {
    return api.get<InsuranceClaim[]>(`/insurance/claims/${patientId}`)
  }
}