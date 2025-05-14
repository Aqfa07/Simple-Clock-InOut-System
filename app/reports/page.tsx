"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatTime, formatDate } from "@/lib/utils"
import type { TimeEntry } from "@/lib/types"
import Link from "next/link"

export default function ReportsPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([])
  const [userFilter, setUserFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [uniqueUsers, setUniqueUsers] = useState<{ email: string; name: string }[]>([])
  const [uniqueDates, setUniqueDates] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(storedUser))

    // Load all entries from localStorage
    const storedEntries = localStorage.getItem("timeEntries")
    if (storedEntries) {
      const allEntries: TimeEntry[] = JSON.parse(storedEntries)
      setEntries(allEntries)
      setFilteredEntries(allEntries)

      // Extract unique users and dates for filters
      const users = Array.from(new Set(allEntries.map((entry) => entry.userEmail))).map((email) => {
        const entry = allEntries.find((e) => e.userEmail === email)
        return { email, name: entry?.userName || email }
      })
      setUniqueUsers(users)

      const dates = Array.from(new Set(allEntries.map((entry) => entry.date))).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      )
      setUniqueDates(dates)
    }
  }, [router])

  useEffect(() => {
    // Apply filters
    let filtered = entries

    if (userFilter !== "all") {
      filtered = filtered.filter((entry) => entry.userEmail === userFilter)
    }

    if (dateFilter !== "all") {
      filtered = filtered.filter((entry) => entry.date === dateFilter)
    }

    // Sort by date (newest first) and then by clock in time
    filtered = filtered.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
    })

    setFilteredEntries(filtered)
  }, [entries, userFilter, dateFilter])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const calculateTotalHours = () => {
    return filteredEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0).toFixed(2)
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <h1 className="text-lg font-semibold">WorkTime Tracker</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Time Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <label className="text-sm font-medium mb-1 block">Filter by User</label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map((user) => (
                        <SelectItem key={user.email} value={user.email}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="text-sm font-medium mb-1 block">Filter by Date</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      {uniqueDates.map((date) => (
                        <SelectItem key={date} value={date}>
                          {formatDate(date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Break Start</TableHead>
                      <TableHead>Break End</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No entries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell>{entry.userName}</TableCell>
                          <TableCell>{formatTime(entry.clockIn)}</TableCell>
                          <TableCell>{entry.breakStart ? formatTime(entry.breakStart) : "-"}</TableCell>
                          <TableCell>{entry.breakEnd ? formatTime(entry.breakEnd) : "-"}</TableCell>
                          <TableCell>{entry.clockOut ? formatTime(entry.clockOut) : "Active"}</TableCell>
                          <TableCell className="text-right">
                            {entry.totalHours ? entry.totalHours.toFixed(2) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {filteredEntries.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-right font-bold">
                          Total Hours:
                        </TableCell>
                        <TableCell className="text-right font-bold">{calculateTotalHours()}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
