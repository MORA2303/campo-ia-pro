import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Bell, CheckCircle2, Satellite, ArrowRight } from "lucide-react";
import { MapaLotes } from "@/components/MapaLotes";
import { lotes, alertas } from "@/data/mock";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const kpis = [
  { label: "Total de lotes", value: "8", icon: MapPin, color: "text-primary" },
  { label: "Alertas activas", value: "3", icon: Bell, color: "text-severity-high" },
  { label: "Lotes sin anomalías", value: "5", icon: CheckCircle2, color: "text-severity-none" },
  { label: "Última imagen procesada", value: "hace 2 días", icon: Satellite, color: "text-accent" },
];

export default function Dashboard() {
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const recentAlertas = alertas.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Buen día, Juan 🌱</h1>
          <p className="text-sm text-muted-foreground">Resumen de tus campos al día de hoy</p>
        </div>
        <p className="text-sm capitalize text-muted-foreground">{today}</p>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
