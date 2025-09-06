import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  MessageCircle,
  Package,
  Bot,
  Bell,
  Settings as SettingsIcon,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
  { title: "Stock", url: "/stock", icon: Package },
  { title: "AI Chat", url: "/ai-chat", icon: Bot },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export default function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    [
      "group relative w-full transition-all duration-150 ease-out",
      "text-[1.05rem] leading-7 py-3 min-h-[44px] flex items-center",
      "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "hover:bg-muted/60 text-foreground",
    ].join(" ");

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent className="h-full flex flex-col">
        <SidebarGroup className="flex-1 flex flex-col">
          <SidebarGroupLabel className="text-sm uppercase tracking-wider text-muted-foreground mb-2 px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 flex flex-col justify-between">
            <SidebarMenu className="flex-1 flex flex-col gap-1 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {collapsed ? (
                    <Tooltip delayDuration={250}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} end className={getNavCls}>
                            {/* Left indicator for emphasis on hover (active state is handled by bg/text styles) */}
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-40" />
                            <item.icon className="mx-auto h-5 w-5 transition-transform duration-150 group-hover:scale-110" />
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="px-2 py-1 text-sm">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        {/* Left indicator for emphasis on hover (active state is handled by bg/text styles) */}
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-40" />
                        <item.icon className="mr-3 h-5 w-5 transition-transform duration-150 group-hover:scale-110" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
