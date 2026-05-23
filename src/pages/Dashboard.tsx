import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Bell, CheckCircle2, Satellite, ArrowRight, AlertTriangle } from "lucide-react";
import { MapaLotes } from "@/components/MapaLotes";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useQuery } from "@tanstack/react-query";
import { getLotes, getAllAlertas } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: lotes = [], isLoading: loadingLotes } = useQuery({ queryKey: ['lotes'], queryFn: getLotes });
  const { data: alertas = [], isLoading: loadingAlertas } = useQuery({ queryKey: ['alertas'], queryFn: getAllAlertas });

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  
  const recentAlertas = alertas.slice(0, 5);
  const isLoading = loadingLotes || loadingAlertas;

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user ? user.nombre.split(" ")[0] : "Usuario";
    if (hour >= 6 && hour < 12) {
      return `Buenos días, ${name} 🌱`;
    } else if (hour >= 12 && hour < 20) {
      return `Buenas tardes, ${name} ☀️`;
    } else {
      return `Buenas noches, ${name} 🌙`;
    }
  };

  const kpis = [
    { label: "Total de lotes", value: lotes.length.toString(), icon: MapPin, color: "text-primary" },
    { label: "Alertas activas", value: alertas.filter(a => a.estado === "Activa").length.toString(), icon: Bell, color: "text-severity-high" },
    { label: "Lotes sin anomalías", value: lotes.filter(l => l.severity === "none").length.toString(), icon: CheckCircle2, color: "text-severity-none" },
    { label: "Última imagen procesada", value: "Hoy", icon: Satellite, color: "text-accent" },
  ];

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{getGreeting()}</h1>
          <p className="text-sm text-muted-foreground">Resumen de tus campos al día de hoy</p>
        </div>
        <p className="text-sm capitalize text-muted-foreground">{today}</p>
      </div>

      {/* Telegram Notification Send Failure Banner */}
      <div className="relative overflow-hidden rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive backdrop-blur-sm transition-all duration-200 hover:border-destructive/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-destructive/10 blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-destructive/10 p-2 text-destructive mt-0.5 sm:mt-0">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-none flex items-center gap-1.5 text-red-500">
              Fallo de envío en notificación por Telegram
            </h4>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
              Se detectó un fallo al intentar difundir la última anomalía del lote <strong>La Esperanza</strong> al canal de administración (<strong>@AgroAdmin_Bot</strong>). Error: <code>ChatNotFound (HTTP 400)</code>. Por favor, verificá que el bot de Telegram esté agregado como administrador en tu canal de difusión.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button variant="outline" size="sm" asChild className="h-8 border-destructive/25 text-destructive bg-transparent hover:bg-destructive/10 hover:text-destructive">
            <Link to="/configuracion">
              Configurar Canal
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-2.5 ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{k.label}</p>
                <p className="truncate text-lg font-semibold md:text-xl">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mapa de lotes</CardTitle>
        </CardHeader>
        <CardContent>
          <MapaLotes lotes={lotes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Alertas recientes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/alertas">
              Ver todas <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAlertas.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link to={`/lotes/${a.loteId}`} className="font-medium text-primary hover:underline">
                      {a.loteNombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.tipo}</TableCell>
                  <TableCell><SeverityBadge severity={a.severity} /></TableCell>
                  <TableCell className="text-muted-foreground">{a.fecha}</TableCell>
                  <TableCell>
                    <span className={a.estado === "Activa" ? "text-severity-high font-medium text-xs" : "text-muted-foreground text-xs"}>
                      {a.estado}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {recentAlertas.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No hay alertas recientes.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
