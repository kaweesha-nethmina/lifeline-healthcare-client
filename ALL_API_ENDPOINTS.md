# All API Endpoints Used in Pages

This document provides a comprehensive list of all API endpoints currently being used in the Lifeline Smart Healthcare System frontend application.

## Patient Endpoints

### 1. Patient Dashboard Page (`/app/patient/dashboard/page.tsx`)
- `GET /patients/appointments` - Fetch appointment history
- `GET /patients/medical-records` - Fetch medical records

### 2. Patient Appointments Page (`/app/patient/appointments/page.tsx`)
- `GET /patients/appointments` - Fetch all appointments

### 3. Patient Medical Records Page (`/app/patient/medical-records/page.tsx`)
- `GET /patients/medical-records` - Fetch all medical records

### 4. Patient Profile Page (`/app/patient/profile/page.tsx`)
- `GET /patients/profile` - Fetch patient profile
- `PUT /patients/profile` - Update patient profile

## Doctor Endpoints

### 5. Doctor Dashboard Page (`/app/doctor/dashboard/page.tsx`)
- `GET /doctors/profile` - Fetch doctor profile
- `GET /doctors/appointments` - Fetch appointment schedule

## API Test Page

### 6. API Test Page (`/app/api-test/page.tsx`)
- `GET /patients/profile` - Fetch patient profile (for testing)

## Service Layer Endpoints

The following endpoints are defined in the service layer but may not yet be used in pages:

### Patient Service (`lib/services/patient-service.ts`)
- `GET /patients/profile` - Get patient profile
- `PUT /patients/profile` - Update patient profile
- `POST /patients/appointments` - Book appointment
- `GET /patients/appointments` - Get appointment history
- `GET /patients/medical-records` - Get medical records

### Doctor Service (`lib/services/doctor-service.ts`)
- `GET /doctors/profile` - Get doctor profile
- `PUT /doctors/profile` - Update doctor profile
- `GET /doctors/patients/:id/medical-records` - View patient medical records
- `POST /doctors/patients/:id/medical-records` - Create medical record for patient
- `GET /doctors/appointments` - Get appointment schedule

### Nurse Service (`lib/services/nurse-service.ts`)
- `POST /nurses/patients/:id/care` - Update patient care information
- `GET /nurses/patients/:id/care` - Get patient care history

### Staff Service (`lib/services/staff-service.ts`)
- `POST /staff/check-in/:id` - Patient check-in
- `GET /staff/patients/:id` - Get patient information

### Admin Service (`lib/services/admin-service.ts`)
- `POST /admin/create-user` - Create user
- `POST /admin/configure-system` - Configure system
- `GET /admin/users` - Get all users

### Manager Service (`lib/services/manager-service.ts`)
- `GET /manager/data` - View healthcare data and analytics
- `GET /manager/resources` - Get resource utilization

### System Admin Service (`lib/services/system-admin-service.ts`)
- `POST /system-admin/system-maintenance` - Perform system maintenance
- `GET /system-admin/logs` - Monitor system logs
- `POST /system-admin/backup` - Create system backup

### Emergency Service (`lib/services/emergency-service.ts`)
- `POST /emergency/emergency` - Log emergency case
- `POST /emergency/resources` - Create emergency resource
- `GET /emergency/resources` - View available resources
- `GET /emergency/cases` - Get all emergency cases
- `PUT /emergency/cases/:id` - Update emergency case status

### Payment Service (`lib/services/payment-service.ts`)
- `POST /payments/process-payment` - Process payment
- `GET /payments/payment-history/:patientId` - Get payment history
- `GET /payments/:id` - Get payment by ID

### Insurance Service (`lib/services/insurance-service.ts`)
- `POST /insurance/verify-eligibility` - Verify insurance eligibility
- `POST /insurance/process-claim` - Process insurance claim
- `GET /insurance/providers` - Get insurance providers
- `GET /insurance/claims/:patientId` - Get patient insurance claims

### Prescription Service (`lib/services/prescription-service.ts`)
- `POST /prescriptions` - Create prescription
- `GET /prescriptions/medical-record/:medicalRecordId` - Get prescriptions by medical record
- `PUT /prescriptions/:id` - Update prescription
- `DELETE /prescriptions/:id` - Delete prescription

