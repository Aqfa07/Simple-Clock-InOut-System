export interface TimeEntry {
  id: string
  userEmail: string
  userName: string
  date: string
  clockIn: string
  breakStart: string | null
  breakEnd: string | null
  clockOut: string | null
  totalHours: number
}
