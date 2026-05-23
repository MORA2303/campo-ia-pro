import { supabase } from './supabase';
import { Lote, Severity } from '@/data/mock';
import { 
  getSavedLotes, 
  getSavedSowingDates, 
  calculateActiveAlerts, 
  getDaysSinceSowing, 
  getPhenologicalStageDetails, 
  getDynamicLoteHistory 
} from '@/utils/loteStorage';

export async function getLotes(): Promise<Lote[]> {
  const localLotes = getSavedLotes();
  const sowingDates = getSavedSowingDates();
  const activeAlerts = calculateActiveAlerts(localLotes, sowingDates);

  return localLotes.map((l) => {
    const sowingDateStr = sowingDates[l.id] || "2026-03-25";
    const history = getDynamicLoteHistory(l.id, l.cultivo, sowingDateStr);
    const currentNdvi = history.length > 0 ? history[history.length - 1].ndvi : l.ndvi;
    
    const days = getDaysSinceSowing(sowingDateStr);
    const pheno = getPhenologicalStageDetails(l.cultivo, days);
    const stageName = pheno.stageName;
    
    const activeAlert = activeAlerts.find((a) => a.loteId === l.id);
    const dynamicSeverity = activeAlert ? activeAlert.severity : "none";
    
    return {
      ...l,
      ndvi: currentNdvi,
      etapa: stageName,
      severity: dynamicSeverity as Severity
    };
  });
}

export async function getLoteById(id: string): Promise<Lote> {
  const localLotes = getSavedLotes();
  const foundLocal = localLotes.find(l => l.id === id);
  const sowingDates = getSavedSowingDates();
  const activeAlerts = calculateActiveAlerts(localLotes, sowingDates);

  if (foundLocal) {
    const sowingDateStr = sowingDates[foundLocal.id] || "2026-03-25";
    const history = getDynamicLoteHistory(foundLocal.id, foundLocal.cultivo, sowingDateStr);
    const currentNdvi = history.length > 0 ? history[history.length - 1].ndvi : foundLocal.ndvi;
    
    const days = getDaysSinceSowing(sowingDateStr);
    const pheno = getPhenologicalStageDetails(foundLocal.cultivo, days);
    const stageName = pheno.stageName;

    const activeAlert = activeAlerts.find(a => a.loteId === foundLocal.id);
    return {
      ...foundLocal,
      severity: (activeAlert ? activeAlert.severity : "none") as Severity,
      etapa: stageName,
      ndvi: currentNdvi
    };
  }
  throw new Error("Lote no encontrado");
}

export async function getAllAlertas() {
  const localLotes = getSavedLotes();
  const sowingDates = getSavedSowingDates();
  const activeAlerts = calculateActiveAlerts(localLotes, sowingDates);

  const list: any[] = [];

  // 1. Agregar alertas activas dinámicas calculadas por el motor agronómico
  activeAlerts.forEach((a) => {
    let desc = `Descenso de NDVI detectado en el lote ${a.loteNombre}.`;
    if (a.severity === "high") {
      desc = `Caída severa de vigor (${(a.magnitudCaida * 100).toFixed(0)}%) en sector norte durante la etapa de ${a.etapaActiva}.`;
    } else {
      desc = `Descenso moderado de vigor (${(a.magnitudCaida * 100).toFixed(0)}%) en el sector central en etapa de ${a.etapaActiva}.`;
    }

    list.push({
      id: a.id,
      loteId: a.loteId,
      loteNombre: a.loteNombre,
      tipo: "Caída de NDVI",
      descripcion: desc,
      severity: a.severity as Severity,
      fecha: "Hoy",
      estado: "Activa"
    });
  });

  // 2. Agregar alertas resueltas históricas asociadas a los lotes existentes
  const resolvedAlerts = [
    { loteId: "1", tipo: "Estrés hídrico", descripcion: "Anegamiento parcial detectado tras lluvias intensas.", severity: "mid" as const, fecha: "hace 5 días" },
    { loteId: "4", tipo: "Caída de NDVI", descripcion: "Variación leve recuperada en pasada siguiente.", severity: "low" as const, fecha: "hace 8 días" },
    { loteId: "2", tipo: "Caída de NDVI", descripcion: "Pequeña caída puntual en borde sur.", severity: "low" as const, fecha: "hace 12 días" },
    { loteId: "5", tipo: "Estrés hídrico", descripcion: "Descenso leve de NDWI durante ola de calor.", severity: "low" as const, fecha: "hace 15 días" },
    { loteId: "3", tipo: "Caída de NDVI", descripcion: "Anomalía moderada por helada tardía.", severity: "mid" as const, fecha: "hace 20 días" },
  ];

  resolvedAlerts.forEach((ra, index) => {
    const lote = localLotes.find(l => l.id === ra.loteId);
    if (lote) {
      list.push({
        id: `alert-resolved-${ra.loteId}-${index}`,
        loteId: ra.loteId,
        loteNombre: lote.nombre,
        tipo: ra.tipo,
        descripcion: ra.descripcion,
        severity: ra.severity,
        fecha: ra.fecha,
        estado: "Resuelta"
      });
    }
  });

  return list;
}

export async function getAlertasByLote(loteId: string) {
  const all = await getAllAlertas();
  return all.filter(a => a.loteId === loteId);
}

