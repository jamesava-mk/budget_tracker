"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction, ScheduleEntry } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"

interface DashboardPageProps {
  transactions: Transaction[]
  scheduleEntries: ScheduleEntry[]
}

export default function DashboardPage({ transactions, scheduleEntries }: DashboardPageProps) {
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [upcomingBills, setUpcomingBills] = useState<ScheduleEntry[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([])

  useEffect(() => {
    // Calculate summary
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    setSummary({ income, expenses, balance: income - expenses })

    // Category breakdown
    const categories = new Map()
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categories.set(t.category, (categories.get(t.category) || 0) + t.amount)
      })

    const chartData = Array.from(categories.entries()).map(([name, value]) => ({
      name,
      value,
    }))
    setChartData(chartData)

    // Upcoming bills
    const today = new Date()
    const upcoming = scheduleEntries
      .filter((e) => new Date(e.date) >= today && e.type === "bill")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
    setUpcomingBills(upcoming)

    // Monthly trend
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleString("default", { month: "short" })
      const monthNum = date.getMonth()
      const year = date.getFullYear()

      const monthExp = transactions
        .filter((t) => {
          const tDate = new Date(t.date)
          return tDate.getMonth() === monthNum && tDate.getFullYear() === year && t.type === "expense"
        })
        .reduce((sum, t) => sum + t.amount, 0)

      last6Months.push({ month, expenses: monthExp })
    }
    setMonthlyTrend(last6Months)
  }, [transactions, scheduleEntries])

  /* Updated colors to Light Steel palette */
  const COLORS = ["#6c757d", "#495057", "#adbbbd", "#ced4da", "#e9ecef", "#e8f9fa"]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Income (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">₦{summary.income.toLocaleString("en-NG")}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Expenses (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">₦{summary.expenses.toLocaleString("en-NG")}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${summary.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
              ₦{summary.balance.toLocaleString("en-NG")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-100">Spending by Category</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    /* Updated label to use Nigerian Naira */
                    label={({ name, value }) => `${name}: ₦${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₦${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">No expense data</div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-100">6-Month Trend</CardTitle>
            <CardDescription>Monthly expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  /* Updated tooltip to use Nigerian Naira */
                  formatter={(value) => `₦${value}`}
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4f46e5" }}
                />
                <Bar dataKey="expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bills */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Upcoming Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBills.length > 0 ? (
            <div className="space-y-3">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg border border-slate-600/50"
                >
                  <div>
                    <p className="text-slate-100 font-medium">{bill.title}</p>
                    <p className="text-sm text-slate-400">{new Date(bill.date).toLocaleDateString()}</p>
                  </div>
                  {bill.amount && <span className="text-red-400 font-semibold">₦{bill.amount}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No upcoming bills</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
