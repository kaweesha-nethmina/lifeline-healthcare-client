// Emergency service for handling emergency-related API calls
import { api, ApiResponse } from "@/lib/api"

// Emergency case interface
export interface EmergencyCase {
  id: number
  patient_id: number
  case_status: string
  emergency_type: string
  resource_id: number
  created_at: string
  updated_at: string
}

// Emergency resource interface
export interface EmergencyResource {
  id: number
  resource_type: string
  status: string
  location: string
  created_at: string
  updated_at: string
}

export class EmergencyService {
  // Log emergency case
  static async logEmergencyCase(data: Partial<EmergencyCase>): Promise<ApiResponse<EmergencyCase>> {
    return api.post<EmergencyCase>("/emergency/emergency", data)
  }

  // Create emergency resource
  static async createResource(data: Partial<EmergencyResource>): Promise<ApiResponse<EmergencyResource>> {
    return api.post<EmergencyResource>("/emergency/resources", data)
  }

  // View available resources
  static async getAvailableResources(): Promise<ApiResponse<EmergencyResource[]>> {
    return api.get<EmergencyResource[]>("/emergency/resources")
  }

  // Get all emergency cases
  static async getAllCases(): Promise<ApiResponse<EmergencyCase[]>> {
    return api.get<EmergencyCase[]>("/emergency/cases")
  }

  // Update emergency case status
  static async updateCaseStatus(caseId: number, data: Partial<EmergencyCase>): Promise<ApiResponse<EmergencyCase>> {
    return api.put<EmergencyCase>(`/emergency/cases/${caseId}`, data)
  }
}