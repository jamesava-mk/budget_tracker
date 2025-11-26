"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import DashboardPage from "@/components/pages/dashboard-page"
import TransactionsPage from "@/components/pages/transactions-page"
import CalendarPage from "@/components/pages/calendar-page"
import ForecastPage from "@/components/pages/forecast-page"
import AIAdvisorPage from "@/components/pages/ai-advisor-page"
import ProfilePage from "@/components/pages/profile-page"
import type { Transaction, ScheduleEntry } from "@/lib/types"

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "transactions" | "calendar" | "forecast" | "ai-advisor" | "profile"
  >("dashboard")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([])

  const currentUser = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null

  useEffect(() => {
    const userTransactions = JSON.parse(localStorage.getItem(`transactions_${currentUser}`) || "[]")
    const userSchedule = JSON.parse(localStorage.getItem(`schedule_${currentUser}`) || "[]")
    setTransactions(userTransactions)
    setScheduleEntries(userSchedule)
  }, [currentUser])

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions)
    localStorage.setItem(`transactions_${currentUser}`, JSON.stringify(newTransactions))
  }

  const saveScheduleEntries = (newEntries: ScheduleEntry[]) => {
    setScheduleEntries(newEntries)
    localStorage.setItem(`schedule_${currentUser}`, JSON.stringify(newEntries))
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />

      <main className="ml-64 pt-6 pb-6 px-6">
        {currentPage === "dashboard" && <DashboardPage transactions={transactions} scheduleEntries={scheduleEntries} />}
        {currentPage === "transactions" && <TransactionsPage transactions={transactions} onSave={saveTransactions} />}
        {currentPage === "calendar" && <CalendarPage entries={scheduleEntries} onSave={saveScheduleEntries} />}
        {currentPage === "forecast" && <ForecastPage transactions={transactions} />}
        {currentPage === "ai-advisor" && (
          <AIAdvisorPage transactions={transactions} scheduleEntries={scheduleEntries} />
        )}
        {currentPage === "profile" && <ProfilePage />}
      </main>
    </div>
  )
}
