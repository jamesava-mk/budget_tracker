"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, AlertCircle } from "lucide-react"

interface ForecastPageProps {
  transactions: Transaction[]
}

export default function ForecastPage({ transactions }: ForecastPageProps) {
  const [forecastDays] = useState(90)

  const { forecastData, recommendations, insights } = useMemo(() => {
    // Calculate daily average spending
    const dailyAverages = new Map()
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    transactions
      .filter((t) => new Date(t.date) >= lastMonth && t.type === "expense")
      .forEach((t) => {
        const category = t.category
        dailyAverages.set(category, (dailyAverages.get(category) || 0) + t.amount)
      })

    // Generate 90-day forecast
    const forecast = []
    let runningBalance = 0
    const today = new Date()

    for (let i = 0; i < forecastDays; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dateStr = date.toLocaleDateString("en-NG")

      // Random daily spending based on averages
      const totalDaily = Array.from(dailyAverages.values()).reduce((a, b) => a + b, 0) / 30
      const variance = (Math.random() - 0.5) * totalDaily * 0.3
      const dailyExpense = Math.max(0, totalDaily + variance)

      runningBalance -= dailyExpense

      forecast.push({
        date: dateStr,
        day: i,
        expense: Math.round(dailyExpense),
        balance: Math.round(runningBalance),
      })
    }

    // Generate recommendations
    const categoryTotals = new Map()
    transactions
      .filter((t) => {
        const date = new Date(t.date)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        return date >= ninetyDaysAgo && t.type === "expense"
      })
      .forEach((t) => {
        categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount)
      })

    const recommendations = []
    const avgDaily = Array.from(categoryTotals.values()).reduce((a, b) => a + b, 0) / 90

    categoryTotals.forEach((amount, category) => {
      const daily = amount / 90
      if (daily > avgDaily * 1.5) {
        recommendations.push({
          category,
          current: Math.round(amount / 90),
          suggestion: Math.round(avgDaily * 1.2),
          saving: Math.round((daily - avgDaily * 1.2) * 30),
        })
      }
    })

    // Insights
    const currentMonthSpending = transactions
      .filter((t) => {
        const date = new Date(t.date)
        return (
          date.getMonth() === new Date().getMonth() &&
          date.getFullYear() === new Date().getFullYear() &&
          t.type === "expense"
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const avgMonthlySpending = Array.from(categoryTotals.values()).reduce((a, b) => a + b, 0) / 3
    const difference = currentMonthSpending - avgMonthlySpending

    const insights = []
    if (difference > 0) {
      /* Updated insights to use Nigerian Naira */
      insights.push({
        type: "warning",
        text: `You're spending ₦${Math.round(difference)} more than usual this month.`,
      })
    } else if (difference < 0) {
      insights.push({
        type: "positive",
        /* Updated insights to use Nigerian Naira */
        text: `Great! You're spending ₦${Math.round(Math.abs(difference))} less than usual.`,
      })
    }

    return { forecastData: forecast, recommendations, insights }
  }, [transactions, forecastDays])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">90-Day Forecast & AI Insights</h1>

      {/* Insights */}
      <div className="grid grid-cols-1 gap-4">
        {insights.map((insight, idx) => (
          <Card
            key={idx}
            className={`${
              insight.type === "warning" ? "bg-red-900/20 border-red-500/30" : "bg-green-900/20 border-green-500/30"
            }`}
          >
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className={`w-5 h-5 ${insight.type === "warning" ? "text-red-400" : "text-green-400"}`} />
              <p className={insight.type === "warning" ? "text-red-200" : "text-green-200"}>{insight.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forecast Chart */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            90-Day Spending Forecast
          </CardTitle>
          <CardDescription>Projected daily expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecastData.slice(0, 30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                /* Updated tooltip to use Nigerian Naira */
                formatter={(value) => `₦${value}`}
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4f46e5" }}
              />
              <Legend />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Daily Expense" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-100">Personalized Spending Recommendations</CardTitle>
            <CardDescription>Based on your spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-slate-600/50 rounded-lg border border-slate-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-slate-100 font-semibold">{rec.category}</h3>
                    <span className="text-green-400 font-bold">Save ₦{rec.saving}/month</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Current daily average</p>
                      <p className="text-lg text-red-400 font-semibold">₦{rec.current}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Recommended daily</p>
                      <p className="text-lg text-green-400 font-semibold">₦{rec.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Recap */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-slate-100">30-Day Forecast Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecastData.slice(0, 30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                /* Updated tooltip to use Nigerian Naira */
                formatter={(value) => `₦${value}`}
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4f46e5" }}
              />
              <Bar dataKey="expense" fill="#6c757d" name="Daily Expense" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
