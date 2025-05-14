import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <h1 className="text-lg font-semibold">WorkTime Tracker</h1>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Staff Time Tracking</CardTitle>
              <CardDescription>Track your work hours easily with our simple clock in/out system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Please log in to access the time tracking system.</p>
                <Button asChild className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} WorkTime Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
