import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { severityColor } from "@/data/mock";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useQuery } from "@tanstack/react-query";
import { getLotes } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { AddLoteDialog } from "@/components/AddLoteDialog";
import { useAuth } from "@/context/AuthContext";

export default function Lotes() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { role } = useAuth();

  const { data: lotes = [], isLoading, error } = useQuery({
    queryKey: ['lotes'],
    queryFn: getLotes
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Mis lotes</h1>
          <p className="text-sm text-muted-foreground">{lotes.length} lotes monitoreados</p>
        </div>
        {role !== "asesor" && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Agregar lote
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">Error al cargar lotes: {(error as Error).message}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lotes.map((lote) => (
          <Card key={lote.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">{lote.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{lote.cultivo} · {lote.etapa}</p>
                </div>
                <SeverityBadge severity={lote.severity} />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Superficie</span>
                <span className="font-medium">{lote.superficie} ha</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">NDVI</span>
                  <span className="font-medium">{lote.ndvi.toFixed(2)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${lote.ndvi * 100}%`,
                      backgroundColor: severityColor[lote.severity],
                    }}
                  />
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => navigate(`/lotes/${lote.id}`)}>
                Ver detalle
              </Button>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      <AddLoteDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
