import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import { severityColor, severityLabel } from "@/data/mock";
import { useQuery } from "@tanstack/react-query";
import { getLoteById, getAlertasByLote } from "@/lib/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Capa = "ndvi" | "ndwi" | "ambientes";

const ambientes = [
  { label: "Frecuentemente inundable", color: "hsl(0, 65%, 35%)" },
  { label: "Moderadamente susceptible", color: "hsl(14, 87%, 60%)" },
  { label: "Raramente afectada", color: "hsl(44, 93%, 60%)" },
  { label: "Históricamente seca", color: "hsl(147, 39%, 52%)" },
];

interface Measurement {
  fecha: string;
  ndvi: number;
  ndviEstandar: number; // Curva patrón de NDVI normal
  ndwi: number;
}

const LOTES_HISTORICAL_DATA: Record<string, Measurement[]> = {
  "1": [ // La Esperanza (Soja) - Caída continua severa
    { fecha: "13 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "20 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "27 Ene", ndvi: 0.16, ndviEstandar: 0.16, ndwi: 0.11 },
    { fecha: "03 Feb", ndvi: 0.20, ndviEstandar: 0.20, ndwi: 0.15 },
    { fecha: "10 Feb", ndvi: 0.32, ndviEstandar: 0.32, ndwi: 0.25 },
    { fecha: "17 Feb", ndvi: 0.48, ndviEstandar: 0.48, ndwi: 0.38 },
    { fecha: "24 Feb", ndvi: 0.62, ndviEstandar: 0.62, ndwi: 0.48 },
    { fecha: "03 Mar", ndvi: 0.74, ndviEstandar: 0.74, ndwi: 0.52 },
    { fecha: "10 Mar", ndvi: 0.80, ndviEstandar: 0.80, ndwi: 0.55 },
    { fecha: "17 Mar", ndvi: 0.82, ndviEstandar: 0.82, ndwi: 0.55 },
    { fecha: "24 Mar", ndvi: 0.82, ndviEstandar: 0.82, ndwi: 0.54 },
    { fecha: "31 Mar", ndvi: 0.80, ndviEstandar: 0.80, ndwi: 0.50 },
    { fecha: "07 Abr", ndvi: 0.70, ndviEstandar: 0.76, ndwi: 0.42 },
    { fecha: "14 Abr", ndvi: 0.50, ndviEstandar: 0.68, ndwi: 0.22 },
    { fecha: "21 Abr", ndvi: 0.32, ndviEstandar: 0.58, ndwi: 0.12 },
    { fecha: "28 Abr", ndvi: 0.18, ndviEstandar: 0.45, ndwi: 0.05 },
    { fecha: "05 May", ndvi: 0.15, ndviEstandar: 0.32, ndwi: 0.02 },
    { fecha: "12 May", ndvi: 0.15, ndviEstandar: 0.20, ndwi: 0.01 }
  ],
  "2": [ // El Trébol (Maíz) - Caída continua moderada
    { fecha: "13 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "20 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "27 Ene", ndvi: 0.17, ndviEstandar: 0.17, ndwi: 0.12 },
    { fecha: "03 Feb", ndvi: 0.24, ndviEstandar: 0.24, ndwi: 0.18 },
    { fecha: "10 Feb", ndvi: 0.36, ndviEstandar: 0.36, ndwi: 0.28 },
    { fecha: "17 Feb", ndvi: 0.50, ndviEstandar: 0.50, ndwi: 0.40 },
    { fecha: "24 Feb", ndvi: 0.64, ndviEstandar: 0.64, ndwi: 0.50 },
    { fecha: "03 Mar", ndvi: 0.74, ndviEstandar: 0.74, ndwi: 0.54 },
    { fecha: "10 Mar", ndvi: 0.78, ndviEstandar: 0.78, ndwi: 0.56 },
    { fecha: "17 Mar", ndvi: 0.80, ndviEstandar: 0.80, ndwi: 0.56 },
    { fecha: "24 Mar", ndvi: 0.80, ndviEstandar: 0.80, ndwi: 0.54 },
    { fecha: "31 Mar", ndvi: 0.78, ndviEstandar: 0.78, ndwi: 0.50 },
    { fecha: "07 Abr", ndvi: 0.70, ndviEstandar: 0.74, ndwi: 0.44 },
    { fecha: "14 Abr", ndvi: 0.56, ndviEstandar: 0.66, ndwi: 0.32 },
    { fecha: "21 Abr", ndvi: 0.44, ndviEstandar: 0.56, ndwi: 0.24 },
    { fecha: "28 Abr", ndvi: 0.32, ndviEstandar: 0.44, ndwi: 0.16 },
    { fecha: "05 May", ndvi: 0.22, ndviEstandar: 0.30, ndwi: 0.10 },
    { fecha: "12 May", ndvi: 0.16, ndviEstandar: 0.18, ndwi: 0.08 }
  ],
  "3": [ // San Jorge (Trigo) - Saludable, decaimiento estacional leve
    { fecha: "13 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "20 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "27 Ene", ndvi: 0.16, ndviEstandar: 0.16, ndwi: 0.11 },
    { fecha: "03 Feb", ndvi: 0.22, ndviEstandar: 0.22, ndwi: 0.16 },
    { fecha: "10 Feb", ndvi: 0.30, ndviEstandar: 0.30, ndwi: 0.24 },
    { fecha: "17 Feb", ndvi: 0.42, ndviEstandar: 0.42, ndwi: 0.34 },
    { fecha: "24 Feb", ndvi: 0.54, ndviEstandar: 0.54, ndwi: 0.42 },
    { fecha: "03 Mar", ndvi: 0.64, ndviEstandar: 0.64, ndwi: 0.46 },
    { fecha: "10 Mar", ndvi: 0.68, ndviEstandar: 0.68, ndwi: 0.48 },
    { fecha: "17 Mar", ndvi: 0.70, ndviEstandar: 0.70, ndwi: 0.48 },
    { fecha: "24 Mar", ndvi: 0.70, ndviEstandar: 0.70, ndwi: 0.46 },
    { fecha: "31 Mar", ndvi: 0.68, ndviEstandar: 0.68, ndwi: 0.42 },
    { fecha: "07 Abr", ndvi: 0.64, ndviEstandar: 0.64, ndwi: 0.38 },
    { fecha: "14 Abr", ndvi: 0.58, ndviEstandar: 0.58, ndwi: 0.32 },
    { fecha: "21 Abr", ndvi: 0.50, ndviEstandar: 0.50, ndwi: 0.26 },
    { fecha: "28 Abr", ndvi: 0.40, ndviEstandar: 0.40, ndwi: 0.20 },
    { fecha: "05 May", ndvi: 0.28, ndviEstandar: 0.28, ndwi: 0.14 },
    { fecha: "12 May", ndvi: 0.18, ndviEstandar: 0.18, ndwi: 0.10 }
  ],
  "4": [ // Don Ángel (Soja) - Saludable y estable
    { fecha: "13 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "20 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "27 Ene", ndvi: 0.16, ndviEstandar: 0.16, ndwi: 0.11 },
    { fecha: "03 Feb", ndvi: 0.20, ndviEstandar: 0.20, ndwi: 0.15 },
    { fecha: "10 Feb", ndvi: 0.32, ndviEstandar: 0.32, ndwi: 0.25 },
    { fecha: "17 Feb", ndvi: 0.48, ndviEstandar: 0.48, ndwi: 0.38 },
    { fecha: "24 Feb", ndvi: 0.62, ndviEstandar: 0.62, ndwi: 0.48 },
    { fecha: "03 Mar", ndvi: 0.74, ndviEstandar: 0.74, ndwi: 0.52 },
    { fecha: "10 Mar", ndvi: 0.80, ndviEstandar: 0.80, ndwi: 0.55 },
    { fecha: "17 Mar", ndvi: 0.82, ndviEstandar: 0.82, ndwi: 0.55 },
    { fecha: "24 Mar", ndvi: 0.82, ndviEstandar: 0.82, ndwi: 0.54 },
    { fecha: "31 Mar", ndvi: 0.80, ndviEstandar: 0.80, ndwi: 0.50 },
    { fecha: "07 Abr", ndvi: 0.76, ndviEstandar: 0.76, ndwi: 0.44 },
    { fecha: "14 Abr", ndvi: 0.68, ndviEstandar: 0.68, ndwi: 0.38 },
    { fecha: "21 Abr", ndvi: 0.58, ndviEstandar: 0.58, ndwi: 0.30 },
    { fecha: "28 Abr", ndvi: 0.45, ndviEstandar: 0.45, ndwi: 0.22 },
    { fecha: "05 May", ndvi: 0.32, ndviEstandar: 0.32, ndwi: 0.16 },
    { fecha: "12 May", ndvi: 0.20, ndviEstandar: 0.20, ndwi: 0.12 }
  ],
  "5": [ // La Paloma (Maíz) - Saludable en crecimiento activo
    { fecha: "13 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "20 Ene", ndvi: 0.15, ndviEstandar: 0.15, ndwi: 0.10 },
    { fecha: "27 Ene", ndvi: 0.17, ndviEstandar: 0.17, ndwi: 0.12 },
    { fecha: "03 Feb", ndvi: 0.24, ndviEstandar: 0.24, ndwi: 0.18 },
    { fecha: "10 Feb", ndvi: 0.36, ndviEstandar: 0.36, ndwi: 0.28 },
    { fecha: "17 Feb", ndvi: 0.50, ndviEstandar: 0.50, ndwi: 0.40 },
    { fecha: "24 Feb", ndvi: 0.64, ndviEstandar: 0.64, ndwi: 0.50 },
    { fecha: "03 Mar", ndvi: 0.74, ndviEstandar: 0.74, ndwi: 0.54 },
    { fecha: "10 Mar", ndvi: 0.78, ndviEstandar: 0.78, ndwi: 0.56 },
    { fecha: "17 Mar", ndvi: 0.80, ndviEstandar: 0.80, ndwi: 0.56 },
    { fecha: "24 Mar", ndvi: 0.80, ndviEstandar: 0.80, ndwi: 0.54 },
    { fecha: "31 Mar", ndvi: 0.78, ndviEstandar: 0.78, ndwi: 0.50 },
    { fecha: "07 Abr", ndvi: 0.74, ndviEstandar: 0.74, ndwi: 0.45 },
    { fecha: "14 Abr", ndvi: 0.66, ndviEstandar: 0.66, ndwi: 0.40 },
    { fecha: "21 Abr", ndvi: 0.56, ndviEstandar: 0.56, ndwi: 0.34 },
    { fecha: "28 Abr", ndvi: 0.44, ndviEstandar: 0.44, ndwi: 0.26 },
    { fecha: "05 May", ndvi: 0.30, ndviEstandar: 0.30, ndwi: 0.18 },
    { fecha: "12 May", ndvi: 0.18, ndviEstandar: 0.18, ndwi: 0.12 }
  ]
};

const DEFAULT_SOWING_DATES: Record<string, string> = {
  "1": "2026-03-25",
  "2": "2026-03-10",
  "3": "2026-03-01",
  "4": "2026-04-15",
  "5": "2026-04-05",
};

const getSavedSowingDate = (loteId: string): string => {
  try {
    const saved = localStorage.getItem("sowingDates");
    if (saved) {
      const dates = JSON.parse(saved);
      if (dates[loteId]) return dates[loteId];
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SOWING_DATES[loteId] || "2026-03-25";
};

const getStandardNdviCurve = (cropName: string): number[] => {
  const normalizedCropName = cropName.toLowerCase();
  
  if (normalizedCropName.includes("soja")) {
    return [0.15, 0.15, 0.16, 0.20, 0.32, 0.48, 0.62, 0.74, 0.80, 0.82, 0.82, 0.80, 0.76, 0.68, 0.58, 0.45, 0.32, 0.20];
  } else if (normalizedCropName.includes("maíz") || normalizedCropName.includes("maiz")) {
    return [0.15, 0.15, 0.17, 0.24, 0.36, 0.50, 0.64, 0.74, 0.78, 0.80, 0.80, 0.78, 0.74, 0.66, 0.56, 0.44, 0.30, 0.18];
  } else if (normalizedCropName.includes("trigo")) {
    return [0.15, 0.15, 0.16, 0.22, 0.30, 0.42, 0.54, 0.64, 0.68, 0.70, 0.70, 0.68, 0.64, 0.58, 0.50, 0.40, 0.28, 0.18];
  } else {
    const profile = [0.0, 0.0, 0.02, 0.08, 0.25, 0.49, 0.70, 0.88, 0.97, 1.0, 1.0, 0.97, 0.91, 0.79, 0.64, 0.45, 0.25, 0.08];
    const maxNdvi = 0.75;
    return profile.map(mult => 0.15 + mult * (maxNdvi - 0.15));
  }
};

const getDynamicLoteHistory = (loteId: string, cropName: string, sowingDateStr: string): Measurement[] => {
  let staticHistory = LOTES_HISTORICAL_DATA[loteId];
  if (!staticHistory) {
    const standardCurve = getStandardNdviCurve(cropName);
    staticHistory = Array.from({ length: 18 }, (_, index) => {
      const ndviEstandar = standardCurve[index] || 0.15;
      const ndvi = Math.max(0.15, ndviEstandar - 0.02 + Math.sin(index / 2) * 0.01);
      const ndwi = Math.max(0.05, 0.1 + (ndvi - 0.15) * 0.5);
      return {
        fecha: "",
        ndvi,
        ndviEstandar,
        ndwi
      };
    });
  }
  
  const finalSowingDateStr = sowingDateStr || DEFAULT_SOWING_DATES[loteId] || "2026-03-25";
  const newSowing = new Date(finalSowingDateStr + "T12:00:00");
  const validSowing = isNaN(newSowing.getTime()) ? new Date((DEFAULT_SOWING_DATES[loteId] || "2026-03-25") + "T12:00:00") : newSowing;
  const standardCurve = getStandardNdviCurve(cropName);
  
  return staticHistory.map((item, index) => {
    const newMeasureTime = validSowing.getTime() + index * 7 * 24 * 60 * 60 * 1000;
    const newMeasureDate = new Date(newMeasureTime);
    
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const day = newMeasureDate.getDate().toString().padStart(2, '0');
    const month = months[newMeasureDate.getMonth()];
    const dynamicFecha = `${day} ${month}`;
    
    const ndviEstandar = standardCurve[index] !== undefined ? standardCurve[index] : item.ndviEstandar;
    
    return {
      ...item,
      fecha: dynamicFecha,
      ndviEstandar
    };
  });
};

function splitPolygon(poly: [number, number][]): [number, number][][] {
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
  const [capa, setCapa] = useState<Capa>("ndvi");

  const { data: lote, isLoading: loteLoading, error: loteError } = useQuery({
    queryKey: ['lote', id],
    queryFn: () => getLoteById(id!),
    enabled: !!id
  });

  const { data: historial = [], isLoading: alertasLoading } = useQuery({
    queryKey: ['alertas', id],
    queryFn: () => getAlertasByLote(id!),
    enabled: !!id
  });

  if (loteLoading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div></div>;
  if (loteError || !lote) return <div className="p-12 text-center text-red-500">Error al cargar el lote.</div>;

  const ambientesPolys = splitPolygon(lote.polygon);

  // Carga de la fecha de siembra guardada o por defecto
  const sowingDateStr = getSavedSowingDate(lote.id);
  const chartHistory = getDynamicLoteHistory(lote.id, lote.cultivo, sowingDateStr);

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
          <SeverityBadge severity={lote.severity} className="text-sm" />
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

      <Card className="border border-border/60 bg-muted/5">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Evolución del NDVI · últimos 120 días</CardTitle>
            <CardDescription className="text-xs">
              Curva de vigor real (observado) frente a la firma fenológica estandarizada de referencia.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-emerald-500 bg-emerald-500/5 border-emerald-500/20 text-xs font-mono">
            Vigor Vegetativo
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 140, 140, 0.08)" />
                <XAxis 
                  dataKey="fecha" 
                  stroke="#888888" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 1.0]}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 8, 
                    fontSize: 12, 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))"
                  }} 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Line 
                  name="NDVI Observado" 
                  type="monotone" 
                  dataKey="ndvi" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                  dot={({ cx, cy, payload }: any) => {
                    if (!payload) return null;
                    const diff = payload.ndviEstandar - payload.ndvi;
                    if (diff >= 0.05) {
                      return (
                        <g key={`dot-dev-${payload.fecha}`}>
                          {/* Glowing outer ring */}
                          <circle cx={cx} cy={cy} r={9} fill="#ef4444" opacity={0.3} className="animate-pulse" />
                          {/* Inner glowing red dot */}
                          <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />
                        </g>
                      );
                    }
                    return (
                      <circle 
                        key={`dot-norm-${payload.fecha}`}
                        cx={cx} 
                        cy={cy} 
                        r={3} 
                        fill="#10b981" 
                        stroke="none"
                      />
                    );
                  }}
                />
                <Line 
                  name="NDVI Estandarizado (Patrón)" 
                  type="monotone" 
                  dataKey="ndviEstandar" 
                  stroke="#eab308" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 4" 
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
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
                <h3 className="font-semibold text-severity-high uppercase">ALERTA ACTIVA</h3>
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
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-500 animate-pulse" />
            Historial de Alertas y Mensajes Enviados (WhatsApp)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {alertasLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : historial.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">Sin alertas registradas para este lote.</p>
          ) : (
            <div className="space-y-6">
              {historial.map((a) => (
                <div key={a.id} className="flex flex-col items-start gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-muted-foreground">{a.fecha}</span>
                    <SeverityBadge severity={a.severity} />
                    <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 font-medium bg-muted text-[10px] uppercase">
                      {a.tipo}
                    </span>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium uppercase border",
                      a.estado === "Activa" 
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      {a.estado}
                    </span>
                  </div>
                  
                  {/* WhatsApp-style bubble */}
                  <div className="relative bg-emerald-500/[0.06] border border-emerald-500/15 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xl shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <MessageCircle className="h-3.5 w-3.5 fill-emerald-600/10" />
                      <span>Mensaje de WhatsApp Enviado</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground font-medium mb-1">
                      {a.descripcion}
                    </p>
                    {a.tipo === "NDVI" && (
                      <p className="text-[12px] text-muted-foreground leading-relaxed mt-2 border-t pt-2 border-emerald-500/10">
                        💡 <strong className="text-foreground">Recomendación de CampoRemoto:</strong> Se aconseja una inspección a campo en el sector afectado para validar la anomalía espectral y determinar si hay deficiencias o plagas.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
