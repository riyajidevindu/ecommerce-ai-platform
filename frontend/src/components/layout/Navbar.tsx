import { NavLink, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Bell, LogIn, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import { useMemo } from "react";
import CommandMenu from "@/components/common/CommandMenu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // No global search bar on Stock, AI Chat, or Notifications pages.

  const pageTitle = useMemo(() => {
    // Map pathname to a human title
    const map: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/whatsapp": "WhatsApp Integration",
      "/stock": "Stock Management",
      "/ai-chat": "AI Conversations",
      "/notifications": "Notifications",
      "/settings": "Settings",
    };
    return map[location.pathname] ?? "SellerAssist";
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      notifications.show({
        title: <Text size="lg">Logout Successful</Text>,
        message: <Text size="md">You have been logged out.</Text>,
        color: "green",
      });
      navigate("/login");
    } catch (error) {
      notifications.show({
        title: <Text size="lg">Logout Failed</Text>,
        message: <Text size="md">Please try again.</Text>,
        color: "red",
      });
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-between h-14 border-b px-3 md:px-6 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-3 min-w-0">
        <NavLink to="/dashboard" className="font-display text-lg text-foreground shrink-0">
          SellerAssist
        </NavLink>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className="truncate text-sm text-muted-foreground" aria-live="polite">
          {pageTitle}
        </div>
      </div>

  {/* Global search removed for these pages to avoid extra spacing */}

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-5 w-5 text-foreground" />
              {/* Unread indicator */}
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/notifications')}>3 new messages</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/notifications')}>Low stock: Blue Hoodie</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/notifications')}>WhatsApp reconnected</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/notifications')} className="text-primary">View all</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CommandMenu />
        <ThemeToggle />
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="ml-1">
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <NavLink to="/login">
            <Button variant="secondary" className="ml-1">
              <LogIn className="h-4 w-4 mr-2" /> Sign in
            </Button>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Navbar;
