"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const MOCK_ACTIVITY = [
  { time: "06:00", builder: 0, tester: 0, refactorer: 0, clinician: 0 },
  { time: "07:00", builder: 2, tester: 0, refactorer: 0, clinician: 0 },
  { time: "08:00", builder: 5, tester: 3, refactorer: 1, clinician: 0 },
  { time: "08:30", builder: 3, tester: 6, refactorer: 2, clinician: 1 },
  { time: "09:00", builder: 7, tester: 4, refactorer: 4, clinician: 3 },
  { time: "09:30", builder: 4, tester: 2, refactorer: 6, clinician: 5 },
  { time: "10:00", builder: 6, tester: 5, refactorer: 3, clinician: 2 },
  { time: "10:30", builder: 8, tester: 7, refactorer: 2, clinician: 4 },
  { time: "11:00", builder: 5, tester: 3, refactorer: 5, clinician: 6 },
  { time: "11:30", builder: 9, tester: 6, refactorer: 4, clinician: 3 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 font-mono text-xs text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="capitalize text-foreground">{entry.name}</span>
          <span className="ml-auto font-mono font-bold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export function ActivityChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Agent Activity</h3>
          <p className="text-xs text-muted-foreground">Commits per agent over time</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { name: "Builder", color: "var(--primary)" },
            { name: "Tester", color: "var(--success)" },
            { name: "Refactorer", color: "var(--chart-4)" },
            { name: "Clinician", color: "var(--warning)" },
          ].map((item) => (
            <span key={item.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
          ))}
        </div>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_ACTIVITY}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="builder" stackId="1" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="tester" stackId="1" stroke="var(--success)" fill="var(--success)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="refactorer" stackId="1" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="clinician" stackId="1" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
