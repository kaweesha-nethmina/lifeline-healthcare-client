// Healthcare manager service for handling manager-related API calls
import { api, ApiResponse } from "@/lib/api"

export class ManagerService {
  // View healthcare data and analytics
  static async getData(): Promise<any | ApiResponse<any>> {
    const response = await api.get<any>("/manager/data")
    // Handle both direct response and ApiResponse formats
    return response
  }

  // Get resource utilization
  static async getResources(): Promise<any | ApiResponse<any>> {
    const response = await api.get<any>("/manager/resources")
    // Handle both direct response and ApiResponse formats
    return response
  }
}