import { NavLink } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, LogIn } from "lucide-react";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between h-14 border-b px-3 md:px-6 bg-background sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <NavLink to="/dashboard" className="font-display text-lg">
          SellerAssist
        </NavLink>
      </div>

      <div className="hidden md:flex items-center gap-3 w-[420px]">
        <Input placeholder="Search..." className="w-full" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <NavLink to="/login">
          <Button variant="secondary" className="ml-1">
            <LogIn className="h-4 w-4 mr-2" /> Sign in
          </Button>
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;
