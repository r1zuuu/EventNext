"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
type ChartPoint = {
  month: string
  occupancyRate: number
}
type Props = {
    data: ChartPoint[]
    title?: string
    description?: string
}
const chartConfig = {
  occupancyRate: {
    label: "Occupancy Rate:",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

    
export function ChartAreaDefault({ data, title, description }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? "Area Chart"}</CardTitle>
        <CardDescription>
          {description ?? "Showing total visitors for the last 6 months"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="occupancyRate"
              type="natural"
              fill="var(--color-occupancyRate)"
              fillOpacity={0.4}
              stroke="var(--color-occupancyRate)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
