import { Button } from "@/components/ui/button";
import { Check, Copy, MessageSquare, Bot, Send } from "lucide-react";
import { MessageStatsRow } from "@/services/api";
import { motion } from "framer-motion";

interface CustomerCardProps {
  number: string;
  stats?: MessageStatsRow;
  copied: string | null;
  onCopy: (value: string) => void;
}

export function CustomerCard({ number, stats, copied, onCopy }: CustomerCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statItems = [
    { icon: MessageSquare, label: "Total", value: stats?.total ?? 0 },
    { icon: Bot, label: "AI", value: stats?.ai ?? 0 },
    { icon: Send, label: "Sent", value: stats?.customer ?? 0 },
  ];

  return (
    <motion.div
      variants={cardVariants}
      className="group rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
      whileHover={{ y: -4 }}
    >
      <div className="p-3 flex items-center justify-between">
        <p className="font-semibold truncate text-base" title={number}>{number}</p>
        <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => onCopy(number)} title="Copy number">
          {copied === number ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
        </Button>
      </div>
      <div className="border-t p-3 grid grid-cols-3 gap-2 text-center">
        {statItems.map((item, i) => (
          <div key={i}>
            <item.icon className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-base font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
