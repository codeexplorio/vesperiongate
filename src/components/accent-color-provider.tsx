"use client"

import { useEffect } from "react"

export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load and apply saved accent color from localStorage
    const savedAccent = localStorage.getItem("accent-color")
    if (savedAccent) {
      document.documentElement.setAttribute("data-accent", savedAccent)
    }
  }, [])

  return <>{children}</>
}
