"use client"

import { useState } from "react"
import { ApiClient } from "@/lib/api"

export default function ProxyTestPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testProxyConnection = async () => {
    setLoading(true)
    setTestResult("Testing proxy connection...")
    
    try {
      // Test the proxy by making a request to /api/users/login
      // This should be proxied to http://localhost:5000/api/users/login
      const response = await ApiClient.get("/users/login")
      setTestResult(`Proxy Connection successful: ${JSON.stringify(response)}`)
    } catch (error: any) {
      setTestResult(`Proxy test failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Proxy Connection Test</h1>
      <button 
        onClick={testProxyConnection} 
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Proxy Connection"}
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