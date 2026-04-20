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

interface AddLoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLoteDialog({ open, onOpenChange }: AddLoteDialogProps) {
  const [inferDate, setInferDate] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
            <Input id="nombre" placeholder="Ej: La Esperanza" />
          </div>
          <div className="space-y-1.5">
            <Label>Cultivo</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="soja">Soja</SelectItem>
                <SelectItem value="maiz">Maíz</SelectItem>
                <SelectItem value="trigo">Trigo</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fecha">Fecha de siembra</Label>
            <Input id="fecha" type="date" disabled={inferDate} />
            <div className="flex items-center gap-2 pt-1">
              <Checkbox id="infer" checked={inferDate} onCheckedChange={(v) => setInferDate(!!v)} />
              <label htmlFor="infer" className="text-xs text-muted-foreground">No sé la fecha — inferir automáticamente</label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ha">Superficie estimada (ha)</Label>
            <Input id="ha" type="number" placeholder="0" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              toast.success("Lote guardado correctamente");
              onOpenChange(false);
            }}
          >
            Guardar lote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
