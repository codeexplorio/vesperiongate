"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ActivityItem {
  id: string
  name: string
  email: string
  subtitle: string
  href: string
}

interface RecentActivityProps {
  items: ActivityItem[]
  maxItems?: number
}

export function RecentActivity({ items, maxItems = 5 }: RecentActivityProps) {
  const displayItems = items.slice(0, maxItems)

  if (displayItems.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="flex items-center gap-4 p-2 -m-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {item.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
