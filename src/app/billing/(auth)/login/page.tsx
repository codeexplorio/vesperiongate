"use client"

import { useState, FormEvent, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth-client"
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
import { Loader2 } from "lucide-react"
import { Turnstile, TurnstileRef } from "@/components/turnstile"

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!

export default function BillingLoginPage() {
  const router = useRouter()
  const turnstileRef = useRef<TurnstileRef>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
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
      const result = await signIn.email({
        email,
        password,
        fetchOptions: {
          headers: {
            "x-captcha-response": turnstileToken,
          },
        },
      })

      if (result.error) {
        setError(result.error.message || "Login failed")
        setTurnstileToken(null)
        turnstileRef.current?.reset()
        setLoading(false)
        return
      }

      router.push("/billing")
      router.refresh()
    } catch (err) {
      setError("Network error. Please try again.")
      setTurnstileToken(null)
      turnstileRef.current?.reset()
      setLoading(false)
    }
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
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                action="login"
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password || !turnstileToken}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <Link
                href="/billing/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            Back to VesperionGate
          </Link>
        </p>
      </div>
    </div>
  )
}
