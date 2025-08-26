import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search } from "lucide-react";

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Toggle with Ctrl/Cmd + K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo(
    () => [
      { label: "Dashboard", to: "/dashboard" },
      { label: "WhatsApp Integration", to: "/whatsapp" },
      { label: "Stock Management", to: "/stock" },
      { label: "AI Conversations", to: "/ai-chat" },
      { label: "Notifications", to: "/notifications" },
      { label: "Settings", to: "/settings" },
    ],
    []
  );

  const go = (to: string) => {
    if (location.pathname !== to) navigate(to);
    setOpen(false);
  };

  const isMac = navigator.platform.toUpperCase().includes("MAC");

  return (
    <>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex gap-2"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search</span>
            <span className="ml-1 text-xs text-muted-foreground border rounded px-1">
              {isMac ? "⌘K" : "Ctrl K"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search and quick actions</TooltipContent>
      </Tooltip>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages or actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {items.map((it) => (
              <CommandItem key={it.to} onSelect={() => go(it.to)}>
                {it.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => setOpen(false)}>
              Toggle theme
              <CommandShortcut>{isMac ? "⌘T" : "Ctrl T"}</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
