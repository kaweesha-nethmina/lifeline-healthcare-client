# API Services

This directory contains all the API service integrations for the Lifeline Healthcare System.

## Overview

Each service file corresponds to a specific user role or functionality area in the system. All services use the shared API client infrastructure and include proper TypeScript typing.

## Services

- `patient-service.ts` - Patient profile, appointments, medical records
- `doctor-service.ts` - Doctor profile, patient medical records, appointments
- `nurse-service.ts` - Patient care information
- `staff-service.ts` - Patient check-in, patient information
- `admin-service.ts` - User management, system configuration
- `manager-service.ts` - Healthcare data, resource utilization
- `system-admin-service.ts` - System maintenance, logs, backups
- `emergency-service.ts` - Emergency cases, resources
- `payment-service.ts` - Payment processing, history
- `insurance-service.ts` - Insurance verification, claims
- `prescription-service.ts` - Prescription management
- `notification-service.ts` - User notifications

## Admin Service Methods

The AdminService includes the following methods for user and system management:

- `createUser(data)` - Create a new user
- `configureSystem(data)` - Configure system settings
- `getAllUsers()` - Get all users in the system (returns AdminUser[] with extended properties)
- `getUserById(id)` - Get a specific user by ID (returns AdminUser with extended properties)
- `updateUser(id, data)` - Update a specific user
- `deleteUser(id)` - Delete a specific user

## Admin User Interface

The AdminUser interface extends the base User interface with additional properties:

```typescript
interface AdminUser extends User {
  phone_number: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}
```

## Usage

### Importing Services

You can import individual services:

```typescript
import { PatientService } from '@/lib/services/patient-service'
```

Or import all services through the index:

```typescript
import { PatientService, DoctorService } from '@/lib/services'
```

### Using Services in Components

```typescript
'use client'

import { useState, useEffect } from 'react'
import { PatientService } from '@/lib/services'

export default function PatientProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const response = await PatientService.getProfile()
        setProfile(response.data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!profile) return <div>No profile data</div>
  
  return <div>{/* Render profile data */}</div>
}
```

### Error Handling

All services can throw errors which should be handled appropriately:

```typescript
try {
  const response = await PatientService.getProfile()
  // Handle successful response
} catch (error) {
  if (error instanceof Error) {
    // Handle known errors
    console.error('API Error:', error.message)
  } else {
    // Handle unknown errors
    console.error('Unknown error occurred')
  }
}
```

## Authentication

All services automatically include the authentication token from localStorage in requests. No additional configuration is needed.

## Adding New Services

To add a new service:

1. Create a new file in this directory following the naming pattern `[role]-service.ts`
2. Import the `api` client from `@/lib/api`
3. Define TypeScript interfaces for data structures
4. Create a class with static methods for each API endpoint
5. Export the class and interfaces
6. Add the new service to the index.ts file

## Service Method Patterns

All service methods follow these patterns:

- `get<Entity>()` - For retrieving data
- `create<Entity>()` or `post<Entity>()` - For creating new entities
- `update<Entity>()` or `put<Entity>()` - For updating existing entities
- `delete<Entity>()` - For deleting entities

Methods accept typed parameters and return `Promise<ApiResponse<T>>` where T is the expected response type.