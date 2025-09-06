import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Users, MessageSquare, Bot, Send } from "lucide-react";
import { motion } from "framer-motion";

interface CustomersHeaderProps {
  numQuery: string;
  setNumQuery: (v: string) => void;
  onRefresh: () => void;
  cnLoading: boolean;
  cnError: string | null;
  summary: { totalCustomers: number; totalMsgs: number; ai: number; sent: number };
}

export function CustomersHeader({ numQuery, setNumQuery, onRefresh, cnLoading, cnError, summary }: CustomersHeaderProps) {
  const stats = [
    { icon: Users, label: "Total Customers", value: summary.totalCustomers },
    { icon: MessageSquare, label: "Total Messages", value: summary.totalMsgs },
    { icon: Bot, label: "AI Replies", value: summary.ai },
    { icon: Send, label: "Sent by You", value: summary.sent },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
  <CardHeader className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
          <div>
    <CardTitle className="text-lg">Customer Conversations</CardTitle>
    <CardDescription className="text-sm">An overview of your WhatsApp customer interactions.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search by number..."
              value={numQuery}
              onChange={(e) => setNumQuery(e.target.value)}
      className="w-full sm:w-48 text-sm"
            />
            <Button variant="outline" onClick={onRefresh} disabled={cnLoading} title="Refresh data">
      <RefreshCcw className={`h-4 w-4 ${cnLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
    <div key={i} className="bg-muted/50 rounded-lg p-3">
      <s.icon className="h-5 w-5 text-muted-foreground mb-1.5" />
      <div className="text-xl font-bold">{s.value}</div>
      <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        {cnError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{cnError}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
    </motion.div>
  );
}
