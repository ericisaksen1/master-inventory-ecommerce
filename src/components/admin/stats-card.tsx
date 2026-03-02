import { Card, CardContent } from "@/components/ui/card"
import { type ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  iconColor?: string
}

export function StatsCard({ title, value, description, icon, iconColor = "#845adf" }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {icon && (
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-secondary">{title}</p>
            <p className="mt-0.5 text-2xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="mt-0.5 text-xs text-secondary">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
