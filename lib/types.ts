export interface Transaction {
  id: string
  description: string
  amount: number
  type: "expense" | "income"
  category: string
  date: string
}

export interface ScheduleEntry {
  id: string
  title: string
  description: string
  date: string
  type: "bill" | "reminder" | "note"
  amount?: number
}

export interface User {
  email: string
  fullName: string
  password: string
  createdAt: string
}
