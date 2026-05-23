import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, Map, AlertTriangle, CheckCircle2, Sprout, Search, Plus, Ban, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface CultivoPampeano {
  id: string;
  nombre: string;
  nombreCientifico: string;
  tipo: "Cereal" | "Oleaginosa" | "Forrajera" | "Legumbre";
  campañaTipica: "Verano" | "Invierno" | "Anual";
  mesSiembra: string;
  mesCosecha: string;
  activo: boolean;
}

const CULTIVOS_PAMPEANOS_SEED: CultivoPampeano[] = [
  { id: "c1", nombre: "Soja", nombreCientifico: "Glycine max", tipo: "Oleaginosa", campañaTipica: "Verano", mesSiembra: "• Buenos Aires:\n  - Temprana (1ª): Noviembre (1 - 25 Nov)\n  - Tardía (2ª): Diciembre (5 - 30 Dic)\n• Santa Fe (Zona Núcleo):\n  - Temprana (1ª): fines de Octubre - Noviembre (20 Oct - 15 Nov)\n  - Tardía (2ª): Diciembre - Enero (1 - 20 Dic)\n• Córdoba:\n  - Temprana (1ª): fines de Octubre - Noviembre (todo Noviembre)\n  - Tardía (2ª): Diciembre - Enero (10 Dic - 5 Ene)\n• Entre Ríos:\n  - Temprana (1ª): mediados de Octubre - Noviembre (25 Oct - 20 Nov)\n  - Tardía (2ª): Diciembre - Enero (5 - 25 Dic)\n• La Pampa:\n  - Temprana (1ª): Noviembre (5 - 30 Nov)\n  - Tardía (2ª): Diciembre (1 - 20 Dic)", mesCosecha: "Marzo - Mayo", activo: true },
  { id: "c2", nombre: "Maíz", nombreCientifico: "Zea mays", tipo: "Cereal", campañaTipica: "Verano", mesSiembra: "• Temprana:\n  Septiembre - Octubre (óptimo 15 Sep - 25 Oct)\n• Tardía:\n  Noviembre - Diciembre (óptimo 20 Nov - 15 Dic)", mesCosecha: "Marzo - Julio", activo: true },
  { id: "c3", nombre: "Trigo", nombreCientifico: "Triticum aestivum", tipo: "Cereal", campañaTipica: "Invierno", mesSiembra: "• Temprana (Ciclos largos):\n  Mayo - Junio (óptimo 15 May - 15 Jun)\n• Tardía (Ciclos cortos):\n  Julio - Agosto (óptimo 20 Jun - 25 Jul)", mesCosecha: "Noviembre - Diciembre", activo: true },
  { id: "c4", nombre: "Girasol", nombreCientifico: "Helianthus annuus", tipo: "Oleaginosa", campañaTipica: "Verano", mesSiembra: "• Temprana:\n  Septiembre - Octubre (óptimo fines de Sep)\n• Tardía:\n  Noviembre - Diciembre", mesCosecha: "Febrero - Marzo", activo: true },
  { id: "c5", nombre: "Cebada Cervecera", nombreCientifico: "Hordeum vulgare", tipo: "Cereal", campañaTipica: "Invierno", mesSiembra: "• Temprana (Ciclos largos):\n  Mayo - Junio\n• Tardía (Ciclos cortos):\n  Julio", mesCosecha: "Noviembre - Diciembre", activo: true },
  { id: "c6", nombre: "Sorgo Granífero", nombreCientifico: "Sorghum bicolor", tipo: "Cereal", campañaTipica: "Verano", mesSiembra: "• Temprana:\n  Octubre - Noviembre (suelo > 18°C)\n• Tardía:\n  Diciembre - Enero", mesCosecha: "Abril - Mayo", activo: true },
  { id: "c7", nombre: "Alfalfa", nombreCientifico: "Medicago sativa", tipo: "Forrajera", campañaTipica: "Anual", mesSiembra: "• Temprana (Otoño):\n  Marzo - Abril (máximo arraigo)\n• Tardía (Primavera):\n  Septiembre - Octubre (alternativa)", mesCosecha: "Cortes periódicos", activo: true },
  { id: "c8", nombre: "Colza / Canola", nombreCientifico: "Brassica napus", tipo: "Oleaginosa", campañaTipica: "Invierno", mesSiembra: "• Temprana:\n  Abril\n• Tardía:\n  Mayo", mesCosecha: "Octubre - Noviembre", activo: true },
  { id: "c9", nombre: "Avena", nombreCientifico: "Avena sativa", tipo: "Cereal", campañaTipica: "Invierno", mesSiembra: "• Temprana:\n  Febrero - Marzo\n• Tardía:\n  Abril - Mayo", mesCosecha: "Noviembre - Diciembre", activo: true },
  { id: "c10", nombre: "Centeno", nombreCientifico: "Secale cereale", tipo: "Cereal", campañaTipica: "Invierno", mesSiembra: "• Temprana:\n  Febrero - Marzo\n• Tardía:\n  Abril - Mayo", mesCosecha: "Octubre - Noviembre", activo: true },
  { id: "c11", nombre: "Arveja Amarilla/Verde", nombreCientifico: "Pisum sativum", tipo: "Legumbre", campañaTipica: "Invierno", mesSiembra: "• Temprana:\n  Junio\n• Tardía:\n  Julio", mesCosecha: "Noviembre", activo: true },
];

