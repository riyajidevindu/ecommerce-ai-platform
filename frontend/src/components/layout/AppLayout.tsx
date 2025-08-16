import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Navbar from "./Navbar";
import AppSidebar from "./AppSidebar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center h-14 border-b">
            <SidebarTrigger className="ml-2 mr-2 text-foreground" />
            <div className="w-full">
              <Navbar />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 container animate-enter">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
