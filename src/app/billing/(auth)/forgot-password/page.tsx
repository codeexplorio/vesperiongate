"use client"

import { useState, FormEvent, useCallback, useRef } from "react"
import Link from "next/link"
import { forgetPassword } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { Turnstile, TurnstileRef } from "@/components/turnstile"

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!

export default function ForgotPasswordPage() {
  const turnstileRef = useRef<TurnstileRef>(null)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null)
    setError("Security verification failed. Please try again.")
  }, [])

  const handleTurnstileExpired = useCallback(() => {
    setTurnstileToken(null)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (!turnstileToken) {
      setError("Please complete the security verification")
      return
    }

    setLoading(true)

    try {
      const result = await forgetPassword({
        email,
        redirectTo: "/billing/reset-password",
        fetchOptions: {
          headers: {
            "x-captcha-response": turnstileToken,
          },
        },
      })

      if (result.error) {
        setError(result.error.message || "Failed to send reset email")
        setTurnstileToken(null)
        turnstileRef.current?.reset()
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("Network error. Please try again.")
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
              <p className="text-sm text-muted-foreground mb-6">
                If an account exists with {email}, you will receive a password reset link shortly.
              </p>
              <Button asChild variant="outline">
                <Link href="/billing/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <img
            src="/vesperiongate1.svg"
            alt="VesperionGate"
            className="h-12 w-12 invert"
          />
          <h1 className="text-xl font-semibold">VesperionGate</h1>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={handleTurnstileVerify}
                onError={handleTurnstileError}
                onExpired={handleTurnstileExpired}
                theme="dark"
                size="flexible"
                action="forgot-password"
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading || !email || !turnstileToken}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <Link
                href="/billing/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
