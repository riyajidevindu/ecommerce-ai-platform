import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({ page, totalPages, onPrev, onNext }: PaginationControlsProps) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled={page === 1} onClick={onPrev}>Prev</Button>
        <Button variant="outline" disabled={page >= totalPages} onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
