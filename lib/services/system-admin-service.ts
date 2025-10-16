// System administrator service for handling system admin-related API calls
import { api, ApiResponse } from "@/lib/api"

export class SystemAdminService {
  // Perform system maintenance
  static async performMaintenance(data: any): Promise<ApiResponse<any>> {
    return api.post<any>("/system-admin/system-maintenance", data)
  }

  // Monitor system logs
  static async getLogs(): Promise<ApiResponse<any>> {
    return api.get<any>("/system-admin/logs")
  }

  // Create system backup
  static async createBackup(data: any): Promise<ApiResponse<any>> {
    return api.post<any>("/system-admin/backup", data)
  }
}