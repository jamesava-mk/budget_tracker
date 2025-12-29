"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Mail, CheckCircle } from "lucide-react"

interface AuthPageProps {
  onLogin: () => void
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [fullName, setFullName] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [success, setSuccess] = useState("")

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/\d/.test(pwd)) {
      return "Password must contain at least one number"
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return "Password must contain at least one symbol (!@#$%^&* etc.)"
    }
    return null
  }

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const sendVerificationEmail = (userEmail: string, code: string) => {
    console.log(`[v0] Verification code for ${userEmail}: ${code}`)
    alert(
      `Verification code sent to ${userEmail}!\n\nYour code is: ${code}\n\n(In production, this would be sent via email service)`,
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (isSignUp) {
      const passwordError = validatePassword(password)
      if (passwordError) {
        setError(passwordError)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      if (!fullName) {
        setError("Please enter your full name")
        return
      }

      const users = JSON.parse(localStorage.getItem("users") || "{}")
      if (users[email]) {
        setError("Email already registered")
        return
      }

      const code = generateVerificationCode()
      setGeneratedCode(code)
      sendVerificationEmail(email, code)
      setIsVerifying(true)
      setSuccess("Verification code sent! Check your email.")
    } else {
      const users = JSON.parse(localStorage.getItem("users") || "{}")
      if (!users[email]) {
        setError("Email not registered")
        return
      }

      if (users[email].password !== password) {
        setError("Invalid password")
        return
      }

      if (!users[email].verified) {
        setError("Please verify your email first")
        return
      }

      localStorage.setItem("currentUser", email)
      onLogin()
    }
  }

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (verificationCode !== generatedCode) {
      setError("Invalid verification code")
      return
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}")
    users[email] = {
      fullName,
      password,
      verified: true,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", email)

    setSuccess("Email verified! Logging you in...")
    setTimeout(() => onLogin(), 1500)
  }

  const handleGoogleLogin = () => {
    alert(
      "Google OAuth would be integrated here using NextAuth.js or similar.\n\nFor demo purposes, this is simulated.",
    )
    // In production: window.location.href = '/api/auth/signin/google'
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center p-4">
        <Card className="w-full max-w-md relative z-10 border-slate-300 bg-white/95 backdrop-blur shadow-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Verify Email</span>
            </div>
            <CardTitle className="text-slate-900">Enter Verification Code</CardTitle>
            <CardDescription className="text-slate-600">We sent a 6-digit code to {email}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="bg-white border-slate-300 text-slate-900 text-center text-2xl tracking-widest"
                />
              </div>

              <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold">Verify Email</Button>

              <button
                type="button"
                onClick={() => {
                  const code = generateVerificationCode()
                  setGeneratedCode(code)
                  sendVerificationEmail(email, code)
                  setSuccess("New code sent!")
                }}
                className="w-full text-sm text-slate-600 hover:text-slate-900 underline"
              >
                Resend Code
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-slate-300 bg-white/95 backdrop-blur shadow-xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">₦</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Smart Budget Tracker</span>
          </div>
          <CardTitle className="text-slate-900">{isSignUp ? "Create Account" : "Login"}</CardTitle>
          <CardDescription className="text-slate-600">
            {isSignUp ? "Start tracking your expenses today" : "Welcome back"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
              {isSignUp && (
                <p className="text-xs text-slate-500 mt-1">Must be 8+ characters with numbers and symbols</p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            )}

            <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold">
              {isSignUp ? "Sign Up" : "Login"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                  setSuccess("")
                }}
                className="ml-2 text-slate-800 hover:text-slate-900 font-semibold underline"
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
