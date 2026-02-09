import { LayoutDashboard, Settings, TrendingUp, Building2, LogOut, BookOpen } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Knowledge Base', url: '/knowledge', icon: BookOpen },
  { title: 'Admin Panel', url: '/admin', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Logout gagal',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/auth');
    }
  };

  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      onMouseEnter={() => {
        if (!isMobile) setOpen(true);
      }}
      onMouseLeave={() => {
        if (!isMobile) setOpen(false);
      }}
    >
      <SidebarHeader className="p-6 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-lg font-semibold text-sidebar-foreground">Command Center</h1>
            <p className="text-xs text-sidebar-foreground/60">Management Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="transition-colors"
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3 group-data-[collapsible=icon]:p-2">
        {user && (
          <div className="text-sidebar-foreground/70 text-xs truncate group-data-[collapsible=icon]:hidden">
            {user.email}
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground"
              tooltip="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-2 text-sidebar-foreground/50 text-xs group-data-[collapsible=icon]:hidden">
          <TrendingUp className="h-3 w-3" />
          <span>Real-time data sync</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
