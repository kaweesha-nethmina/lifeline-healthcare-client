"use client"

import { useState } from "react"

export default function TestUsersEndpointPage() {
  const [email, setEmail] = useState("insuarenceprovider@gmail.com")
  const [password, setPassword] = useState("123456")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testUsersEndpoint = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult("Testing /users/login endpoint...")

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.text()
      setResult(`Users endpoint response: ${response.status} ${response.statusText}\n${data}`)
    } catch (error: any) {
      setResult(`Users endpoint error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Users Endpoint</h1>
      <form className="max-w-md space-y-4">
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
          type="button" 
          onClick={testUsersEndpoint}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Test /users/login Endpoint
        </button>
      </form>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Result:</h2>
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  )
}