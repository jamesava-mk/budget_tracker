"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AuthErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-300 bg-white/95 backdrop-blur shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Authentication Error</CardTitle>
              <CardDescription className="text-slate-600">Something went wrong</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">There was a problem signing you in. This could be due to:</p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>Network connection issues</li>
            <li>Invalid authentication credentials</li>
            <li>Expired or invalid OAuth code</li>
          </ul>

          <Button onClick={() => router.push("/")} className="w-full bg-slate-700 hover:bg-slate-800 text-white">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
