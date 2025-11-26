"use client"

import { useEffect, useState } from "react"
import AuthPage from "@/components/auth-page"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    setIsLoggedIn(!!user)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div className="bg-background min-h-screen" />
  }

  return isLoggedIn ? (
    <Dashboard onLogout={() => setIsLoggedIn(false)} />
  ) : (
    <AuthPage onLogin={() => setIsLoggedIn(true)} />
  )
}
