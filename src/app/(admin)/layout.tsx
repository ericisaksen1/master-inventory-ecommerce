import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopbar } from "@/components/admin/topbar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getSettings } from "@/lib/settings"
import { logout } from "@/actions/auth"
import { getUnreadNotificationCount, getRecentNotifications } from "@/actions/notifications"
import { type ReactNode } from "react"
import { Mulish } from "next/font/google"

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
})

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login")
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"
  const settings = await getSettings(["enable_affiliates"])
  const affiliatesEnabled = settings.enable_affiliates !== "false"
  const userName = session.user.name || session.user.email || "Admin"
  const [notificationCount, notifications] = await Promise.all([
    getUnreadNotificationCount(),
    getRecentNotifications(15),
  ])

  const adminTheme: React.CSSProperties & Record<string, string> = {
    "--color-background": "#ffffff",
    "--color-foreground": "#171717",
    "--color-primary": "#845adf",
    "--color-secondary": "#6c757d",
    "--color-accent": "#845adf",
    "--color-muted": "#f5f6f8",
    "--color-border": "#e9ebf0",
    "--color-button-bg": "#845adf",
    "--color-button-text": "#ffffff",
    "--color-button-hover-bg": "#7250c9",
    "--color-button-hover-text": "#ffffff",
    "--color-button-border": "transparent",
    "--font-heading": "'Mulish', sans-serif",
    "--font-body": "'Mulish', sans-serif",
    "--radius": "8px",
    "--shadow": "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
    "--sidebar-bg": "#202640",
    "--sidebar-text": "rgba(255,255,255,0.7)",
    "--sidebar-active-bg": "rgba(132,90,223,0.1)",
    "--sidebar-active-text": "#845adf",
    colorScheme: "light",
  }

  return (
    <div className={`${mulish.className} min-h-screen bg-muted text-foreground`} style={adminTheme}>
      <AdminSidebar isSuperAdmin={isSuperAdmin} affiliatesEnabled={affiliatesEnabled} />
      <div className="pl-64">
        <AdminTopbar userName={userName} logoutAction={logout} notificationCount={notificationCount} initialNotifications={notifications} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