const kpis = [
  { label: "Productores activos", value: "142", icon: Users },
  { label: "Lotes monitoreados", value: "854", icon: Map },
  { label: "Alertas enviadas (hoy)", value: "37", icon: Activity },
  { label: "Integración GEE", value: "Operativa", icon: CheckCircle2, color: "text-severity-none" },
  { label: "Fallos WhatsApp", value: "2", icon: AlertTriangle, color: "text-severity-high" },
  { label: "Fallos Telegram", value: "1", icon: AlertTriangle, color: "text-severity-high" },
];

export default function AdminDashboard() {
  const [cultivos, setCultivos] = useState<CultivoPampeano[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for new crop
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCientifico, setNuevoCientifico] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<CultivoPampeano["tipo"]>("Cereal");
  const [nuevaCampana, setNuevaCampana] = useState<CultivoPampeano["campañaTipica"]>("Verano");
  const [nuevoSiembra, setNuevoSiembra] = useState("");
  const [nuevoCosecha, setNuevoCosecha] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("campo_cultivos_pampeanos");
    if (stored && stored.includes("Temprana (1ª)")) {
      setCultivos(JSON.parse(stored));
    } else {
      localStorage.setItem("campo_cultivos_pampeanos", JSON.stringify(CULTIVOS_PAMPEANOS_SEED));
      setCultivos(CULTIVOS_PAMPEANOS_SEED);
    }
  }, []);

  const persistCultivos = (updated: CultivoPampeano[]) => {
    setCultivos(updated);
    localStorage.setItem("campo_cultivos_pampeanos", JSON.stringify(updated));
  };

  const handleToggleActivo = (id: string) => {
    const updated = cultivos.map(c => {
      if (c.id === id) {
        const nextState = !c.activo;
        toast.success(`Cultivo ${c.nombre} marcado como ${nextState ? "activo" : "inactivo"}`);
        return { ...c, activo: nextState };
      }
      return c;
    });
    persistCultivos(updated);
  };

  const handleAddCultivo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevoNombre || !nuevoCientifico || !nuevoSiembra || !nuevoCosecha) {
      toast.error("Por favor, completa todos los campos del nuevo cultivo.");
      return;
    }

    const nuevo: CultivoPampeano = {
      id: "c_" + Math.random().toString(36).substring(2, 9),
      nombre: nuevoNombre,
      nombreCientifico: nuevoCientifico,
      tipo: nuevoTipo,
      campañaTipica: nuevaCampana,
      mesSiembra: nuevoSiembra,
      mesCosecha: nuevoCosecha,
      activo: true
    };

    const updated = [...cultivos, nuevo];
    persistCultivos(updated);
    toast.success(`¡Cultivo ${nuevoNombre} agregado con éxito!`);

    // Reset fields and close form
    setNuevoNombre("");
    setNuevoCientifico("");
    setNuevoSiembra("");
    setNuevoCosecha("");
    setShowAddForm(false);
  };

  const filteredCultivos = cultivos.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombreCientifico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoBadgeColor = (tipo: CultivoPampeano["tipo"]) => {
    switch (tipo) {
      case "Cereal": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/30";
      case "Oleaginosa": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/30";
      case "Forrajera": return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/30";
      case "Legumbre": return "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 border-sky-500/30";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground">Monitoreo y configuración de la plataforma CampoRemoto IA</p>
      </div>

      <Tabs defaultValue="estado" className="space-y-6">
        <TabsList className="bg-secondary/70 p-1 border rounded-lg max-w-lg grid grid-cols-2">
          <TabsTrigger value="estado" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Estado del Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="cultivos" className="flex items-center gap-2">
            <Sprout className="h-4 w-4" />
            <span>Cultivos</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña: Estado del Sistema */}
        <TabsContent value="estado" className="space-y-6 focus-visible:ring-0">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            {kpis.map((k) => (
              <Card key={k.label} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`rounded-lg bg-muted p-2.5 ${k.color || "text-primary"}`}>
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

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimos errores del sistema</CardTitle>
                <CardDescription>Eventos de depuración registrados hoy.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-severity-high mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Fallo envío Twilio</p>
                      <p className="text-xs text-muted-foreground">No se pudo enviar WhatsApp al +549111234567. Reintento programado.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-severity-high mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Fallo envío Telegram</p>
                      <p className="text-xs text-muted-foreground">No se pudo enviar mensaje a @AgroAdmin_Bot. ChatNotFound (HTTP 400).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-severity-mid mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Exceso de nubosidad GEE</p>
                      <p className="text-xs text-muted-foreground">Lote ID 452 descartado temporalmente por &gt;20% de nubes.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña: Configuración de Cultivos de la Región Pampeana */}
        <TabsContent value="cultivos" className="space-y-6 focus-visible:ring-0">
          <Card>
            <CardHeader className="pb-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg">Cultivos</CardTitle>
                <CardDescription>
                  Catálogo de cultivos registrados para la siembra en la plataforma.
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowAddForm(prev => !prev)}
                className="bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-1.5 w-full md:w-auto self-start"
              >
                <Plus className="h-4 w-4" />
                <span>{showAddForm ? "Cerrar Formulario" : "Agregar Cultivo"}</span>
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              
              {/* Formulario de Alta de Cultivo */}
              {showAddForm && (
                <form onSubmit={handleAddCultivo} className="p-4 rounded-lg bg-secondary/50 border border-white/5 space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <Sprout className="h-4 w-4 text-accent" />
                    <span>Registrar Cultivo</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="crop-name" className="text-xs font-semibold text-muted-foreground">Nombre Común</Label>
                      <Input 
                        id="crop-name" 
                        placeholder="Ej. Girasol"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="crop-science" className="text-xs font-semibold text-muted-foreground">Nombre Científico</Label>
                      <Input 
                        id="crop-science" 
                        placeholder="Ej. Helianthus annuus"
                        value={nuevoCientifico}
                        onChange={(e) => setNuevoCientifico(e.target.value)}
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Tipo de Cultivo</Label>
                        <select 
                          value={nuevoTipo} 
                          onChange={(e) => setNuevoTipo(e.target.value as CultivoPampeano["tipo"])}
                          className="w-full text-sm bg-background border border-input rounded-md h-9 px-3 focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="Cereal">Cereal</option>
                          <option value="Oleaginosa">Oleaginosa</option>
                          <option value="Forrajera">Forrajera</option>
                          <option value="Legumbre">Legumbre</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Campaña</Label>
                        <select 
                          value={nuevaCampana} 
                          onChange={(e) => setNuevaCampana(e.target.value as CultivoPampeano["campañaTipica"])}
                          className="w-full text-sm bg-background border border-input rounded-md h-9 px-3 focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="Verano">Verano</option>
                          <option value="Invierno">Invierno</option>
                          <option value="Anual">Anual</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="crop-plant" className="text-xs font-semibold text-muted-foreground">Período de Siembra</Label>
                      <Input 
                        id="crop-plant" 
                        placeholder="Ej. Octubre - Noviembre"
                        value={nuevoSiembra}
                        onChange={(e) => setNuevoSiembra(e.target.value)}
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="crop-harvest" className="text-xs font-semibold text-muted-foreground">Período de Cosecha</Label>
                      <Input 
                        id="crop-harvest" 
                        placeholder="Ej. Marzo - Abril"
                        value={nuevoCosecha}
                        onChange={(e) => setNuevoCosecha(e.target.value)}
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="w-full bg-accent hover:bg-accent/80 text-[#07160f] font-bold">
                        Confirmar Alta de Cultivo
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Filtro de Búsqueda */}
              <div className="relative">
                <Search className="absolute inset-y-0 left-0 pl-3 h-9 w-9 text-muted-foreground pointer-events-none flex items-center" />
                <Input 
                  placeholder="Buscar cultivos por nombre, clasificación o nombre científico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-background border-input"
                />
              </div>

              {/* Tabla de Cultivos */}
              <div className="border rounded-lg overflow-x-auto bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Nombre Común</TableHead>
                      <TableHead>Nombre Científico</TableHead>
                      <TableHead>Clasificación</TableHead>
                      <TableHead>Campaña</TableHead>
                      <TableHead>Siembra</TableHead>
                      <TableHead>Cosecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right pr-6">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCultivos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          Ningún cultivo coincide con tu búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCultivos.map((c) => (
                        <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-semibold pl-6">{c.nombre}</TableCell>
                          <TableCell className="italic text-xs text-muted-foreground">{c.nombreCientifico}</TableCell>
                          <TableCell>
                            <Badge className={getTipoBadgeColor(c.tipo)} variant="outline">
                              {c.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{c.campañaTipica}</TableCell>
                          <TableCell className="text-xs whitespace-pre-line leading-relaxed">{c.mesSiembra}</TableCell>
                          <TableCell className="text-xs">{c.mesCosecha}</TableCell>
                          <TableCell>
                            {c.activo ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/25">
                                Habilitado
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/10 text-red-500 border-red-500/25">
                                Deshabilitado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              variant={c.activo ? "ghost" : "outline"} 
                              size="sm" 
                              onClick={() => handleToggleActivo(c.id)}
                              className={`h-8 font-semibold ${
                                c.activo 
                                  ? "text-red-500 hover:text-red-600 hover:bg-red-500/10" 
                                  : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20"
                              }`}
                            >
                              {c.activo ? (
                                <span className="flex items-center gap-1"><Ban className="h-3 w-3" /> Desactivar</span>
                              ) : (
                                <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Activar</span>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple label helper since shadcn label wasn't locally imported as a custom UI in some parts or needs standard wrapper
function Label({ children, className, htmlFor }: { children: React.ReactNode, className?: string, htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={`text-xs font-semibold select-none ${className}`}>
      {children}
    </label>
  );
}
