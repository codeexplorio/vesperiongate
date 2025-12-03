"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { IconCheck, IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react"

// Best practice accent colors for dashboards - using shadcn/tailwind colors
const accentColors = [
  { name: "Zinc", value: "zinc", color: "bg-zinc-500", hue: "240 5.9%" },
  { name: "Slate", value: "slate", color: "bg-slate-500", hue: "215.4 16.3%" },
  { name: "Blue", value: "blue", color: "bg-blue-500", hue: "217.2 91.2%" },
  { name: "Violet", value: "violet", color: "bg-violet-500", hue: "258.3 89.5%" },
  { name: "Purple", value: "purple", color: "bg-purple-500", hue: "270.7 91%" },
  { name: "Rose", value: "rose", color: "bg-rose-500", hue: "349.7 89.2%" },
  { name: "Orange", value: "orange", color: "bg-orange-500", hue: "24.6 95%" },
  { name: "Amber", value: "amber", color: "bg-amber-500", hue: "37.7 92.1%" },
  { name: "Emerald", value: "emerald", color: "bg-emerald-500", hue: "160.1 84.1%" },
  { name: "Teal", value: "teal", color: "bg-teal-500", hue: "172.5 66%" },
  { name: "Cyan", value: "cyan", color: "bg-cyan-500", hue: "188.7 94.5%" },
  { name: "Sky", value: "sky", color: "bg-sky-500", hue: "198.6 88.7%" },
]

const timezones = [
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time" },
  { value: "America/Anchorage", label: "(GMT-09:00) Alaska" },
  { value: "Pacific/Honolulu", label: "(GMT-10:00) Hawaii" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "Europe/Paris", label: "(GMT+01:00) Paris, Berlin" },
  { value: "Europe/Helsinki", label: "(GMT+02:00) Helsinki, Kyiv" },
  { value: "Europe/Moscow", label: "(GMT+03:00) Moscow" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Dubai" },
  { value: "Asia/Kolkata", label: "(GMT+05:30) India" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok" },
  { value: "Asia/Singapore", label: "(GMT+08:00) Singapore, Hong Kong" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
  { value: "Australia/Sydney", label: "(GMT+11:00) Sydney" },
  { value: "Pacific/Auckland", label: "(GMT+13:00) Auckland" },
]

const firstDayOptions = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "saturday", label: "Saturday" },
]

const timeFormatOptions = [
  { value: "12h", label: "12-hour (2:30 PM)" },
  { value: "24h", label: "24-hour (14:30)" },
]

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [accentColor, setAccentColor] = useState("violet")
  const [timezone, setTimezone] = useState("America/New_York")
  const [firstDay, setFirstDay] = useState("sunday")
  const [timeFormat, setTimeFormat] = useState("12h")

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Load preferences from localStorage
    const savedAccent = localStorage.getItem("accent-color")
    const savedTimezone = localStorage.getItem("timezone")
    const savedFirstDay = localStorage.getItem("first-day")
    const savedTimeFormat = localStorage.getItem("time-format")

    if (savedAccent) setAccentColor(savedAccent)
    if (savedTimezone) setTimezone(savedTimezone)
    if (savedFirstDay) setFirstDay(savedFirstDay)
    if (savedTimeFormat) setTimeFormat(savedTimeFormat)
  }, [])

  const handleAccentChange = (value: string) => {
    setAccentColor(value)
    localStorage.setItem("accent-color", value)
    // Apply accent color to document root
    document.documentElement.setAttribute("data-accent", value)
  }

  const handleTimezoneChange = (value: string) => {
    setTimezone(value)
    localStorage.setItem("timezone", value)
  }

  const handleFirstDayChange = (value: string) => {
    setFirstDay(value)
    localStorage.setItem("first-day", value)
  }

  const handleTimeFormatChange = (value: string) => {
    setTimeFormat(value)
    localStorage.setItem("time-format", value)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground">
          Customize your Vesperion Gate experience
        </p>
      </div>

      {/* Color Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Color Theme</CardTitle>
          <CardDescription>
            Choose a color for buttons, menus, and accents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleAccentChange(color.value)}
                className={cn(
                  "relative h-10 w-10 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  color.color
                )}
                title={color.name}
              >
                {accentColor === color.value && (
                  <IconCheck className="absolute inset-0 m-auto h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Selected: <span className="font-medium capitalize">{accentColor}</span>
          </p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose how Vesperion Gate looks to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            <Label
              htmlFor="theme-light"
              className={cn(
                "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                theme === "light" && "border-primary"
              )}
            >
              <RadioGroupItem value="light" id="theme-light" className="sr-only" />
              <IconSun className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Always light</span>
            </Label>
            <Label
              htmlFor="theme-dark"
              className={cn(
                "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                theme === "dark" && "border-primary"
              )}
            >
              <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
              <IconMoon className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Always dark</span>
            </Label>
            <Label
              htmlFor="theme-system"
              className={cn(
                "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                theme === "system" && "border-primary"
              )}
            >
              <RadioGroupItem value="system" id="theme-system" className="sr-only" />
              <IconDeviceDesktop className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Same as OS</span>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Date/Time */}
      <Card>
        <CardHeader>
          <CardTitle>Date/Time</CardTitle>
          <CardDescription>
            Configure how dates and times are displayed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Time zone</Label>
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Vesperion Gate uses your time zone setting for email notifications, event reminders, your profile, and your notification settings.
            </p>
          </div>

          {/* First day of week */}
          <div className="space-y-2">
            <Label htmlFor="first-day">First day of the week</Label>
            <Select value={firstDay} onValueChange={handleFirstDayChange}>
              <SelectTrigger id="first-day">
                <SelectValue placeholder="Select first day" />
              </SelectTrigger>
              <SelectContent>
                {firstDayOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Vesperion Gate uses this when presenting calendars.
            </p>
          </div>

          {/* Time format */}
          <div className="space-y-2">
            <Label htmlFor="time-format">Time format</Label>
            <Select value={timeFormat} onValueChange={handleTimeFormatChange}>
              <SelectTrigger id="time-format">
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                {timeFormatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Vesperion Gate uses this format when displaying the time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
