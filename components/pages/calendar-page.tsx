"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ScheduleEntry } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

interface CalendarPageProps {
  entries: ScheduleEntry[]
  onSave: (entries: ScheduleEntry[]) => void
}

export default function CalendarPage({ entries, onSave }: CalendarPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDate,
    type: "note" as "bill" | "reminder" | "note",
    amount: "",
  })

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      alert("Please enter a title")
      return
    }

    const newEntry: ScheduleEntry = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      type: formData.type,
      amount: formData.amount ? Number.parseFloat(formData.amount) : undefined,
    }

    onSave([...entries, newEntry])
    setFormData({
      title: "",
      description: "",
      date: selectedDate,
      type: "note",
      amount: "",
    })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    onSave(entries.filter((e) => e.id !== id))
  }

  // Get all days in current month
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const getEntriesForDate = (day: number | null) => {
    if (!day) return []
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return entries.filter((e) => e.date === dateStr)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Calendar & Schedule</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Add Schedule Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Title</label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Rent Payment"
                  className="bg-slate-700 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes or details"
                  rows={3}
                  className="w-full bg-slate-700 border border-purple-500/30 text-white rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "bill" | "reminder" | "note" })}
                    className="w-full bg-slate-700 border border-purple-500/30 text-white rounded-lg px-3 py-2"
                  >
                    <option value="note">Note</option>
                    <option value="reminder">Reminder</option>
                    <option value="bill">Bill</option>
                  </select>
                </div>
              </div>

              {formData.type === "bill" && (
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Add Entry
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-purple-500/30"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">
              {new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-purple-300 pb-2">
                  {day}
                </div>
              ))}
              {days.map((day, idx) => {
                const entriesForDay = day ? getEntriesForDate(day) : []
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

                return (
                  <button
                    key={idx}
                    onClick={() =>
                      day &&
                      setSelectedDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
                    }
                    className={`aspect-square p-2 rounded-lg text-sm font-medium transition ${
                      day
                        ? isToday
                          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                          : "bg-slate-700/50 text-purple-200 hover:bg-slate-600/50"
                        : "text-transparent"
                    }`}
                  >
                    <div className="h-full flex flex-col items-center justify-start">
                      {day}
                      {entriesForDay.length > 0 && <div className="w-1 h-1 bg-purple-400 rounded-full mt-0.5"></div>}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Entries for selected date */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate && getEntriesForDate(Number.parseInt(selectedDate.split("-")[2])).length === 0 ? (
              <p className="text-slate-400">No entries for this date</p>
            ) : (
              <div className="space-y-3">
                {selectedDate &&
                  getEntriesForDate(Number.parseInt(selectedDate.split("-")[2])).map((entry) => (
                    <div key={entry.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-medium">{entry.title}</p>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                              entry.type === "bill"
                                ? "bg-red-900/30 text-red-400"
                                : entry.type === "reminder"
                                  ? "bg-blue-900/30 text-blue-400"
                                  : "bg-purple-900/30 text-purple-400"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {entry.description && <p className="text-sm text-slate-300 mb-2">{entry.description}</p>}
                      {entry.amount && <p className="text-sm text-red-400 font-semibold">₦{entry.amount}</p>}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
