import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface CustomersHeaderProps {
  numQuery: string;
  setNumQuery: (v: string) => void;
  onRefresh: () => void;
  cnLoading: boolean;
  cnError: string | null;
  summary: { totalCustomers: number; totalMsgs: number; ai: number; sent: number };
}

export function CustomersHeader({ numQuery, setNumQuery, onRefresh, cnLoading, cnError, summary }: CustomersHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <CardTitle>Connected Customer Numbers</CardTitle>
          <CardDescription>Numbers stored in your WhatsApp connector database (filtered to your account).</CardDescription>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search numbers..."
            value={numQuery}
            onChange={(e) => setNumQuery(e.target.value)}
            className="w-56"
          />
          <Button variant="outline" onClick={onRefresh} disabled={cnLoading} title="Refresh">
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
        <span>Total customers: {summary.totalCustomers}</span>
        <span>Msgs: {summary.totalMsgs}</span>
        <span>AI replies: {summary.ai}</span>
        <span>Sent: {summary.sent}</span>
      </div>
      {cnError && (
        <Alert variant="destructive" className="mt-3">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{cnError}</AlertDescription>
        </Alert>
      )}
    </CardHeader>
  );
}
