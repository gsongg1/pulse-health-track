"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/utils";

interface TrendDatum {
  date: string;
  sleep: number;
  stress: number;
  focus: number;
}

export function WellnessTrendChart({ data }: { data: TrendDatum[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
          <XAxis dataKey="date" tickFormatter={(value) => formatDate(value)} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 5]} tickLine={false} axisLine={false} />
          <Tooltip labelFormatter={(value) => formatDate(value)} />
          <Line type="monotone" dataKey="sleep" stroke="#1f7a5d" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="stress" stroke="#d4885a" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="focus" stroke="#255e8a" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
