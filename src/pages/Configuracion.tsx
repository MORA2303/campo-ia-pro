import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { lotes, usuario } from "@/data/mock";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const horas = Array.from({ length: 15 }, (_, i) => `${(6 + i).toString().padStart(2, "0")}:00`);

const defaultUmbrales = {
  ndvi: { leve: -10, moderado: -20, severo: -30 },
  ndwi: { leve: 15, moderado: 30, severo: 50 },
};

export default function Configuracion() {
  const [umbrales, setUmbrales] = useState(defaultUmbrales);
  const [whatsappOn, setWhatsappOn] = useState(true);
  const [resumenOn, setResumenOn] = useState(true);

  const updateUmbral = (key: "ndvi" | "ndwi", level: "leve" | "moderado" | "severo", value: number) => {
    setUmbrales((prev) => ({ ...prev, [key]: { ...prev[key], [level]: value } }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Configuración</h1>
        <p className="text-sm text-muted-foreground">Personalizá tus alertas, umbrales y lotes</p>
      </div>

      <Tabs defaultValue="umbrales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="umbrales">Umbrales</TabsTrigger>
          <TabsTrigger value="lotes">Mis lotes</TabsTrigger>
        </TabsList>

        <TabsContent value="notificaciones">
          <Card>
            <CardContent className="space-y-6 p-6">
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
                    <SelectContent>{dias.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Hora del resumen</Label>
                  <Select defaultValue="08:00">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{horas.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => toast.success("Preferencias guardadas")}>Guardar cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="umbrales">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Lote</Label>
                  <Select defaultValue={lotes[0].id}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{lotes.map((l) => <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Cultivo</Label>
                  <Select defaultValue="Soja">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soja">Soja</SelectItem>
                      <SelectItem value="Maíz">Maíz</SelectItem>
                      <SelectItem value="Trigo">Trigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Índice</TableHead>
                      <TableHead>Leve (%)</TableHead>
                      <TableHead>Moderado (%)</TableHead>
                      <TableHead>Severo (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(["ndvi", "ndwi"] as const).map((k) => (
                      <TableRow key={k}>
                        <TableCell className="font-medium uppercase">{k}</TableCell>
                        {(["leve", "moderado", "severo"] as const).map((lvl) => (
                          <TableCell key={lvl}>
                            <Input
                              type="number"
                              value={umbrales[k][lvl]}
                              onChange={(e) => updateUmbral(k, lvl, Number(e.target.value))}
                              className="h-9 w-24"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setUmbrales(defaultUmbrales); toast("Valores restaurados"); }}>
                  Restaurar valores por defecto
                </Button>
                <Button onClick={() => toast.success("Umbrales guardados")}>Guardar</Button>
              </div>
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
                  {lotes.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.nombre}</TableCell>
                      <TableCell>{l.cultivo}</TableCell>
                      <TableCell>{l.superficie} ha</TableCell>
                      <TableCell><SeverityBadge severity={l.severity} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/lotes/${l.id}`}>Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
