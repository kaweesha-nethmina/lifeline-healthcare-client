"use client"

export default function TimezoneTestPage() {
  // Set today to 10/16/2025 to match your example
  const today = new Date("2025-10-16")
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Timezone Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Current Date Information (Simulated as 10/16/2025)</h2>
          <p>new Date("2025-10-16"): {today.toString()}</p>
          <p>new Date("2025-10-16").toISOString(): {today.toISOString()}</p>
          <p>new Date("2025-10-16").toISOString().split('T')[0]: {today.toISOString().split('T')[0]}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Test Appointment Date</h2>
          <p>Appointment Date: 2025-10-16T10:00:00+00:00</p>
          <p>new Date("2025-10-16T10:00:00+00:00"): {new Date("2025-10-16T10:00:00+00:00").toString()}</p>
          <p>new Date("2025-10-16T10:00:00+00:00").toISOString(): {new Date("2025-10-16T10:00:00+00:00").toISOString()}</p>
          <p>new Date("2025-10-16T10:00:00+00:00").toISOString().split('T')[0]: {new Date("2025-10-16T10:00:00+00:00").toISOString().split('T')[0]}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Date Comparison</h2>
          <p>Today's date (ISO): {today.toISOString().split('T')[0]}</p>
          <p>Appointment date (ISO): {new Date("2025-10-16T10:00:00+00:00").toISOString().split('T')[0]}</p>
          <p>Are they equal? {today.toISOString().split('T')[0] === new Date("2025-10-16T10:00:00+00:00").toISOString().split('T')[0] ? "Yes" : "No"}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Local Date Test</h2>
          <p>new Date("2025-10-16"): {new Date("2025-10-16").toString()}</p>
          <p>new Date("2025-10-16").toISOString(): {new Date("2025-10-16").toISOString()}</p>
          <p>new Date("2025-10-16").toISOString().split('T')[0]: {new Date("2025-10-16").toISOString().split('T')[0]}</p>
        </div>
      </div>
    </div>
  )
}