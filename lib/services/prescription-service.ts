// Prescription service for handling prescription-related API calls
import { api, ApiResponse } from "@/lib/api"

// Prescription interface
export interface Prescription {
  id: number
  medical_record_id: number
  medication: string
  dosage: string
  pharmacy_id: number
  created_at: string
  updated_at: string
}

export class PrescriptionService {
  // Create prescription
  static async createPrescription(data: Partial<Prescription>): Promise<ApiResponse<Prescription>> {
    return api.post<Prescription>("/prescriptions", data)
  }

  // Get prescriptions by medical record
  static async getPrescriptionsByMedicalRecord(medicalRecordId: number): Promise<ApiResponse<Prescription[]>> {
    return api.get<Prescription[]>(`/prescriptions/medical-record/${medicalRecordId}`)
  }

  // Update prescription
  static async updatePrescription(id: number, data: Partial<Prescription>): Promise<ApiResponse<Prescription>> {
    return api.put<Prescription>(`/prescriptions/${id}`, data)
  }

  // Delete prescription
  static async deletePrescription(id: number): Promise<ApiResponse<any>> {
    return api.delete<any>(`/prescriptions/${id}`)
  }
}