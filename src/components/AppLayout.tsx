import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import CampoAgente from "./CampoAgente";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAlertasActivasUsuario, 
  getAlertasActivasAsesor, 
  getEstadoNdviLotes, 
  getHistorialAlertas, 
  marcarAlertaRevisada 
} from "@/lib/api";

export function AppLayout() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const isAuthorized = role === "productor" || role === "asesor";

  // 1. Alertas activas por rol
  const { data: alertasActivas = [] } = useQuery({
    queryKey: ['alertasActivas', role],
    queryFn: () => role === 'asesor' ? getAlertasActivasAsesor() : getAlertasActivasUsuario(),
    enabled: isAuthorized
  });

  // 2. Estado de todos los lotes
  const { data: estadoNdviLotes = [] } = useQuery({
    queryKey: ['estadoNdviLotes'],
    queryFn: getEstadoNdviLotes,
    enabled: isAuthorized
  });

  // 3. Historial de alertas
  const { data: historialAlertas = [] } = useQuery({
    queryKey: ['historialAlertas'],
    queryFn: getHistorialAlertas,
    enabled: isAuthorized
  });

  // 4. Marcar alerta como revisada
  const { mutateAsync: handleMarcarRevisada } = useMutation({
    mutationFn: marcarAlertaRevisada,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertasActivas'] });
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    }
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-secondary/50">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">CampoRemoto IA</span>
            </div>
            
            {isAuthorized && (
              <div className="flex items-center gap-3">
                <CampoAgente
                  currentUser={user}
                  alertasActivas={alertasActivas as any}
                  estadoNdviLotes={estadoNdviLotes as any}
                  historialAlertas={historialAlertas}
                  onMarcarRevisada={async (id) => {
                    await handleMarcarRevisada(id);
                  }}
                />
              </div>
            )}
          </header>
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
