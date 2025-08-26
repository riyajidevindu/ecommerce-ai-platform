import { NavLink, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, LogIn, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import { useMemo } from "react";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const showSearchBar = [
    "/stock", // Stock page
    "/ai-chat",   // AI Chat page
    "/notifications" // Notification page
  ].includes(location.pathname);

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

      {showSearchBar && (
        <div className="hidden md:flex items-center gap-3 w-[420px]">
          <Input placeholder="Search..." className="w-full" />
        </div>
      )}

  <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5 text-foreground" />
        </Button>
        <ThemeToggle />
        {isAuthenticated ? (
          <Button variant="secondary" className="ml-1" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
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
