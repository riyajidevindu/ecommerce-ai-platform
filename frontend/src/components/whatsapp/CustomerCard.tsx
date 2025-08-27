import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { MessageStatsRow } from "@/services/api";

interface CustomerCardProps {
  number: string;
  stats?: MessageStatsRow;
  copied: string | null;
  onCopy: (value: string) => void;
}

export function CustomerCard({ number, stats, copied, onCopy }: CustomerCardProps) {
  return (
    <div className="group rounded-lg border border-border bg-card/70 backdrop-blur p-4 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="truncate font-medium text-foreground" title={number}>{number}</div>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onCopy(number)} title="Copy number">
          {copied === number ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-muted text-foreground">Total {stats?.total ?? 0}</span>
        <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-700">AI {stats?.ai ?? 0}</span>
        <span className="px-2 py-1 rounded-full bg-blue-500/15 text-blue-700">Sent {stats?.customer ?? 0}</span>
      </div>
    </div>
  );
}
