"use client"

import { BarChart3, CreditCard, Calendar, TrendingUp, Lightbulb, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  currentPage: string
  setCurrentPage: (page: any) => void
  onLogout: () => void
}

export default function Navigation({ currentPage, setCurrentPage, onLogout }: NavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "forecast", label: "Forecast", icon: TrendingUp },
    { id: "ai-advisor", label: "AI Advisor", icon: Lightbulb },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 backdrop-blur p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
          <span className="text-slate-100 font-bold text-lg">₦</span>
        </div>
        <div>
          <div className="font-bold text-slate-100 text-sm">Smart Budget</div>
          <div className="text-xs text-slate-400">Tracker</div>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <Button
        onClick={onLogout}
        variant="ghost"
        className="w-full text-slate-400 hover:bg-red-900/20 hover:text-red-400 flex items-center gap-2 justify-center"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  )
}
