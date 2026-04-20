import { Leaf, Satellite } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Leaf className="h-5 w-5" />
        <Satellite className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-sidebar p-0.5 text-sidebar-primary" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-foreground">CampoRemoto</span>
          <span className="text-xs font-medium text-sidebar-primary">IA</span>
        </div>
      )}
    </div>
  );
}
