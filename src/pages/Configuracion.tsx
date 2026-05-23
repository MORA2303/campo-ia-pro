import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usuario, Lote } from "@/data/mock";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { agriCropsList, fetchLiveCropsAPI, CropData, ArgentineProvince, CropCategory, cropPhenologyMap } from "@/data/agriCropsData";
import { MapPin, Globe, RefreshCw, FileText, CheckCircle2, Search, Sliders, AlertCircle, Sprout, ArrowRight, AlertTriangle, BookOpen, Check } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  getSavedLotes, 
  saveLotes, 
  getSavedSowingDates, 
  saveSowingDates, 
  getDynamicLoteHistory, 
  getDaysSinceSowing, 
  getPhenologicalStageDetails, 
  calculateActiveAlerts,
  Measurement,
  AnomalyAlert
} from "@/utils/loteStorage";

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const horas = Array.from({ length: 15 }, (_, i) => `${(6 + i).toString().padStart(2, "0")}:00`);

const defaultUmbrales = {
  ndvi: { leve: -10, moderado: -20, severo: -30 },
  ndwi: { leve: 15, moderado: 30, severo: 50 },
};


export default function Configuracion() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [umbrales, setUmbrales] = useState(defaultUmbrales);
  const [whatsappOn, setWhatsappOn] = useState(true);
  const [telegramOn, setTelegramOn] = useState(true);
  const [resumenOn, setResumenOn] = useState(true);

  // Umbrales tab state
  const [selectedUmbralLoteId, setSelectedUmbralLoteId] = useState<string>("1");
  const [selectedUmbralCrop, setSelectedUmbralCrop] = useState<string>("Soja");
  
  // Estado dinámico para la lista de lotes y fechas de siembra
  const [lotesList, setLotesList] = useState<Lote[]>([]);
  const [sowingDates, setSowingDates] = useState<Record<string, string>>({});

  const [selectedViewLote, setSelectedViewLote] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Admin Crops tab states
  const [crops, setCrops] = useState<CropData[]>(agriCropsList);
  const [selectedProvince, setSelectedProvince] = useState<ArgentineProvince | "Todas">("Todas");
  const [selectedCategory, setSelectedCategory] = useState<CropCategory | "Todas">("Todas");
  const [cropSearch, setCropSearch] = useState<string>("");
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "online" | "offline">("idle");
  const [apiMetadata, setApiMetadata] = useState<any>(null);

  // Cargar datos dinámicos desde loteStorage
  const loadDynamicData = () => {
    const savedLotes = getSavedLotes();
    const savedDates = getSavedSowingDates();
    setLotesList(savedLotes);
    setSowingDates(savedDates);
  };

  useEffect(() => {
    loadDynamicData();
    window.addEventListener("lotesUpdated", loadDynamicData);
    return () => {
      window.removeEventListener("lotesUpdated", loadDynamicData);
    };
  }, []);

  // Asegurar que el ID de lote seleccionado sea válido al cargar los lotes
  useEffect(() => {
    if (lotesList.length > 0 && !lotesList.find(l => l.id === selectedUmbralLoteId)) {
      setSelectedUmbralLoteId(lotesList[0].id);
      setSelectedUmbralCrop(lotesList[0].cultivo);
    }
  }, [lotesList, selectedUmbralLoteId]);

  // Sincronizar el cultivo cuando el usuario cambia de lote
  useEffect(() => {
    const lot = lotesList.find(l => l.id === selectedUmbralLoteId);
    if (lot) {
      setSelectedUmbralCrop(lot.cultivo);
    }
  }, [selectedUmbralLoteId, lotesList]);

  const handleLoteChange = (loteId: string) => {
    setSelectedUmbralLoteId(loteId);
    const lot = lotesList.find(l => l.id === loteId);
    if (lot) {
      setSelectedUmbralCrop(lot.cultivo);
    }
  };

  const handleSowingDateChange = (loteId: string, dateStr: string) => {
    const updatedDates = {
      ...sowingDates,
      [loteId]: dateStr
    };
    setSowingDates(updatedDates);
    saveSowingDates(updatedDates);
    
    // Invalida la caché de React Query para refrescar Mis Lotes y Alertas en toda la plataforma
    queryClient.invalidateQueries({ queryKey: ["lotes"] });
    queryClient.invalidateQueries({ queryKey: ["alertas"] });

    window.dispatchEvent(new Event("lotesUpdated"));
  };

  // Cargar datos en vivo del portal nacional en el fallback del admin
  const loadApiData = async () => {
    setApiStatus("loading");
    const result = await fetchLiveCropsAPI();
    if (result.success && result.data) {
      setApiStatus("online");
      setApiMetadata({
        title: result.data.results?.[0]?.title || "Estimaciones Agrícolas Nacionales",
        author: "Secretaría de Agricultura, Ganadería y Pesca",
        notes: "Datos del portal oficial de datos públicos de la República Argentina.",
        resourcesCount: result.data.results?.[0]?.resources?.length || 12
      });
      toast.success("Catálogo sincronizado con el Portal Nacional");
    } else {
      setApiStatus("offline");
      setApiMetadata(null);
      toast.warning("Usando base de datos local precargada y optimizada");
    }
  };

  useEffect(() => {
    loadApiData();
  }, [role]);

  const toggleCrop = (id: string) => {
    setCrops(prev => 
      prev.map(c => c.id === id ? { ...c, activo: !c.activo } : c)
    );
    const crop = crops.find(c => c.id === id);
    if (crop) {
      toast.success(`Cultivo ${crop.nombre} ${crop.activo ? "desactivado" : "activado"}`);
    }
  };

  const filteredCrops = useMemo(() => {
    return crops.filter(c => {
      const matchProvince = selectedProvince === "Todas" || c.provincias.includes(selectedProvince);
      const matchCategory = selectedCategory === "Todas" || c.categoria === selectedCategory;
      const matchSearch = c.nombre.toLowerCase().includes(cropSearch.toLowerCase()) || 
                          c.descripcion.toLowerCase().includes(cropSearch.toLowerCase());
      return matchProvince && matchCategory && matchSearch;
    });
  }, [crops, selectedProvince, selectedCategory, cropSearch]);

  const updateUmbral = (key: "ndvi" | "ndwi", level: "leve" | "moderado" | "severo", value: number) => {
    setUmbrales((prev) => ({ ...prev, [key]: { ...prev[key], [level]: value } }));
  };

  // Algoritmo centralizado y unificado de detección de alertas
  const activeAlerts = useMemo((): AnomalyAlert[] => {
    return calculateActiveAlerts(lotesList, sowingDates);
  }, [lotesList, sowingDates]);

  // Obtener la alerta activa correspondiente al lote seleccionado en la visualización
  const selectedViewLoteAlert = useMemo(() => {
    if (!selectedViewLote) return null;
    return activeAlerts.find(a => a.loteId === selectedViewLote.id) || null;
  }, [selectedViewLote, activeAlerts]);

  // Sincroniza dinámicamente el análisis de apartamiento espectral en base a getDynamicLoteHistory (para el lote seleccionado)
  const deviationAnalysis = useMemo(() => {
    const sowingDateStr = sowingDates[selectedUmbralLoteId] || "2026-03-25";
    const history = getDynamicLoteHistory(selectedUmbralLoteId, selectedUmbralCrop, sowingDateStr);
    
    return history
      .map(item => {
        const diff = item.ndviEstandar - item.ndvi;
        const pct = Math.round((diff / item.ndviEstandar) * 100);
        return {
          fecha: item.fecha,
          observed: item.ndvi,
          standard: item.ndviEstandar,
          diff,
          pct
        };
      })
      .filter(d => d.diff >= 0.05); // Resaltar desvíos mayores o iguales al 5%
  }, [selectedUmbralLoteId, selectedUmbralCrop, sowingDates]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {role === "admin" ? "Configuración" : "Resumen"}
        </h1>
        <p className="text-sm text-muted-foreground">Alertas, umbrales, lotes, cultivos</p>
      </div>

      <Tabs defaultValue="umbrales" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          {role !== "productor" && <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>}
          <TabsTrigger value="umbrales">Umbrales</TabsTrigger>
          <TabsTrigger value="anomalias" className="relative">
            Anomalías NDVI
            {activeAlerts.length > 0 && (
              <span className="ml-1.5 flex h-2 w-2 rounded-full bg-destructive" />
            )}
          </TabsTrigger>
          <TabsTrigger value="lotes">Mis lotes</TabsTrigger>
          <TabsTrigger value="cultivos">Cultivos</TabsTrigger>
        </TabsList>

        {role !== "productor" && (
          <TabsContent value="notificaciones">
            <Card>
              <CardContent className="space-y-6 p-6">
                {/* WhatsApp Notif Block */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <Sliders className="h-4 w-4 text-emerald-500" />
                    <span>Canal WhatsApp</span>
                  </h4>
                  <div className="space-y-1.5">
                    <Label htmlFor="wa">WhatsApp</Label>
                    <Input id="wa" defaultValue={usuario.whatsapp} />
                    <p className="text-xs text-muted-foreground">Incluí el prefijo +54 para Argentina.</p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">Activar alertas por WhatsApp</p>
                      <p className="text-xs text-muted-foreground">Te enviamos un mensaje al detectar anomalías.</p>
                    </div>
                    <Switch checked={whatsappOn} onCheckedChange={setWhatsappOn} />
                  </div>
                </div>

                {/* Telegram Notif Block */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <Globe className="h-4 w-4 text-sky-500" />
                    <span>Canal Telegram</span>
                  </h4>
                  <div className="space-y-1.5">
                    <Label htmlFor="tg">Canal de Difusión Telegram</Label>
                    <Input id="tg" placeholder="@mi_usuario_telegram" defaultValue="@AgroAdmin_Bot" />
                    <p className="text-xs text-muted-foreground">Canal de difusión o bot para alertas críticas del sistema global.</p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">Activar alertas por Telegram</p>
                      <p className="text-xs text-muted-foreground">Recibí notificaciones automáticas y alertas críticas en tiempo real.</p>
                    </div>
                    <Switch checked={telegramOn} onCheckedChange={setTelegramOn} />
                  </div>
                </div>

                {/* Semanal summary */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">Resumen semanal</p>
                      <p className="text-xs text-muted-foreground">Un reporte con el estado de todos tus lotes.</p>
                    </div>
                    <Switch checked={resumenOn} onCheckedChange={setResumenOn} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Día del resumen</Label>
                      <Select defaultValue="Lunes">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {dias.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hora del resumen</Label>
                      <Select defaultValue="08:00">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {horas.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={() => toast.success("Preferencias guardadas")}>Guardar cambios</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="umbrales">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Lote</Label>
                  <Select value={selectedUmbralLoteId} onValueChange={handleLoteChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {lotesList.map((l) => <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Cultivo Asignado</Label>
                  <Input 
                    value={selectedUmbralCrop} 
                    disabled 
                    className="h-10 bg-muted/50 border-muted text-muted-foreground font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha de Siembra</Label>
                  <Input 
                    type="date"
                    value={sowingDates[selectedUmbralLoteId] || ""}
                    onChange={(e) => handleSowingDateChange(selectedUmbralLoteId, e.target.value)}
                    className="h-10 bg-background border-input"
                  />
                </div>
              </div>

              {/* Evolution Charts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* NDVI Chart */}
                <Card className="border border-border/60 bg-muted/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>Evolución NDVI - Últimos 120 días</span>
                      <Badge variant="outline" className="text-emerald-500 bg-emerald-500/5 border-emerald-500/20 text-xs font-mono">
                        Vigor Vegetativo
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Curva de vigor y actividad fotosintética del lote.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={getDynamicLoteHistory(selectedUmbralLoteId, selectedUmbralCrop, sowingDates[selectedUmbralLoteId])} 
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
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
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
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
                                    {/* Outer glowing ring */}
                                    <circle cx={cx} cy={cy} r={9} fill="#ef4444" opacity={0.3} className="animate-ping" />
                                    {/* Mid red circle */}
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
                            activeDot={{ r: 5, strokeWidth: 0 }}
                            dot={{ r: 3, fill: "#eab308", stroke: "none" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* NDWI Chart */}
                <Card className="border border-border/60 bg-muted/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>Evolución NDWI - Últimos 120 días</span>
                      <Badge variant="outline" className="text-sky-500 bg-sky-500/5 border-sky-500/20 text-xs font-mono">
                        Estrés Hídrico / Humedad
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Contenido de agua en la canopia y nivel de hidratación foliar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={getDynamicLoteHistory(selectedUmbralLoteId, selectedUmbralCrop, sowingDates[selectedUmbralLoteId])} 
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
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
                            domain={[-0.2, 0.8]}
                            tickFormatter={(v) => v.toFixed(1)}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                              color: "hsl(var(--foreground))"
                            }} 
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                          <Line 
                            name="NDWI"
                            type="monotone" 
                            dataKey="ndwi" 
                            stroke="#0ea5e9" 
                            strokeWidth={3}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            dot={{ r: 3, stroke: "none" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dynamic Deviation and Scientific Reference Section */}
              <div className="grid gap-6 md:grid-cols-3 pt-6 border-t border-border">
                {/* Dynamic Anomaly details (2/3 width) */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-base text-foreground">Análisis de Apartamiento Espectral</h3>
                  </div>
                  
                  {deviationAnalysis.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Se detectó un apartamiento significativo respecto a la curva patrón normal estandarizada de <strong>{selectedUmbralCrop}</strong> en las siguientes mediciones satelitales:
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {deviationAnalysis.map((d, index) => (
                          <div key={index} className="p-3 rounded-lg border border-red-500/10 bg-red-500/5 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-muted-foreground">{d.fecha}</span>
                              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0 font-bold uppercase">
                                Desvío: -{d.pct}%
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-1">
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase block font-medium">Observado</span>
                                <strong className="text-foreground text-sm font-mono">{d.observed.toFixed(2)}</strong>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-muted-foreground uppercase block font-medium">Patrón Normal</span>
                                <strong className="text-amber-500 text-sm font-mono">{d.standard.toFixed(2)}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-red-400 leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10 mt-2">
                        💡 <strong>Interpretación Agronómica:</strong> Un desvío de vigor vegetativo respecto al patrón biológico estandarizado indica una anomalía de origen exógeno (estrés hídrico severo, fitotoxicidad, anegamiento local o deficiencia aguda de nitrógeno). Se recomienda realizar un muestreo dirigido en las coordenadas críticas del lote.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-emerald-500/10 bg-emerald-500/5 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-500 text-sm font-semibold">
                        <Check className="h-4 w-4" />
                        <span>Sin desvíos fenológicos</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        El cultivo progresa establemente dentro de sus límites vegetativos típicos. Mantener monitoreo periódico y registro de precipitaciones semanales.
                      </p>
                    </div>
                  )}
                </div>

                {/* Scientific references card (1/3 width) */}
                <div className="p-5 rounded-xl border border-border/80 bg-muted/10 space-y-4">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm border-b border-border/60 pb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Referencias Bibliográficas</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    La curva normal estandarizada de NDVI (Baseline) y su análisis fenológico se fundamentan en modelos y metodologías científicas consolidadas:
                  </p>
                  <ul className="space-y-2 text-[10px] text-muted-foreground list-disc pl-4 leading-normal">
                    <li>
                      <strong>Zhang et al. (2003)</strong><br />
                      "Monitoring vegetation phenology using temporal MODIS imagery." <em>Remote Sensing of Environment</em>. Ajuste doble logístico.
                    </li>
                    <li>
                      <strong>Beck et al. (2006)</strong><br />
                      "A estimate of vegetation phenology in northern areas from NDVI." <em>Int. Journal of Remote Sensing</em>.
                    </li>
                    <li>
                      <strong>SAGyP - Argentina</strong><br />
                      Patrones históricos y firmas espectrales de cultivos extensivos de la región pampeana.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Phenology Stages Table */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-base text-foreground">Ciclo Fenológico y Referencias de NDVI</h3>
                </div>
                <div className="overflow-hidden rounded-lg border bg-background">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[30%]">Fase Fenológica</TableHead>
                        <TableHead className="w-[20%]">Rango NDVI</TableHead>
                        <TableHead className="w-[50%]">Descripción Biológica</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(cropPhenologyMap[selectedUmbralCrop] || []).map((stage, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-xs text-foreground">{stage.etapa}</TableCell>
                          <TableCell className="font-mono text-emerald-500 font-bold text-xs">{stage.ndviRango}</TableCell>
                          <TableCell className="text-xs text-muted-foreground leading-relaxed">{stage.descripcion}</TableCell>
                        </TableRow>
                      ))}
                      {(cropPhenologyMap[selectedUmbralCrop] || []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-4">
                            No se registran etapas de ciclo detalladas para este cultivo.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalias">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
                <span>Monitoreo de Anomalías y Descenso Continuo de NDVI</span>
              </CardTitle>
              <CardDescription>
                Detección automática de pérdidas de vigor basadas en racha de días con descenso continuo (mínimo 3 mediciones en caída y acumulado ≥ 0.12).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {activeAlerts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeAlerts.map((alert) => (
                    <Card key={alert.id} className="border-destructive/20 bg-destructive/[0.02] shadow-sm relative overflow-hidden">
                      <div className="h-1.5 w-full bg-destructive" />
                      <CardContent className="p-5 space-y-4">
                        {/* Alert header */}
                        <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-3">
                          <div>
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                              <span>{alert.loteNombre}</span>
                              <Badge variant="outline" className="text-xs bg-muted/50 font-mono">
                                Lote {alert.loteId}
                              </Badge>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Cultivo: <span className="font-medium text-foreground">{alert.cultivo}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={
                              alert.severity === "high" 
                                ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10 font-bold text-xs" 
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10 font-bold text-xs"
                            }>
                              CAÍDA {alert.severity === "high" ? "CRÍTICA" : "MODERADA"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">120 días</span>
                          </div>
                        </div>

                        {/* Racha descendente */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                            Línea de Tiempo de Descenso Continuo:
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            {alert.rachaFechas.map((fecha, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <div className="px-2 py-1 rounded bg-background border border-border flex flex-col items-center">
                                  <span className="text-[9px] text-muted-foreground font-mono">{fecha}</span>
                                  <span className="font-bold font-mono text-foreground">{alert.rachaDescendente[idx].toFixed(2)}</span>
                                </div>
                                {idx < alert.rachaFechas.length - 1 && (
                                  <ArrowRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Resumen numérico */}
                        <div className="grid grid-cols-3 gap-2 py-1 bg-background/50 rounded-lg border p-2 text-center text-xs">
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase block font-medium">NDVI Pico</span>
                            <strong className="text-emerald-500 font-mono text-sm">{alert.maxNdvi.toFixed(2)}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase block font-medium">NDVI Mínimo</span>
                            <strong className="text-red-500 font-mono text-sm">{alert.currentNdvi.toFixed(2)}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase block font-medium">Caída total</span>
                            <strong className="text-destructive font-mono text-sm">-{alert.magnitudCaida.toFixed(2)}</strong>
                          </div>
                        </div>

                        {/* Contenido simplificado de la alerta */}
                        <div className="rounded-lg border border-destructive/15 bg-destructive/[0.03] p-3 text-xs leading-relaxed text-destructive/95 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-foreground">Alerta: El NDVI está descendiendo. Es necesario revisar el lote.</p>
                          </div>
                        </div>

                        {/* Critical phenological detail */}
                        <div className="text-xs pt-1">
                          <div className="flex justify-between items-center text-muted-foreground border-t border-border/40 pt-3">
                            <span>Días desde siembra:</span>
                            <span className="font-bold text-foreground font-mono">{alert.diasCiclo} días</span>
                          </div>
                          <div className="flex justify-between items-center text-muted-foreground mt-1.5">
                            <span>Etapa biológica activa:</span>
                            <span className="font-bold text-foreground">{alert.etapaActiva}</span>
                          </div>
                          {alert.isCriticalStage ? (
                            <div className="mt-3 flex items-start gap-1.5 text-destructive/90 bg-destructive/[0.03] p-2.5 rounded border border-destructive/10 leading-relaxed">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <p>
                                <strong>Alerta Crítica Agronómica:</strong> La caída coincide con la etapa reproductiva de <strong>{alert.criticalDesc}</strong>. El estrés en esta fase compromete el rendimiento de la cosecha.
                              </p>
                            </div>
                          ) : (
                            <div className="mt-3 flex items-start gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/[0.03] p-2.5 rounded border border-amber-500/10 leading-relaxed">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <p>
                                <strong>Advertencia Agronómica:</strong> Caída registrada en etapa vegetativa. Se sugiere monitorear el balance hídrico.
                              </p>
                            </div>
                          )}
                        </div>

                        <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                          <Link to={`/lotes/${alert.loteId}`} className="flex items-center justify-center gap-1">
                            <span>Acceder al Monitoreo Satelital</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-lg border border-dashed border-border/80 bg-muted/10 text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <p className="font-medium text-sm">Salud satelital óptima</p>
                  <p className="text-xs text-muted-foreground">No se detectaron rachas consecutivas de caídas críticas en el NDVI para ninguno de tus lotes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lotes">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Cultivo</TableHead>
                    <TableHead>Superficie</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotesList.map((l) => {
                    const activeAlert = activeAlerts.find((a) => a.loteId === l.id);
                    const dynamicSeverity = activeAlert ? activeAlert.severity : "none";
                    return (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.nombre}</TableCell>
                        <TableCell>{l.cultivo}</TableCell>
                        <TableCell>{l.superficie} ha</TableCell>
                        <TableCell><SeverityBadge severity={dynamicSeverity} /></TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedViewLote(l);
                              setViewOpen(true);
                            }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Modal / Dialog de "Ver Lote" interactivo */}
          {selectedViewLote && (
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
              <DialogContent className="max-w-xl bg-card border border-border p-6 rounded-xl space-y-6">
                <DialogHeader className="border-b border-border pb-3">
                  <DialogTitle className="text-lg font-bold flex items-center justify-between">
                    <span>Monitoreo Técnico: {selectedViewLote.nombre}</span>
                    <Badge variant="outline" className="text-xs bg-muted font-mono px-2 py-0.5">
                      Lote {selectedViewLote.id}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-1">
                    Características agronómicas y satelitales del lote.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 md:grid-cols-2 text-xs">
                  {/* Bloque 1: Datos generales */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Especificaciones Generales</h5>
                    <div className="rounded-lg border bg-muted/10 p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Cultivo principal:</span>
                        <strong className="text-foreground">{selectedViewLote.cultivo}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Superficie útil:</span>
                        <strong className="text-foreground">{selectedViewLote.superficie} hectáreas</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Ubicación geográfica:</span>
                        <strong className="text-foreground flex items-center gap-0.5">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span>Zona Pampeana</span>
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 2: Información del ciclo */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Parámetros del Ciclo</h5>
                    <div className="rounded-lg border bg-muted/10 p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fecha de siembra:</span>
                        <strong className="text-foreground font-mono">
                          {sowingDates[selectedViewLote.id] || "2026-03-25"}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Días en ciclo activo:</span>
                        <strong className="text-foreground font-mono">
                          {getDaysSinceSowing(sowingDates[selectedViewLote.id] || "")} días
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Etapa fenológica:</span>
                        <strong className="text-foreground">
                          {getPhenologicalStageDetails(
                            selectedViewLote.cultivo, 
                            getDaysSinceSowing(sowingDates[selectedViewLote.id] || "")
                          ).stageName}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 3: Estado de sensores satelitales actuales (ÚLTIMA MEDICIÓN SEMANA 18) */}
                  <div className="md:col-span-2 space-y-3">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sensores e Índices Satelitales (Últimos 120 días)</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="p-2.5 rounded-md bg-background/50 border border-border/50">
                        <p className="text-[10px] text-muted-foreground">NDVI Actual</p>
                        <p className="text-base font-bold text-emerald-500">
                          {(getDynamicLoteHistory(selectedViewLote.id, selectedViewLote.cultivo, sowingDates[selectedViewLote.id])?.[getDynamicLoteHistory(selectedViewLote.id, selectedViewLote.cultivo, sowingDates[selectedViewLote.id]).length - 1]?.ndvi || selectedViewLote.ndvi).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-md bg-background/50 border border-border/50">
                        <p className="text-[10px] text-muted-foreground">NDWI Actual</p>
                        <p className="text-base font-bold text-sky-500">
                          {(getDynamicLoteHistory(selectedViewLote.id, selectedViewLote.cultivo, sowingDates[selectedViewLote.id])?.[getDynamicLoteHistory(selectedViewLote.id, selectedViewLote.cultivo, sowingDates[selectedViewLote.id]).length - 1]?.ndwi || 0.20).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-md bg-background/50 border border-border/50 flex flex-col justify-between">
                        <p className="text-[10px] text-muted-foreground">Salud Sanitaria</p>
                        <div className="mt-0.5">
                          <SeverityBadge severity={selectedViewLoteAlert ? selectedViewLoteAlert.severity : "none"} />
                        </div>
                      </div>
                      <div className="p-2.5 rounded-md bg-background/50 border border-border/50">
                        <p className="text-[10px] text-muted-foreground">Centro Geográfico</p>
                        <p className="text-[10px] font-semibold mt-1 font-mono tracking-tighter">
                          {selectedViewLote.center[0].toFixed(3)}, {selectedViewLote.center[1].toFixed(3)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bloque 4: Recomendación agronómica */}
                  <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] p-4 md:col-span-2 space-y-2">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Recomendación Agronómica de Etapa</span>
                    </h5>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {selectedViewLoteAlert ? (
                        selectedViewLoteAlert.isCriticalStage ? (
                          <p>
                            <strong>Alerta Crítica Agronómica:</strong> La caída persistente de NDVI coincide con la etapa reproductiva de <strong>{selectedViewLoteAlert.criticalDesc}</strong>. El estrés biótico/abiótico en esta fase crítica de rendimiento compromete gravemente la cosecha final. Se sugiere realizar un muestreo urgente a campo.
                          </p>
                        ) : (
                          <p>
                            <strong>Advertencia Agronómica:</strong> Caída moderada de NDVI registrada durante la etapa vegetativa. Se sugiere monitorear el balance hídrico foliar, el estado de nutrición nitrogenada del lote y constatar posible presencia de plagas foliares.
                          </p>
                        )
                      ) : (
                        <p>
                          {getPhenologicalStageDetails(
                            selectedViewLote.cultivo, 
                            getDaysSinceSowing(sowingDates[selectedViewLote.id] || "")
                          ).criticalDesc || 
                          "El cultivo progresa establemente dentro de sus límites vegetativos típicos. Mantener monitoreo periódico y registro de precipitaciones semanales."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                  <Button variant="outline" onClick={() => setViewOpen(false)} className="text-xs">
                    Cerrar
                  </Button>
                  <Button asChild onClick={() => setViewOpen(false)} className="text-xs">
                    <Link to={`/lotes/${selectedViewLote.id}`} className="flex items-center gap-1">
                      <span>Ir a Monitoreo Detallado</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="cultivos">
          <div className="space-y-6">
              {/* API Connection Banner */}
              <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg shrink-0 ${
                      apiStatus === "online" 
                        ? "bg-emerald-500/10 text-emerald-600 animate-pulse" 
                        : apiStatus === "offline" 
                        ? "bg-amber-500/10 text-amber-600" 
                        : "bg-muted text-muted-foreground animate-pulse"
                    }`}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm">Portal de Datos Abiertos Nacionales</h4>
                        {apiStatus === "online" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1.5 flex items-center text-xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            API Conectada
                          </Badge>
                        ) : apiStatus === "offline" ? (
                          <Badge variant="outline" className="text-amber-600 bg-amber-500/[0.06] border-amber-500/20 gap-1 text-xs">
                            Base Local Respaldo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground bg-muted/20 gap-1 text-xs animate-pulse">
                            Sincronizando...
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">
                        {apiStatus === "online" 
                          ? "Sincronizado con las estimaciones agrícolas oficiales del Ministerio de Economía de la Nación Argentina." 
                          : "No se pudo establecer conexión en vivo (CORS o Red). Se activó el respaldo local optimizado."}
                      </p>
                      {apiMetadata && (
                        <div className="mt-2.5 rounded border border-emerald-500/10 bg-emerald-500/[0.04] p-3 text-xs">
                          <p className="font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            Dataset: {apiMetadata.title}
                          </p>
                          <p className="text-muted-foreground mt-1 leading-relaxed">{apiMetadata.notes}</p>
                          <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground/80">
                            <span>Autor: <strong>{apiMetadata.author}</strong></span>
                            <span>Tablas disponibles: <strong>{apiMetadata.resourcesCount}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={loadApiData} 
                    disabled={apiStatus === "loading"}
                    className="gap-1.5 shrink-0 self-start md:self-center"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${apiStatus === "loading" ? "animate-spin" : ""}`} />
                    Reconectar API
                  </Button>
                </CardContent>
              </Card>

              {/* Filter Panel */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o descripción..."
                        value={cropSearch}
                        onChange={(e) => setCropSearch(e.target.value)}
                        className="pl-9 bg-muted/30 border-muted"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground px-1">Provincia</span>
                        <Select value={selectedProvince} onValueChange={(v) => setSelectedProvince(v as any)}>
                          <SelectTrigger className="w-[160px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todas">Todas</SelectItem>
                            <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                            <SelectItem value="Santa Fe">Santa Fe</SelectItem>
                            <SelectItem value="Córdoba">Córdoba</SelectItem>
                            <SelectItem value="La Pampa">La Pampa</SelectItem>
                            <SelectItem value="Entre Ríos">Entre Ríos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground px-1">Categoría</span>
                        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todas">Todas</SelectItem>
                            <SelectItem value="Extensivo">Extensivos</SelectItem>
                            <SelectItem value="Forraje">Forrajes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Crops list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCrops.map((c) => (
                  <Card 
                    key={c.id} 
                    className={`overflow-hidden border transition-all duration-200 ${
                      c.activo 
                        ? "border-emerald-500/20 bg-background shadow-sm hover:shadow-md" 
                        : "border-border bg-muted/20 opacity-75"
                    }`}
                  >
                    <div className="p-5 space-y-4">
                      {/* Name & category */}
                      <div className="flex justify-between items-start gap-2 border-b border-border pb-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-base text-foreground">{c.nombre}</span>
                          <Badge className={c.categoria === "Extensivo" ? "bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 border-sky-500/10" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/10"}>
                            {c.categoria}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed min-h-[50px]">{c.descripcion}</p>
                      
                      {/* Technical values */}
                      <div className="space-y-2 mt-4 pt-3 border-t border-dashed border-border text-[11px]">
                        <div>
                          <span className="text-muted-foreground block font-medium uppercase tracking-wider text-[9px] mb-0.5">Ventana de Siembra</span>
                          <strong className="text-foreground text-xs leading-relaxed block whitespace-pre-line">{c.siembra}</strong>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border/30">
                          <span className="text-muted-foreground uppercase tracking-wider text-[9px]">Rango NDVI Óptimo</span>
                          <strong className="text-emerald-500 font-mono text-xs">{c.ndviOptimo}</strong>
                        </div>
                      </div>

                      {/* Provinces tags */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {c.provincias.map((p) => {
                          const acronyms = {
                            "Buenos Aires": "BA",
                            "Santa Fe": "SF",
                            "La Pampa": "LP",
                            "Córdoba": "CB",
                            "Entre Ríos": "ER"
                          };
                          return (
                            <Badge 
                              key={p} 
                              variant="secondary" 
                              className="text-[9px] px-1.5 py-0 bg-muted text-muted-foreground/80 hover:bg-muted font-mono"
                              title={p}
                            >
                              {acronyms[p as keyof typeof acronyms]}
                            </Badge>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-3">
                        <span className="text-xs font-medium text-muted-foreground">Estado de monitoreo</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono font-bold ${c.activo ? "text-emerald-500" : "text-muted-foreground"}`}>
                            {c.activo ? "ACTIVO" : "INACTIVO"}
                          </span>
                          <Switch checked={c.activo} onCheckedChange={() => toggleCrop(c.id)} />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {filteredCrops.length === 0 && (
                  <div className="col-span-full py-12 text-center border rounded-lg bg-muted/10 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No se encontraron cultivos para los filtros aplicados</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
      </Tabs>
    </div>
  );
}