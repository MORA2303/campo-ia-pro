import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/SeverityBadge";
import { getSavedLotes, getSavedSowingDates, calculateActiveAlerts } from "@/utils/loteStorage";
import { Lote } from "@/data/mock";

export default function LotesGlobales() {
  const [lotesList, setLotesList] = useState<Lote[]>([]);
  const [sowingDates, setSowingDates] = useState<Record<string, string>>({});

  const loadLotesData = () => {
    setLotesList(getSavedLotes());
    setSowingDates(getSavedSowingDates());
  };

  useEffect(() => {
    loadLotesData();
    window.addEventListener("lotesUpdated", loadLotesData);
    return () => {
      window.removeEventListener("lotesUpdated", loadLotesData);
    };
  }, []);

  const activeAlerts = useMemo(() => {
    return calculateActiveAlerts(lotesList, sowingDates);
  }, [lotesList, sowingDates]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Lotes Globales</h1>
          <p className="text-sm text-muted-foreground">Vista de todos los lotes monitoreados en el sistema</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Propietario (Mock)</TableHead>
                <TableHead>Nombre del Lote</TableHead>
                <TableHead>Cultivo</TableHead>
                <TableHead>Superficie</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotesList.map((l) => {
                const activeAlert = activeAlerts.find(a => a.loteId === l.id);
                const dynamicSeverity = activeAlert ? activeAlert.severity : "none";
                return (
                  <TableRow key={l.id}>
                    <TableCell className="text-muted-foreground text-xs">{l.id.padStart(4, '0')}</TableCell>
                    <TableCell>Juan Pérez</TableCell>
                    <TableCell className="font-medium">{l.nombre}</TableCell>
                    <TableCell>{l.cultivo}</TableCell>
                    <TableCell>{l.superficie} ha</TableCell>
                    <TableCell><SeverityBadge severity={dynamicSeverity} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Inspeccionar</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
