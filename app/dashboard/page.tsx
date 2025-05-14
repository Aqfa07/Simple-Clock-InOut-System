"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatTime } from "@/lib/utils"
import type { TimeEntry } from "@/lib/types"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [currentStatus, setCurrentStatus] = useState<"out" | "in" | "break">("out")
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(storedUser))

    // Load today's entries from localStorage
    const today = new Date().toISOString().split("T")[0]
    const storedEntries = localStorage.getItem("timeEntries")
    if (storedEntries) {
      const allEntries: TimeEntry[] = JSON.parse(storedEntries)
      const userTodayEntries = allEntries.filter(
        (entry) => entry.userEmail === JSON.parse(storedUser).email && entry.date === today,
      )

      setTodayEntries(userTodayEntries)

      // Check if there's an ongoing entry
      const ongoingEntry = userTodayEntries.find((entry) => !entry.clockOut)
      if (ongoingEntry) {
        setCurrentEntry(ongoingEntry)
        setCurrentStatus(ongoingEntry.breakStart && !ongoingEntry.breakEnd ? "break" : "in")
      }
    }
  }, [router])

  const handleClockIn = () => {
    if (!user) return

    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toISOString()

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userEmail: user.email,
      userName: user.name,
      date: today,
      clockIn: now,
      breakStart: null,
      breakEnd: null,
      clockOut: null,
      totalHours: 0,
    }

    // Save to localStorage
    const storedEntries = localStorage.getItem("timeEntries")
    const allEntries: TimeEntry[] = storedEntries ? JSON.parse(storedEntries) : []
    allEntries.push(newEntry)
    localStorage.setItem("timeEntries", JSON.stringify(allEntries))

    setCurrentEntry(newEntry)
    setCurrentStatus("in")
    setTodayEntries([...todayEntries, newEntry])

    toast({
      title: "Clocked In",
      description: `You clocked in at ${formatTime(now)}`,
    })
  }

  const handleStartBreak = () => {
    if (!currentEntry) return

    const now = new Date().toISOString()
    const updatedEntry = { ...currentEntry, breakStart: now }

    // Update in localStorage
    updateEntryInStorage(updatedEntry)

    setCurrentEntry(updatedEntry)
    setCurrentStatus("break")

    toast({
      title: "Break Started",
      description: `Your break started at ${formatTime(now)}`,
    })
  }

  const handleEndBreak = () => {
    if (!currentEntry || !currentEntry.breakStart) return

    const now = new Date().toISOString()
    const updatedEntry = { ...currentEntry, breakEnd: now }

    // Update in localStorage
    updateEntryInStorage(updatedEntry)

    setCurrentEntry(updatedEntry)
    setCurrentStatus("in")

    toast({
      title: "Break Ended",
      description: `Your break ended at ${formatTime(now)}`,
    })
  }

  const handleClockOut = () => {
    if (!currentEntry) return

    const now = new Date().toISOString()

    // Calculate total hours
    let totalMs = new Date(now).getTime() - new Date(currentEntry.clockIn).getTime()

    // Subtract break time if there was a break
    if (currentEntry.breakStart && currentEntry.breakEnd) {
      const breakMs = new Date(currentEntry.breakEnd).getTime() - new Date(currentEntry.breakStart).getTime()
      totalMs -= breakMs
    }

    // Convert to hours
    const totalHours = totalMs / (1000 * 60 * 60)

    const updatedEntry = {
      ...currentEntry,
      clockOut: now,
      totalHours: Number.parseFloat(totalHours.toFixed(2)),
    }

    // Update in localStorage
    updateEntryInStorage(updatedEntry)

    setCurrentEntry(null)
    setCurrentStatus("out")

    // Update today's entries
    const updatedEntries = todayEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
    setTodayEntries(updatedEntries)

    toast({
      title: "Clocked Out",
      description: `You clocked out at ${formatTime(now)}. Total hours: ${updatedEntry.totalHours.toFixed(2)}`,
    })
  }

  const updateEntryInStorage = (updatedEntry: TimeEntry) => {
    const storedEntries = localStorage.getItem("timeEntries")
    if (storedEntries) {
      const allEntries: TimeEntry[] = JSON.parse(storedEntries)
      const updatedEntries = allEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
      localStorage.setItem("timeEntries", JSON.stringify(updatedEntries))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
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
            <Link href="/reports" className="text-sm font-medium">
              View Reports
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.name}</CardTitle>
              <CardDescription>Track your work hours by clocking in and out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {new Date().toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-4xl font-bold">
                      {new Date().toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Current Status:{" "}
                      <span className="font-semibold capitalize">
                        {currentStatus === "out" ? "Clocked Out" : currentStatus === "in" ? "Clocked In" : "On Break"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {currentStatus === "out" ? (
                <Button className="w-full" onClick={handleClockIn}>
                  Clock In
                </Button>
              ) : currentStatus === "in" ? (
                <div className="w-full space-y-2">
                  <Button className="w-full" variant="outline" onClick={handleStartBreak}>
                    Start Break
                  </Button>
                  <Button className="w-full" onClick={handleClockOut}>
                    Clock Out
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={handleEndBreak}>
                  End Break
                </Button>
              )}
            </CardFooter>
          </Card>

          {todayEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayEntries.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Clock In:</div>
                        <div>{formatTime(entry.clockIn)}</div>

                        {entry.breakStart && (
                          <>
                            <div>Break Start:</div>
                            <div>{formatTime(entry.breakStart)}</div>
                          </>
                        )}

                        {entry.breakEnd && (
                          <>
                            <div>Break End:</div>
                            <div>{formatTime(entry.breakEnd)}</div>
                          </>
                        )}

                        {entry.clockOut && (
                          <>
                            <div>Clock Out:</div>
                            <div>{formatTime(entry.clockOut)}</div>

                            <div className="font-semibold">Total Hours:</div>
                            <div className="font-semibold">{entry.totalHours.toFixed(2)}</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
