"use client"

import { useState } from "react"
import { ApiClient } from "@/lib/api"

export default function AuthTestPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testAuthEndpoint = async () => {
    setLoading(true)
    setTestResult("Testing /auth/login endpoint...")
    
    try {
      // Test the auth endpoint
      // This should be proxied to http://localhost:5000/api/auth/login
      const response = await ApiClient.get("/auth/login")
      setTestResult(`Auth Endpoint Test successful: ${JSON.stringify(response)}`)
    } catch (error: any) {
      // We expect this to fail since it's a GET request to a POST endpoint
      // But we can see if the connection works
      if (error.message.includes("Failed to fetch")) {
        setTestResult("Error: Could not connect to API. Please ensure the backend is running on http://localhost:5000")
      } else {
        setTestResult(`Auth endpoint accessible. Expected error for GET request: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Endpoint Test</h1>
      <button 
        onClick={testAuthEndpoint} 
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test /auth/login Endpoint"}
      </button>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Test Result:</h2>
        <p className="whitespace-pre-wrap">{testResult}</p>
      </div>
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Test the login functionality at <a href="/login" className="text-blue-600 hover:underline">/login</a></li>
          <li>Test the registration functionality at <a href="/register" className="text-blue-600 hover:underline">/register</a></li>
        </ul>
      </div>
    </div>
  )
}