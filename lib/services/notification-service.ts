// Notification service for handling notification-related API calls
import { api, ApiResponse } from "@/lib/api"

// Notification interface
export interface Notification {
  id: number
  user_id: number
  message: string
  notification_type: string
  status: string
  created_at: string
  updated_at: string
}

export class NotificationService {
  // Get user notifications
  static async getUserNotifications(): Promise<ApiResponse<Notification[]>> {
    return api.get<Notification[]>("/notifications")
  }

  // Create notification
  static async createNotification(data: Partial<Notification>): Promise<ApiResponse<Notification>> {
    return api.post<Notification>("/notifications", data)
  }

  // Update notification status
  static async updateNotificationStatus(id: number, data: { status: string }): Promise<ApiResponse<Notification>> {
    return api.put<Notification>(`/notifications/${id}/status`, data)
  }

  // Mark notification as read
  static async markAsRead(id: number): Promise<ApiResponse<Notification>> {
    return api.put<Notification>(`/notifications/${id}/read`)
  }

  // Delete notification
  static async deleteNotification(id: number): Promise<ApiResponse<any>> {
    return api.delete<any>(`/notifications/${id}`)
  }
}