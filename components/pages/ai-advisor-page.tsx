"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import type { Transaction, ScheduleEntry } from "@/lib/types"

interface AIAdvisorPageProps {
  transactions: Transaction[]
  scheduleEntries: ScheduleEntry[]
}

interface Recommendation {
  title: string
  description: string
  impact: "high" | "medium" | "low"
  category: string
  icon: React.ReactNode
}

export default function AIAdvisorPage({ transactions, scheduleEntries }: AIAdvisorPageProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    generateRecommendations()
  }, [transactions, scheduleEntries])

  const generateRecommendations = () => {
    const recs: Recommendation[] = []
    const newInsights: string[] = []

    // Calculate spending patterns
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentTransactions = transactions.filter((t) => new Date(t.date) >= thirtyDaysAgo && t.type === "expense")

    const totalExpenses = recentTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = transactions
      .filter((t) => new Date(t.date) >= thirtyDaysAgo && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    // Recommendation 1: Schedule vs Actual Spending
    const scheduledBills = scheduleEntries.filter((e) => e.type === "bill" && e.amount)
    const scheduledTotal = scheduledBills.reduce((sum, e) => sum + (e.amount || 0), 0)
    const futureScheduledBills = scheduleEntries.filter(
      (e) => e.type === "bill" && new Date(e.date) >= today && e.amount,
    )
    const futureTotal = futureScheduledBills.reduce((sum, e) => sum + (e.amount || 0), 0)

    if (futureTotal > 0) {
      const savingBuffer = totalIncome * 0.2
      if (futureTotal > savingBuffer) {
        recs.push({
          title: "Adjust Upcoming Bills Buffer",
          description: `Your upcoming bills total ₦${futureTotal.toLocaleString("en-NG")} but your typical monthly emergency buffer is only ₦${savingBuffer.toLocaleString("en-NG")}. Consider postponing non-essential expenses or increasing income sources.`,
          impact: "high",
          category: "bills",
          icon: <AlertCircle className="w-5 h-5" />,
        })
        newInsights.push(`⚠️ High upcoming bills: ₦${futureTotal.toLocaleString("en-NG")} scheduled`)
      }
    }

    // Recommendation 2: Spending Category Insights
    const categorySpending: Record<string, number> = {}
    recentTransactions.forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount
    })

    const highestCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]
    if (highestCategory) {
      const percentage = totalExpenses > 0 ? (highestCategory[1] / totalExpenses) * 100 : 0
      if (percentage > 40) {
        recs.push({
          title: "High Category Spending Alert",
          description: `${highestCategory[0]} accounts for ${percentage.toFixed(1)}% of your 30-day expenses (₦${highestCategory[1].toLocaleString("en-NG")}). This is above the recommended 30% threshold. Consider optimization opportunities.`,
          impact: "medium",
          category: "spending",
          icon: <TrendingUp className="w-5 h-5" />,
        })
        newInsights.push(`📊 Top expense: ${highestCategory[0]} at ₦${highestCategory[1].toLocaleString("en-NG")}`)
      }
    }

    // Recommendation 3: Income vs Expense Balance
    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

    if (savingsRate < 10 && totalIncome > 0) {
      recs.push({
        title: "Low Savings Rate Warning",
        description: `Your 30-day savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 10-20% of income. Review expenses to find areas to cut back.`,
        impact: "high",
        category: "savings",
        icon: <AlertCircle className="w-5 h-5" />,
      })
      newInsights.push(`💰 Savings rate: ${savingsRate.toFixed(1)}% (target: 10-20%)`)
    } else if (savingsRate >= 20) {
      recs.push({
        title: "Excellent Savings Performance",
        description: `You're saving ${savingsRate.toFixed(1)}% of your income (₦${balance.toLocaleString("en-NG")} this month). Keep this up and consider investing the surplus for long-term growth.`,
        impact: "low",
        category: "success",
        icon: <CheckCircle className="w-5 h-5" />,
      })
      newInsights.push(`✅ Great savings rate: ${savingsRate.toFixed(1)}%`)
    }

    // Recommendation 4: Schedule-Based Budgeting
    const billsThisMonth = scheduleEntries.filter(
      (e) => e.type === "bill" && new Date(e.date).getMonth() === today.getMonth() && e.amount,
    )
    const billsTotal = billsThisMonth.reduce((sum, e) => sum + (e.amount || 0), 0)

    if (billsTotal > 0 && recentTransactions.length > 0) {
      const billPercentage = (billsTotal / totalExpenses) * 100
      if (billPercentage > 50) {
        recs.push({
          title: "Bills Dominate Your Budget",
          description: `Fixed bills consume ${billPercentage.toFixed(1)}% of your monthly expenses. This leaves limited flexibility. Look for ways to reduce fixed costs like subscriptions.`,
          impact: "medium",
          category: "bills",
          icon: <Lightbulb className="w-5 h-5" />,
        })
        newInsights.push(`📅 Bills as % of expenses: ${billPercentage.toFixed(1)}%`)
      }
    }

    // Recommendation 5: Spending Prediction Based on Schedule
    const upcomingBillsValue = futureScheduledBills.reduce((sum, e) => sum + (e.amount || 0), 0)
    if (upcomingBillsValue > 0) {
      const daysUntilMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime() - today.getTime()
      const daysRemaining = Math.ceil(daysUntilMonth / (1000 * 60 * 60 * 24))
      const avgDailySpending = totalExpenses > 0 ? totalExpenses / 30 : 0
      const projectedTotal = avgDailySpending * daysRemaining + upcomingBillsValue

      recs.push({
        title: "Month-End Budget Projection",
        description: `Based on your schedule and spending patterns, you'll need approximately ₦${projectedTotal.toLocaleString("en-NG")} by month-end (including ₦${upcomingBillsValue.toLocaleString("en-NG")} in scheduled bills). Current income projected: ₦${totalIncome.toLocaleString("en-NG")}.`,
        impact: projectedTotal > totalIncome ? "high" : "low",
        category: "forecast",
        icon: <TrendingUp className="w-5 h-5" />,
      })
    }

    setRecommendations(recs)
    setInsights(newInsights)
  }

  const impactColors = {
    high: "border-red-500/30 bg-red-500/10",
    medium: "border-yellow-500/30 bg-yellow-500/10",
    low: "border-green-500/30 bg-green-500/10",
  }

  const impactBadgeColors = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-green-500/20 text-green-400",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Financial Advisor</h1>
        <p className="text-slate-400 mt-2">Personalized recommendations based on your schedule and spending patterns</p>
      </div>

      {/* Quick Insights */}
      {insights.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <p key={idx} className="text-slate-300">
                  {insight}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recommendations</h2>
        {recommendations.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">
                Add transactions and schedule entries to get personalized recommendations
              </p>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec, idx) => (
            <Card key={idx} className={`border ${impactColors[rec.impact]}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-300">{rec.icon}</div>
                    <div>
                      <CardTitle className="text-white text-lg">{rec.title}</CardTitle>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${impactBadgeColors[rec.impact]}`}>
                    {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} Impact
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{rec.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">30-Day Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Total Income</p>
                <p className="text-xl font-bold text-green-400">
                  ₦
                  {transactions
                    .filter(
                      (t) => t.type === "income" && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    )
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString("en-NG")}
                </p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-red-400">
                  ₦
                  {transactions
                    .filter(
                      (t) =>
                        t.type === "expense" && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    )
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString("en-NG")}
                </p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Net Balance</p>
                <p
                  className={`text-xl font-bold ${
                    transactions
                      .filter(
                        (t) =>
                          t.type === "income" && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      )
                      .reduce((sum, t) => sum + t.amount, 0) -
                      transactions
                        .filter(
                          (t) =>
                            t.type === "expense" && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        )
                        .reduce((sum, t) => sum + t.amount, 0) >=
                    0
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}
                >
                  ₦
                  {(
                    transactions
                      .filter(
                        (t) =>
                          t.type === "income" && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      )
                      .reduce((sum, t) => sum + t.amount, 0) -
                    transactions
                      .filter(
                        (t) =>
                          t.type === "expense" && new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      )
                      .reduce((sum, t) => sum + t.amount, 0)
                  ).toLocaleString("en-NG")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
