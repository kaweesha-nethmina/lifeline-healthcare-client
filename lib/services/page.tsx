import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Calendar, FileText, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white text-balance">
            Lifeline Smart Healthcare System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-pretty">
            Comprehensive healthcare management platform connecting patients, doctors, and healthcare providers
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
              <Calendar className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Easy Appointments</CardTitle>
              <CardDescription>Book and manage appointments with healthcare providers seamlessly</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
              <FileText className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>Access your complete medical history and treatment plans securely</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
              <Shield className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>Your health data is protected with enterprise-grade security</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
              <Heart className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>24/7 Support</CardTitle>
              <CardDescription>Emergency services and healthcare support available round the clock</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Role-Based Access Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Built for Everyone in Healthcare
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">For Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Book appointments online</li>
                  <li>• Access medical records</li>
                  <li>• Manage prescriptions</li>
                  <li>• Track health history</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">For Healthcare Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Manage patient records</li>
                  <li>• Schedule appointments</li>
                  <li>• E-prescriptions</li>
                  <li>• Treatment planning</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">For Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• User management</li>
                  <li>• System analytics</li>
                  <li>• Resource allocation</li>
                  <li>• Emergency coordination</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
