"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUserEmail = localStorage.getItem("currentUser")
    if (currentUserEmail) {
      const users = JSON.parse(localStorage.getItem("users") || "{}")
      setUser({ email: currentUserEmail, ...users[currentUserEmail] })
    }
  }, [])

  if (!user) return <div className="text-white">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Profile</h1>

      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Full Name</p>
              <p className="text-white font-semibold">{user.fullName || "Not set"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <Mail className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-white font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <Calendar className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Member Since</p>
              <p className="text-white font-semibold">
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">About Smart Budget Tracker</CardTitle>
          <CardDescription>v1.0.0</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-purple-200">
            Smart Budget Tracker is an AI-powered personal finance application designed to help you manage expenses,
            forecast spending, and gain actionable insights into your financial habits.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Features</p>
              <ul className="text-sm text-purple-200 space-y-1">
                <li>✓ Transaction tracking</li>
                <li>✓ 90-day forecasting</li>
                <li>✓ Calendar schedule</li>
                <li>✓ AI insights</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Data Storage</p>
              <p className="text-sm text-purple-200">
                All data is stored locally in your browser for privacy and security.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
