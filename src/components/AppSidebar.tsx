import { LayoutDashboard, Map, Bell, Settings, LogOut, Users, Terminal, CloudSun } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth, Role } from "@/context/AuthContext";
import { toast } from "sonner";

const navItems = {
  productor: [
    { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
    { title: "Mis Lotes", url: "/lotes", icon: Map },
    { title: "Alertas", url: "/alertas", icon: Bell },
    { title: "Meteorología", url: "/meteorologia", icon: CloudSun },
    { title: "Asesores", url: "/asesores", icon: Users },
    { title: "Resumen", url: "/configuracion", icon: Settings },
  ],
  asesor: [
    { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
    { title: "Lotes Asignados", url: "/lotes", icon: Map },
    { title: "Alertas", url: "/alertas", icon: Bell },
    { title: "Meteorología", url: "/meteorologia", icon: CloudSun },
    { title: "Consola Antigravity", url: "/antigravity", icon: Terminal },
    { title: "Resumen", url: "/configuracion", icon: Settings },
  ],
  admin: [
    { title: "Panel Global", url: "/admin", icon: LayoutDashboard },
    { title: "Usuarios", url: "/admin/usuarios", icon: Users },
    { title: "Lotes Globales", url: "/admin/lotes", icon: Map },
    { title: "Configuración", url: "/configuracion", icon: Settings },
  ]
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, role, setRole, logout } = useAuth();
  
  const items = navItems[role];
  const userName = user?.nombre || "Usuario";
  const userInitials = user 
    ? user.nombre.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) 
    : "US";

  const handleRoleSwitch = (targetRole: Role) => {
    if (user && user.role !== targetRole) {
      const roleNames = {
        productor: "Productor",
        asesor: "Asesor",
        admin: "Administrador"
      };
      toast.error(`Acceso restringido. Debes iniciar sesión con una cuenta de tipo ${roleNames[targetRole]}.`);
      logout();
    } else {
      setRole(targetRole);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Logo collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={logout}
              title="Cerrar Sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-medium text-sidebar-foreground">{userName}</span>
              <span className="truncate text-xs text-sidebar-foreground/70 capitalize">Rol: {role}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRoleSwitch("productor")}>Vista Productor</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch("asesor")}>Vista Asesor</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch("admin")}>Vista Administrador</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive font-medium focus:bg-destructive/10 focus:text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
