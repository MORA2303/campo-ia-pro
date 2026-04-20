import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import { lotes, alertas, ndviSerie, severityColor, severityLabel } from "@/data/mock";
import { SeverityBadge } from "@/components/SeverityBadge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceArea, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type Capa = "ndvi" | "ndwi" | "ambientes";

const ambientes = [
  { label: "Frecuentemente inundable", color: "hsl(0, 65%, 35%)" },
  { label: "Moderadamente susceptible", color: "hsl(14, 87%, 60%)" },
  { label: "Raramente afectada", color: "hsl(44, 93%, 60%)" },
  { label: "Históricamente seca", color: "hsl(147, 39%, 52%)" },
];

function splitPolygon(poly: [number, number][]): [number, number][][] {
  // Split polygon into 4 quadrants visually around centroid
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
  const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  const offset = 0.012;
  return [
    [[cx, cy], [poly[0][0], cy], poly[0], [cx, poly[0][1]]],
    [[cx, cy], [cx, poly[1][1]], poly[1], [poly[1][0], cy]],
    [[cx, cy], [poly[2][0], cy], poly[2], [cx, poly[2][1]]],
    [[cx, cy], [cx, poly[3][1]], poly[3], [poly[3][0], cy]],
  ].map((p) => p.map(([a, b]) => [a + (Math.random() - 0.5) * offset * 0.1, b] as [number, number]));
}

export default function LoteDetalle() {
  const { id } = useParams();
  const lote = lotes.find((l) => l.id === id) ?? lotes[0];
  const [capa, setCapa] = useState<Capa>("ndvi");

  const historial = alertas.filter((a) => a.loteId === lote.id).slice(0, 4);
  const ambientesPolys = splitPolygon(lote.polygon);

  // First index where ndvi crosses below media for shaded area
  const dropStart = ndviSerie.findIndex((d, i) => i > 70 && d.ndvi < d.media);
  const dropStartLabel = dropStart > -1 ? ndviSerie[dropStart].dia : null;
  const dropEndLabel = ndviSerie[ndviSerie.length - 1].dia;

  const polyColor = capa === "ndvi" ? severityColor[lote.severity] : capa === "ndwi" ? "hsl(210, 80%, 55%)" : "transparent";

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/lotes"><ArrowLeft className="mr-1 h-4 w-4" /> Volver a Mis lotes</Link>
        </Button>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{lote.nombre}</h1>
            <p className="text-sm text-muted-foreground">
              {lote.cultivo} · Etapa: {lote.etapa} · Superficie: {lote.superficie} ha
            </p>
          </div>
          <SeverityBadge severity={lote.severity} label={`${severityLabel[lote.severity]} activa`} className="text-sm" />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <CardTitle className="text-base">Mapa del lote</CardTitle>
          <Tabs value={capa} onValueChange={(v) => setCapa(v as Capa)}>
            <TabsList>
              <TabsTrigger value="ndvi">NDVI</TabsTrigger>
              <TabsTrigger value="ndwi">NDWI</TabsTrigger>
              <TabsTrigger value="ambientes">Ambientes</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[380px] overflow-hidden rounded-lg border">
            <MapContainer center={lote.center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {capa === "ambientes" ? (
                ambientesPolys.map((p, i) => (
                  <Polygon key={i} positions={p} pathOptions={{ color: ambientes[i].color, fillColor: ambientes[i].color, fillOpacity: 0.6, weight: 1 }} />
                ))
              ) : (
                <Polygon positions={lote.polygon} pathOptions={{ color: polyColor, fillColor: polyColor, fillOpacity: 0.45, weight: 2 }} />
              )}
            </MapContainer>
          </div>
          {capa === "ambientes" && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {ambientes.map((a) => (
                <div key={a.label} className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                  <span className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: a.color }} />
                  <span className="text-xs">{a.label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Evolución del NDVI · últimos 90 días</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ndviSerie} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dia" tick={{ fontSize: 11 }} interval={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {dropStartLabel && (
                  <ReferenceArea x1={dropStartLabel} x2={dropEndLabel} fill="hsl(var(--severity-high))" fillOpacity={0.12} />
                )}
                <Line type="monotone" dataKey="ndvi" name="NDVI actual" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="media" name="Media histórica" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {lote.severity === "high" && (
        <Card className="border-severity-high/40 bg-severity-high/5">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-severity-high/15 p-2 text-severity-high">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-severity-high">Alerta severa activa</h3>
                <p className="text-sm">
                  Tu lote presenta una caída severa de vigor en el sector norte (Zona 1). La anomalía comenzó hace 6 días y coincide con el período crítico de floración de tu soja.
                </p>
                <div className="rounded-md border bg-background p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Recomendación</p>
                  <p className="mt-1 text-sm">
                    Visitá el sector norte del lote antes del viernes. Se esperan lluvias que podrían agravar el anegamiento existente.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="secondary" className="gap-1">
                    <MessageCircle className="h-3 w-3" /> Enviado por WhatsApp · hace 2 horas
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Alerta marcada como revisada")}>
                    Marcar como revisada
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historial de alertas del lote</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historial.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground">Sin alertas registradas.</TableCell></TableRow>
              )}
              {historial.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-muted-foreground">{a.fecha}</TableCell>
                  <TableCell>{a.tipo}</TableCell>
                  <TableCell><SeverityBadge severity={a.severity} /></TableCell>
                  <TableCell>
                    <span className={a.estado === "Activa" ? "text-severity-high font-medium text-xs" : "text-muted-foreground text-xs"}>{a.estado}</span>
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
