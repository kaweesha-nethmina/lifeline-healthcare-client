"use client"

import { useState } from "react"
import { ApiClient } from "@/lib/api"

export default function TestLoginPage() {
  const [email, setEmail] = useState("insuarenceprovider@gmail.com")
  const [password, setPassword] = useState("123456")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult("Testing login...")

    try {
      const response = await ApiClient.post("/auth/login", {
        email,
        password
      })
      setResult(`Login successful: ${JSON.stringify(response)}`)
    } catch (error: any) {
      setResult(`Login failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Login</h1>
      <form onSubmit={testLogin} className="max-w-md space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Test Login"}
        </button>
      </form>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Result:</h2>
        <p className="whitespace-pre-wrap">{result}</p>
      </div>
    </div>
  )
}