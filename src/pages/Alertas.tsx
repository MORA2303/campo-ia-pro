import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { alertas, lotes, severityColor } from "@/data/mock";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Filtro = "todas" | "activas" | "resueltas";

export default function Alertas() {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [loteFiltro, setLoteFiltro] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtradas = useMemo(() => {
    return alertas.filter((a) => {
      if (filtro === "activas" && a.estado !== "Activa") return false;
      if (filtro === "resueltas" && a.estado !== "Resuelta") return false;
      if (loteFiltro !== "all" && a.loteId !== loteFiltro) return false;
      return true;
    });
  }, [filtro, loteFiltro]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / perPage));
  const visible = filtradas.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Alertas</h1>
        <p className="text-sm text-muted-foreground">Historial completo de eventos detectados</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 rounded-md bg-muted p-1">
          {(["todas", "activas", "resueltas"] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFiltro(f); setPage(1); }}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                filtro === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <Select value={loteFiltro} onValueChange={(v) => { setLoteFiltro(v); setPage(1); }}>
          <SelectTrigger className="w-full md:w-[220px]"><SelectValue placeholder="Filtrar por lote" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los lotes</SelectItem>
            {lotes.map((l) => <SelectItem key={l.id} value={l.id}>{l.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <ol className="relative">
            {visible.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">No hay alertas que coincidan con los filtros.</li>
            )}
            {visible.map((a, idx) => (
              <li key={a.id} className="relative flex gap-4 border-b p-5 last:border-b-0">
                <div className="relative flex flex-col items-center">
                  <div
                    className="z-10 flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: severityColor[a.severity] + "33", color: severityColor[a.severity] }}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  {idx < visible.length - 1 && <div className="absolute top-9 h-full w-px bg-border" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/lotes/${a.loteId}`} className="font-medium text-primary hover:underline">{a.loteNombre}</Link>
                    <SeverityBadge severity={a.severity} />
                    <span className={cn("text-xs font-medium", a.estado === "Activa" ? "text-severity-high" : "text-muted-foreground")}>
                      {a.estado}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{a.tipo}</p>
                  <p className="text-sm text-muted-foreground">{a.descripcion}</p>
                  <p className="text-xs text-muted-foreground">{a.fecha}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Mostrando {visible.length} de {filtradas.length} alertas
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