### Notification Service (`lib/services/notification-service.ts`)
- `GET /notifications` - Get user notifications
- `POST /notifications` - Create notification
- `PUT /notifications/:id/status` - Update notification status
- `PUT /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

## Summary by HTTP Method

### GET Endpoints (15)
1. `GET /patients/profile`
2. `GET /patients/appointments`
3. `GET /patients/medical-records`
4. `GET /doctors/profile`
5. `GET /doctors/appointments`
6. `GET /doctors/patients/:id/medical-records`
7. `GET /nurses/patients/:id/care`
8. `GET /staff/patients/:id`
9. `GET /admin/users`
10. `GET /manager/data`
11. `GET /manager/resources`
12. `GET /system-admin/logs`
13. `GET /emergency/resources`
14. `GET /emergency/cases`
15. `GET /notifications`
16. `GET /insurance/providers`
17. `GET /insurance/claims/:patientId`
18. `GET /prescriptions/medical-record/:medicalRecordId`
19. `GET /payments/payment-history/:patientId`
20. `GET /payments/:id`

### POST Endpoints (15)
1. `POST /patients/appointments`
2. `POST /doctors/patients/:id/medical-records`
3. `POST /nurses/patients/:id/care`
4. `POST /staff/check-in/:id`
5. `POST /admin/create-user`
6. `POST /admin/configure-system`
7. `POST /manager/data`
8. `POST /manager/resources`
9. `POST /system-admin/system-maintenance`
10. `POST /system-admin/backup`
11. `POST /emergency/emergency`
12. `POST /emergency/resources`
13. `POST /payments/process-payment`
14. `POST /insurance/verify-eligibility`
15. `POST /insurance/process-claim`
16. `POST /prescriptions`
17. `POST /notifications`

### PUT Endpoints (7)
1. `PUT /patients/profile`
2. `PUT /doctors/profile`
3. `PUT /emergency/cases/:id`
4. `PUT /notifications/:id/status`
5. `PUT /notifications/:id/read`
6. `PUT /prescriptions/:id`

### DELETE Endpoints (2)
1. `DELETE /prescriptions/:id`
2. `DELETE /notifications/:id`

## Currently Used vs. Available Endpoints

### Currently Used in Pages (6 endpoints)
1. `GET /patients/profile`
2. `PUT /patients/profile`
3. `GET /patients/appointments`
4. `GET /patients/medical-records`
5. `GET /doctors/profile`
6. `GET /doctors/appointments`

### Available but Not Yet Used in Pages (23 endpoints)
1. `POST /patients/appointments`
2. `GET /doctors/patients/:id/medical-records`
3. `POST /doctors/patients/:id/medical-records`
4. `POST /nurses/patients/:id/care`
5. `GET /nurses/patients/:id/care`
6. `POST /staff/check-in/:id`
7. `GET /staff/patients/:id`
8. `POST /admin/create-user`
9. `POST /admin/configure-system`
10. `GET /admin/users`
11. `GET /manager/data`
12. `GET /manager/resources`
13. `POST /system-admin/system-maintenance`
14. `GET /system-admin/logs`
15. `POST /system-admin/backup`
16. `POST /emergency/emergency`
17. `POST /emergency/resources`
18. `GET /emergency/resources`
19. `GET /emergency/cases`
20. `PUT /emergency/cases/:id`
21. `POST /payments/process-payment`
22. `GET /payments/payment-history/:patientId`
23. `GET /payments/:id`
24. `POST /insurance/verify-eligibility`
25. `POST /insurance/process-claim`
26. `GET /insurance/providers`
27. `GET /insurance/claims/:patientId`
28. `POST /prescriptions`
29. `GET /prescriptions/medical-record/:medicalRecordId`
30. `PUT /prescriptions/:id`
31. `DELETE /prescriptions/:id`
32. `GET /notifications`
33. `POST /notifications`
34. `PUT /notifications/:id/status`
35. `PUT /notifications/:id/read`
36. `DELETE /notifications/:id`

## Summary

- **Total Available Endpoints**: 39
- **Currently Used in Pages**: 6
- **Available but Not Yet Used**: 33
- **Usage Percentage**: ~15%

This shows that while we've integrated real API data into several key pages, the majority of the available API endpoints are not yet utilized in the frontend application. These endpoints are available in the service layer and can be integrated into additional pages as needed.