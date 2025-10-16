# Lifeline Healthcare System - API Integration Summary

This document summarizes the API integration implementation for the Lifeline Smart Healthcare System client.

## Overview

We have implemented a comprehensive service layer that integrates with all backend API endpoints as documented in the API specification. Each service is organized by user role and functionality area, with proper TypeScript typing for all data structures.

## Service Structure

The API integration is organized into the following service files:

1. **Patient Service** (`patient-service.ts`) - Patient profile, appointments, medical records
2. **Doctor Service** (`doctor-service.ts`) - Doctor profile, patient medical records, appointments
3. **Nurse Service** (`nurse-service.ts`) - Patient care information
4. **Staff Service** (`staff-service.ts`) - Patient check-in, patient information
5. **Admin Service** (`admin-service.ts`) - User management, system configuration
6. **Manager Service** (`manager-service.ts`) - Healthcare data, resource utilization
7. **System Admin Service** (`system-admin-service.ts`) - System maintenance, logs, backups
8. **Emergency Service** (`emergency-service.ts`) - Emergency cases, resources
9. **Payment Service** (`payment-service.ts`) - Payment processing, history
10. **Insurance Service** (`insurance-service.ts`) - Insurance verification, claims
11. **Prescription Service** (`prescription-service.ts`) - Prescription management
12. **Notification Service** (`notification-service.ts`) - User notifications

## Key Features

### Authentication
- Login and registration are already working correctly as per requirements
- All services automatically include authentication tokens in requests
- Proper error handling for authentication failures

### Role-Based Access
- Services are organized by user roles as defined in the API documentation
- Each service only includes endpoints relevant to that role
- Proper TypeScript interfaces for all data structures

### Error Handling
- Consistent error handling across all services
- Proper typing for API responses
- Network error detection and user-friendly messages

### Data Validation
- TypeScript interfaces for all request/response objects
- Partial updates supported where appropriate
- Type safety for all API interactions

## Usage Examples

### Patient Profile Update
```typescript
import { PatientService } from '@/lib/services'

const updatedProfile = await PatientService.updateProfile({
  phone_number: '+1234567890',
  address: '123 Main St, City, Country'
})
```

### Doctor Creating Medical Record
```typescript
import { DoctorService } from '@/lib/services'

const medicalRecord = await DoctorService.createMedicalRecord(patientId, {
  diagnosis: 'Hypertension',
  treatment_plan: 'Prescribed medication and lifestyle changes',
  prescriptions: 'Lisinopril 10mg daily'
})
```

### Admin Creating New User
```typescript
import { AdminService } from '@/lib/services'

const newUser = await AdminService.createUser({
  email: 'dr.smith@example.com',
  name: 'Dr. Smith',
  role: 'doctor',
  password: 'doctorPassword123'
})
```

## Implementation Notes

1. **No Changes to Login**: As requested, the login functionality has not been modified since it's already working correctly.

2. **Consistent API Client**: All services use the existing `api` client from `@/lib/api` which handles:
   - Authentication token management
   - Request/response processing
   - Error handling
   - CORS configuration

3. **Type Safety**: All services include proper TypeScript interfaces for:
   - Request payloads
   - Response objects
   - Error responses

4. **Path Parameters**: Services properly handle path parameters (e.g., patient IDs, case IDs) as required by the API.

5. **Export Convenience**: All services are exported through `@/lib/services/index.ts` for easy imports.

## Available Services

### PatientService
- `getProfile()` - Retrieve authenticated patient's profile
- `updateProfile(data)` - Update patient profile information
- `bookAppointment(data)` - Book a new appointment
- `getAppointmentHistory()` - Get patient's appointment history
- `getMedicalRecords()` - Get patient's medical records

### DoctorService
- `getProfile()` - Retrieve authenticated doctor's profile
- `updateProfile(data)` - Update doctor profile information
- `getPatientMedicalRecords(patientId)` - Get medical records for a patient
- `createMedicalRecord(patientId, data)` - Create medical record for a patient
- `getAppointmentSchedule()` - Get doctor's appointment schedule

### NurseService
- `updatePatientCare(patientId, data)` - Update patient care information
- `getPatientCareHistory(patientId)` - Get patient care history

### StaffService
- `checkInPatient(patientId, data)` - Check in a patient
- `getPatientInfo(patientId)` - Get patient information

### AdminService
- `createUser(data)` - Create a new user
- `configureSystem(data)` - Configure system settings
- `getAllUsers()` - Get all users in the system

### ManagerService
- `getData()` - Get healthcare data and analytics
- `getResources()` - Get resource utilization information

### SystemAdminService
- `performMaintenance(data)` - Perform system maintenance
- `getLogs()` - Get system logs
- `createBackup(data)` - Create system backup

### EmergencyService
- `logEmergencyCase(data)` - Log a new emergency case
- `createResource(data)` - Create a new emergency resource
- `getAvailableResources()` - Get all emergency resources
- `getAllCases()` - Get all emergency cases
- `updateCaseStatus(caseId, data)` - Update emergency case status

### PaymentService
- `processPayment(data)` - Process a payment
- `getPaymentHistory(patientId)` - Get payment history for a patient
- `getPaymentById(paymentId)` - Get a specific payment by ID

### InsuranceService
- `verifyEligibility(data)` - Verify insurance eligibility
- `processClaim(data)` - Process an insurance claim
- `getProviders()` - Get all insurance providers
- `getPatientClaims(patientId)` - Get insurance claims for a patient

### PrescriptionService
- `createPrescription(data)` - Create a new prescription
- `getPrescriptionsByMedicalRecord(medicalRecordId)` - Get prescriptions for a medical record
- `updatePrescription(id, data)` - Update a prescription
- `deletePrescription(id)` - Delete a prescription

### NotificationService
- `getUserNotifications()` - Get notifications for authenticated user
- `createNotification(data)` - Create a new notification
- `updateNotificationStatus(id, data)` - Update notification status
- `markAsRead(id)` - Mark notification as read
- `deleteNotification(id)` - Delete a notification

## Integration with Existing Code

The services are designed to integrate seamlessly with the existing codebase:
- Use the same authentication mechanism as the existing login system
- Follow the same error handling patterns
- Use the existing API client infrastructure
- Maintain consistency with existing coding patterns

## Usage in Components

To use any service in a component:

```typescript
'use client'

import { PatientService } from '@/lib/services'

export default function PatientProfile() {
  const [profile, setProfile] = useState(null)
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await PatientService.getProfile()
        setProfile(response.data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }
    
    fetchProfile()
  }, [])
  
  // Render profile data
}
```

This implementation provides a clean, type-safe, and organized way to interact with all backend API endpoints while maintaining consistency with the existing codebase.