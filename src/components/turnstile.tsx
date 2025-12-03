"use client"

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react"

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
      isExpired: (widgetId: string) => boolean
      ready: (callback: () => void) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileOptions {
  sitekey: string
  callback?: (token: string) => void
  "error-callback"?: (error: string) => void
  "expired-callback"?: () => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "flexible" | "compact"
  action?: string
  appearance?: "always" | "execute" | "interaction-only"
}

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: (error: string) => void
  onExpired?: () => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "flexible" | "compact"
  action?: string
  className?: string
}

export interface TurnstileRef {
  reset: () => void
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  function Turnstile(
    {
      siteKey,
      onVerify,
      onError,
      onExpired,
      theme = "dark",
      size = "flexible",
      action,
      className,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const [scriptLoaded, setScriptLoaded] = useState(false)

    // Expose reset method via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
    }))

    const renderWidget = useCallback(() => {
      if (!containerRef.current || !window.turnstile) return

      // Remove existing widget if any
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Widget might already be removed
        }
        widgetIdRef.current = null
      }

      // Clear the container
      containerRef.current.innerHTML = ""

      // Render new widget
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "error-callback": onError,
        "expired-callback": onExpired,
        theme,
        size,
        action,
      })
    }, [siteKey, onVerify, onError, onExpired, theme, size, action])

    useEffect(() => {
      const isTurnstileReady = () =>
        typeof window.turnstile?.render === "function"

      // Check if script is already loaded and turnstile is available
      if (isTurnstileReady()) {
        setScriptLoaded(true)
        return
      }

      // Check if script tag already exists
      const existingScript = document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      )

      const waitForTurnstile = () => {
        const checkLoaded = setInterval(() => {
          if (isTurnstileReady()) {
            setScriptLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 50)
        return () => clearInterval(checkLoaded)
      }

      if (existingScript) {
        return waitForTurnstile()
      }

      // Load the script with onload callback parameter
      const callbackName = `onTurnstileLoad_${Date.now()}`
      ;(window as unknown as Record<string, () => void>)[callbackName] = () => {
        setScriptLoaded(true)
        delete (window as unknown as Record<string, () => void>)[callbackName]
      }

      const script = document.createElement("script")
      script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${callbackName}`
      script.async = true
      script.defer = true

      // Fallback in case onload callback doesn't fire
      script.onload = () => {
        setTimeout(() => {
          if (isTurnstileReady()) {
            setScriptLoaded(true)
          }
        }, 100)
      }

      document.head.appendChild(script)

      return () => {
        // Cleanup widget on unmount
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current)
          } catch {
            // Widget might already be removed
          }
        }
      }
    }, [])

    useEffect(() => {
      if (scriptLoaded && window.turnstile) {
        renderWidget()
      }
    }, [scriptLoaded, renderWidget])

    return <div ref={containerRef} className={className} />
  }
)

export function useTurnstileReset() {
  const reset = useCallback((widgetId: string) => {
    if (window.turnstile && widgetId) {
      window.turnstile.reset(widgetId)
    }
  }, [])

  return reset
}
