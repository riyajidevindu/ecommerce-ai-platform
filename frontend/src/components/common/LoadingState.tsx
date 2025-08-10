import { Loader2, Inbox } from "lucide-react";

export const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
    <Loader2 className="h-8 w-8 animate-spin mb-3" />
    <p>{label}</p>
  </div>
);

export const EmptyState = ({
  title = "Nothing here yet",
  description = "When there is content, you will see it here.",
}: {
  title?: string;
  description?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
    <Inbox className="h-10 w-10 mb-3" />
    <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
    <p className="max-w-md">{description}</p>
  </div>
);
