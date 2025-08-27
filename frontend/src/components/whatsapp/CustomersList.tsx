import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerCard } from "./CustomerCard";
import type { MessageStatsRow } from "@/services/api";
import { motion } from "framer-motion";

interface CustomersListProps {
  numbers: string[];
  statsByNumber: Record<string, MessageStatsRow>;
  copied: string | null;
  onCopy: (value: string) => void;
  height?: number;
}

export function CustomersList({ numbers, statsByNumber, copied, onCopy, height = 480 }: CustomersListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <ScrollArea className={`h-[${height}px] pr-2`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {numbers.map((n) => (
          <CustomerCard key={n} number={n} stats={statsByNumber[n]} copied={copied} onCopy={onCopy} />
        ))}
      </motion.div>
    </ScrollArea>
  );
}
