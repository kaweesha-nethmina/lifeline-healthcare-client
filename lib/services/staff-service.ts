// Hospital staff service for handling staff-related API calls
import { api, ApiResponse } from "@/lib/api"
import { Payment as BasePayment } from "@/lib/services/payment-service"

// Payment interface with patient details for staff
export interface Payment extends BasePayment {
  patients: {
    id: number
    user_id: number
    date_of_birth: string | null
    gender: string | null
    phone_number: string | null
    address: string | null
    insurance_details: string | null
    medical_history: string | null
    emergency_contact: string | null
    users: {
      id: number
      name: string
      email: string
      profile_picture_url: string | null
      phone_number: string | null
      date_of_birth: string | null
      gender: string | null
      address: string | null
      emergency_contact: string | null
      created_at: string
      updated_at: string
    }
  }
}

// Patient information interface
export interface PatientInfo {
  id: number
  user_id: number
  date_of_birth: string | null
  gender: string | null
  phone_number: string | null
  address: string | null
  insurance_details: string | null
  medical_history: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
  users: {
    name: string
    email: string
    profile_picture_url: string | null
    phone_number: string | null
    date_of_birth: string | null
    gender: string | null
    address: string | null
    emergency_contact: string | null
    created_at: string
    updated_at: string
  }
  check_ins?: CheckInRecord[]
}

// Check-in record interface
export interface CheckInRecord {
  id: number
  check_in_time: string
  department: string
  reason_for_visit: string
  created_at: string
}

// Checked-in patient interface
export interface CheckedInPatient {
  id: number
  check_in_time: string
  department: string | null
  reason_for_visit: string
  created_at: string
  patients: {
    id: number
    user_id: number
    date_of_birth: string | null
    gender: string | null
    phone_number: string | null
    address: string | null
    insurance_details: string | null
    medical_history: string | null
    emergency_contact: string | null
    users: {
      id: number
      name: string
      email: string
      profile_picture_url: string | null
      phone_number: string | null
      date_of_birth: string | null
      gender: string | null
      address: string | null
      emergency_contact: string | null
      created_at: string
      updated_at: string
    }
  }
}

// Pending check-in interface
export interface PendingCheckIn {
  id: number
  appointment_date: string
  status: string
  location: string
  created_at: string
  updated_at: string
  patients: {
    id: number
    user_id: number
    date_of_birth: string | null
    gender: string | null
    phone_number: string | null
    address: string | null
    insurance_details: string | null
    medical_history: string | null
    emergency_contact: string | null
    users: {
      id: number
      name: string
      email: string
      profile_picture_url: string | null
      phone_number: string | null
      date_of_birth: string | null
      gender: string | null
      address: string | null
      emergency_contact: string | null
      created_at: string
      updated_at: string
    }
  }
  doctors: {
    id: number
    user_id: number
    specialty: string | null
    qualification: string | null
    schedule: string | null
    users: {
      id: number
      name: string
      email: string
      profile_picture_url: string | null
      phone_number: string | null
      date_of_birth: string | null
      gender: string | null
      address: string | null
      emergency_contact: string | null
      created_at: string
      updated_at: string
    }
  }
}

// Doctor information interface
export interface DoctorInfo {
  id: number
  user_id: number
  specialty: string | null
  qualification: string | null
  schedule: string | null
  created_at: string
  updated_at: string
  users: {
    name: string
    email: string
    profile_picture_url: string | null
    phone_number: string | null
    date_of_birth: string | null
    gender: string | null
    address: string | null
    emergency_contact: string | null
    created_at: string
    updated_at: string
  }
}

// Check-in information interface
export interface CheckInInfo {
  id?: number
  check_in_time: string
  department: string
  reason_for_visit: string
  created_at?: string
}

// Payment confirmation interface
export interface PaymentInfo {
  id?: number
  amount: number
  payment_method: string
  description: string
  created_at?: string
}

export class StaffService {
  // Patient check-in
  static async checkInPatient(patientId: number, data: CheckInInfo): Promise<{message: string, patient: PatientInfo, checkInRecord: CheckInRecord}> {
    console.log(`Checking in patient ${patientId} with data:`, data);
    try {
      const response = await api.post<{message: string, patient: PatientInfo, checkInRecord: CheckInRecord}>(`/staff/check-in/${patientId}`, data);
      console.log("Check-in response:", response);
      return response as {message: string, patient: PatientInfo, checkInRecord: CheckInRecord};
    } catch (error) {
      console.error("Check-in API error:", error);
      throw error;
    }
  }

  // Confirm patient payment
  static async confirmPatientPayment(patientId: number, data: PaymentInfo): Promise<{message: string, payment: PaymentInfo}> {
    const response = await api.post<{message: string, payment: PaymentInfo}>(`/staff/patients/${patientId}/confirm-payment`, data);
    return response as {message: string, payment: PaymentInfo};
  }

  // Get patient information
  static async getPatientInfo(patientId: number): Promise<PatientInfo> {
    const response = await api.get<PatientInfo>(`/staff/patients/${patientId}`)
    return response as PatientInfo
  }

  // Get all patients
  static async getAllPatients(): Promise<PatientInfo[]> {
    const response = await api.get<PatientInfo[]>(`/staff/patients`)
    return response as PatientInfo[]
  }

  // Get all doctors
  static async getAllDoctors(): Promise<DoctorInfo[]> {
    const response = await api.get<DoctorInfo[]>(`/staff/doctors`)
    return response as DoctorInfo[]
  }

  // Get pending check-ins
  static async getPendingCheckIns(): Promise<PendingCheckIn[]> {
    const response = await api.get<PendingCheckIn[]>(`/staff/pending-check-ins`)
    return response as PendingCheckIn[]
  }

  // Get checked-in patients
  static async getCheckedInPatients(): Promise<CheckedInPatient[]> {
    const response = await api.get<CheckedInPatient[]>(`/staff/checked-in-patients`)
    return response as CheckedInPatient[]
  }

  // Get all payments (for staff payment history)
  static async getAllPayments(): Promise<Payment[]> {
    const response = await api.get<Payment[]>(`/staff/payments`)
    return response as Payment[]
  }

  // Get payment by ID
  static async getPaymentById(paymentId: number): Promise<Payment> {
    const response = await api.get<Payment>(`/staff/payments/${paymentId}`)
    return response as Payment
  }
}