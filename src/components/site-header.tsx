"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pathTitles: Record<string, string> = {
  "/billing": "Dashboard",
  "/billing/users": "Users",
  "/billing/gallery": "Gallery",
  "/billing/activity": "Activity",
  "/billing/storage": "Storage",
  "/billing/analytics": "Analytics",
  "/billing/settings": "Settings",
  "/billing/help": "Help",
}

export function SiteHeader() {
  const pathname = usePathname()

  // Get the current page title based on pathname
  const getPageTitle = () => {
    // Exact match first
    if (pathTitles[pathname]) {
      return pathTitles[pathname]
    }
    // Check if it's a nested route (e.g., /billing/users/123)
    const basePathMatch = Object.keys(pathTitles).find(
      (path) => path !== "/billing" && pathname.startsWith(path)
    )
    if (basePathMatch) {
      return pathTitles[basePathMatch]
    }
    return "Dashboard"
  }

  const pageTitle = getPageTitle()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/billing">
                LensCherry
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
