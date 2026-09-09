import React from "react"
import { Badge } from "./badge"
import { Button } from "./button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"
import { GlareHover } from "../../registry/magicui/glare-hover"

export function PricingCard({
  title = "Pro",
  badge = "Popular",
  description = "For teams that need more.",
  price = "$49",
  period = "/mo",
  features = [
    "Unlimited projects",
    "Team collaboration",
    "Advanced analytics",
  ],
  upcomingFeature = "SSO (coming soon)",
  buttonText = "Get started",
  className = "",
} = {}) {
  return (
    <GlareHover className={`rounded-xl ${className}`} duration={600}>
      <Card className="w-[340px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {badge && <Badge>{badge}</Badge>}
          </div>
          <CardDescription>{description}</CardDescription>
          <div className="flex items-baseline gap-1 pt-2">
            <span className="text-4xl font-semibold tracking-tight">{price}</span>
            {period && <span className="text-muted-foreground text-sm">{period}</span>}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M12.5 3.5L6 10L2.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {f}
            </div>
          ))}
          {upcomingFeature && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="1.5"
                  fill="currentColor"
                  opacity="0.4"
                />
              </svg>
              {upcomingFeature}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full">{buttonText}</Button>
        </CardFooter>
      </Card>
    </GlareHover>
  )
}
