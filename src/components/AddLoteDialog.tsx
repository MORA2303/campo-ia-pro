import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Pencil } from "lucide-react";
import { toast } from "sonner";
import { addDynamicLote } from "@/utils/loteStorage";
import { useQueryClient } from "@tanstack/react-query";

interface AddLoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLoteDialog({ open, onOpenChange }: AddLoteDialogProps) {
  const [inferDate, setInferDate] = useState(false);
  const [nombre, setNombre] = useState("");
  const [cultivo, setCultivo] = useState<"Soja" | "Maíz" | "Trigo" | "Otro">("Soja");
  const [fechaSiembra, setFechaSiembra] = useState("");
  const [superficie, setSuperficie] = useState("");
  
  const queryClient = useQueryClient();

  const handleSave = () => {
    if (!nombre.trim()) {
      toast.error("Por favor, ingresá el nombre del lote");
      return;
    }

    if (!superficie || Number(superficie) <= 0) {
      toast.error("Por favor, ingresá una superficie válida");
      return;
    }

    // Si se infiere automáticamente o no se ingresa fecha, asignamos una fecha por defecto de hace 30 días
    let finalSowingDate = fechaSiembra;
    if (inferDate || !fechaSiembra) {
      const defaultDate = new Date("2026-05-12T12:00:00");
      defaultDate.setDate(defaultDate.getDate() - 35); // V6 en soja / crecimiento inicial
      finalSowingDate = defaultDate.toISOString().split("T")[0];
    }

    try {
      // Guardar el lote dinámicamente en localStorage y disparar eventos
      addDynamicLote(
        nombre,
        cultivo,
        finalSowingDate,
        Number(superficie)
      );

      // Invalida la caché de React Query para refrescar Mis Lotes en la vista principal (/lotes)
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
      queryClient.invalidateQueries({ queryKey: ["alertas"] });

      toast.success("Lote guardado correctamente");
      
      // Limpiar campos
      setNombre("");
      setFechaSiembra("");
      setSuperficie("");
      setInferDate(false);
      
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el lote");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card text-card-foreground border">
        <DialogHeader>
          <DialogTitle>Agregar lote</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Subir archivo</TabsTrigger>
            <TabsTrigger value="draw">Dibujar en mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/40 px-6 py-12 text-center hover:bg-muted/60">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Arrastrá tu archivo o hacé clic para seleccionar</p>
                <p className="mt-1 text-xs text-muted-foreground">Shapefile (.shp, .zip) o KML</p>
              </div>
              <input type="file" accept=".shp,.zip,.kml" className="hidden" />
            </label>
          </TabsContent>

          <TabsContent value="draw" className="mt-4">
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/40 text-center">
              <Pencil className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium">Hacé clic en el mapa para comenzar a trazar tu lote</p>
              <p className="text-xs text-muted-foreground">Cerrá el polígono haciendo clic sobre el primer punto.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 pt-2 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre del lote</Label>
            <Input 
              id="nombre" 
              placeholder="Ej: La Esperanza" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cultivo</Label>
            <Select 
              value={cultivo} 
              onValueChange={(v: any) => setCultivo(v)}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Soja">Soja</SelectItem>
                <SelectItem value="Maíz">Maíz</SelectItem>
                <SelectItem value="Trigo">Trigo</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fecha">Fecha de siembra</Label>
            <Input 
              id="fecha" 
              type="date" 
              disabled={inferDate} 
              value={fechaSiembra}
              onChange={(e) => setFechaSiembra(e.target.value)}
            />
            <div className="flex items-center gap-2 pt-1">
              <Checkbox 
                id="infer" 
                checked={inferDate} 
                onCheckedChange={(v) => setInferDate(!!v)} 
              />
              <label htmlFor="infer" className="text-xs text-muted-foreground cursor-pointer select-none">
                No sé la fecha — inferir automáticamente
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ha">Superficie estimada (ha)</Label>
            <Input 
              id="ha" 
              type="number" 
              placeholder="0" 
              value={superficie}
              onChange={(e) => setSuperficie(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>
            Guardar lote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
