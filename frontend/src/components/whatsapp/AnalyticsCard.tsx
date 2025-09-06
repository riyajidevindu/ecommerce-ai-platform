import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MessageStatsRow } from "@/services/api";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnalyticsCardProps {
  stats: MessageStatsRow[];
}

type SortKey = "total" | "ai" | "customer";

export function AnalyticsCard({ stats }: AnalyticsCardProps) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [topN, setTopN] = useState(10);

  const processedData = useMemo(() => {
    if (!stats || stats.length === 0) return [];

    const sorted = [...stats].sort((a, b) => b[sortKey] - a[sortKey]);
    const top = sorted.slice(0, topN);
    const other = sorted.slice(topN);

    if (other.length > 0) {
      const otherSum = other.reduce(
        (acc, row) => {
          acc.total += row.total;
          acc.ai += row.ai;
          acc.customer += row.customer;
          return acc;
        },
        { whatsapp_no: "Other", total: 0, ai: 0, customer: 0 }
      );
      return [...top, otherSum];
    }
    return top;
  }, [stats, sortKey, topN]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Analytics</CardTitle>
        <CardDescription>
          An interactive breakdown of your message volume. Showing top {topN} customers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Button variant={sortKey === 'total' ? 'default' : 'outline'} size="sm" onClick={() => setSortKey('total')}>Total</Button>
            <Button variant={sortKey === 'ai' ? 'default' : 'outline'} size="sm" onClick={() => setSortKey('ai')}>AI Replies</Button>
            <Button variant={sortKey === 'customer' ? 'default' : 'outline'} size="sm" onClick={() => setSortKey('customer')}>Customer</Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Show top:</span>
            <Input
              type="number"
              value={topN}
              onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-20"
            />
          </div>
        </div>
        {stats.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="whatsapp_no" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total Messages" />
              <Bar dataKey="ai" fill="#82ca9d" name="AI Replies" />
              <Bar dataKey="customer" fill="#ca8282" name="Customer Messages" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            No analytics data available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
