import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerCard } from "./CustomerCard";
import type { MessageStatsRow } from "@/services/api";

interface CustomersListProps {
  numbers: string[];
  statsByNumber: Record<string, MessageStatsRow>;
  copied: string | null;
  onCopy: (value: string) => void;
  height?: number;
}

export function CustomersList({ numbers, statsByNumber, copied, onCopy, height = 520 }: CustomersListProps) {
  return (
    <ScrollArea className={`h-[${height}px] pr-2`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {numbers.map((n) => (
          <CustomerCard key={n} number={n} stats={statsByNumber[n]} copied={copied} onCopy={onCopy} />
        ))}
      </div>
    </ScrollArea>
  );
}
