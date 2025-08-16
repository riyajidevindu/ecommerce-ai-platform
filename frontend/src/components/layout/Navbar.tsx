import { NavLink, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const showSearchBar = [
    "/stock", // Stock page
    "/ai-chat",   // AI Chat page
    "/notifications" // Notification page
  ].includes(location.pathname);

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
    <div className="flex items-center justify-between h-14 border-b px-3 md:px-6 bg-background sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <NavLink to="/dashboard" className="font-display text-lg text-foreground">
          SellerAssist
        </NavLink>
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
