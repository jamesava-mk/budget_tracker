"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Transaction } from "@/lib/types"
import { Plus, Trash2, Download } from "lucide-react"

interface TransactionsPageProps {
  transactions: Transaction[]
  onSave: (transactions: Transaction[]) => void
}

export default function TransactionsPage({ transactions, onSave }: TransactionsPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as "expense" | "income",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
  })

  const EXPENSE_CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Healthcare", "Shopping", "Other"]
  const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Bonus", "Other"]

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.amount) {
      alert("Please fill in all fields")
      return
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: formData.description,
      amount: Number.parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
    }

    onSave([...transactions, newTransaction])
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
    })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    onSave(transactions.filter((t) => t.id !== id))
  }

  const handleExport = () => {
    const csv = [
      ["Date", "Description", "Type", "Category", "Amount"],
      ...transactions.map((t) => [t.date, t.description, t.type, t.category, t.amount]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const categories = formData.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">Transactions</h1>
        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="bg-slate-700 hover:bg-slate-600 text-slate-100">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-100">Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Coffee"
                    className="bg-slate-600 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="bg-slate-600 border-slate-600 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "expense" | "income" })}
                    className="w-full bg-slate-600 border border-slate-600 text-slate-100 rounded-lg px-3 py-2"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-600 border border-slate-600 text-slate-100 rounded-lg px-3 py-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-slate-600 border-slate-600 text-slate-100"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-slate-700 hover:bg-slate-600 text-slate-100">
                  Add Transaction
                </Button>
                <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="border-slate-600">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-slate-100">All Transactions</CardTitle>
          <CardDescription>{transactions.length} transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-slate-400">No transactions yet. Add your first transaction!</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-slate-600/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${transaction.type === "income" ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <div>
                          <p className="text-slate-100 font-medium">{transaction.description}</p>
                          <p className="text-xs text-slate-400">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-semibold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}₦{transaction.amount.toLocaleString("en-NG")}
                      </span>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
