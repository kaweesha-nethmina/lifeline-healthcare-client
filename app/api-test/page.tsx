"use client"

import { useState, useEffect } from "react"
import { PatientService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"

export default function ApiTestPage() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user?.role === "patient") {
      fetchPatientProfile()
    }
  }, [isAuthenticated, user])

  const fetchPatientProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await PatientService.getProfile()
      setProfile(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile")
      console.error("API Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="p-4">Please log in to test API integration</div>
  }

  if (user?.role !== "patient") {
    return <div className="p-4">This test is only available for patients</div>
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Integration Test</h1>
      
      <div className="mb-4">
        <button 
          onClick={fetchPatientProfile}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Loading..." : "Fetch Patient Profile"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {profile && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Patient Profile</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}

      {!profile && !loading && !error && (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded">
          Click the button above to fetch your patient profile
        </div>
      )}
    </div>
  )
}