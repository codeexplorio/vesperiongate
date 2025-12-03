import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { auth } from "@/lib/better-auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers()

  // Secure session validation
  const session = await auth.api.getSession({
    headers: headerList,
  })

  if (!session?.user) {
    redirect("/billing/login")
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
