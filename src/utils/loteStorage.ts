import { Lote, Severity, lotes as defaultLotes } from "@/data/mock";
import { cropPhenologyMap } from "@/data/agriCropsData";

// --- CONSTANTES BASE Y DATOS MOCK DE RESPALDO ---
export const DEFAULT_SOWING_DATES: Record<string, string> = {
  "1": "2026-03-25",
  "2": "2026-03-10",
  "3": "2026-03-01",
  "4": "2026-04-15",
  "5": "2026-04-05",
};

export interface Measurement {
  fecha: string;
  ndvi: number;
  ndviEstandar: number;
  ndwi: number;
}

export const LOTES_HISTORICAL_DATA: Record<string, Measurement[]> = {
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

// --- ESTRUCTURA DE ALERTAS ---
export interface AnomalyAlert {
  id: string;
  loteId: string;
  loteNombre: string;
  cultivo: string;
  fechaSiembra: string;
  diasCiclo: number;
  etapaActiva: string;
  isCriticalStage: boolean;
  criticalDesc: string;
  maxNdvi: number;
  currentNdvi: number;
  magnitudCaida: number;
  rachaDescendente: number[];
  rachaFechas: string[];
  severity: "high" | "mid" | "none";
}

// --- MÉTODOS DE ACCESO A LOCALSTORAGE ---

export const getSavedLotes = (): Lote[] => {
  try {
    const saved = localStorage.getItem("lotesDynamicData");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading dynamic lotes:", e);
  }
  // Inicialización si no existe o es inválido
  localStorage.setItem("lotesDynamicData", JSON.stringify(defaultLotes));
  return defaultLotes;
};

export const saveLotes = (lotesList: Lote[]) => {
  try {
    localStorage.setItem("lotesDynamicData", JSON.stringify(lotesList));
  } catch (e) {
    console.error("Error saving dynamic lotes:", e);
  }
};

export const getSavedSowingDates = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem("sowingDates");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading sowing dates:", e);
  }
  localStorage.setItem("sowingDates", JSON.stringify(DEFAULT_SOWING_DATES));
  return DEFAULT_SOWING_DATES;
};

export const saveSowingDates = (dates: Record<string, string>) => {
  try {
    localStorage.setItem("sowingDates", JSON.stringify(dates));
  } catch (e) {
    console.error("Error saving sowing dates:", e);
  }
};

// --- MODELADO Y ANÁLISIS AGRONÓMICO ---

export const getDaysSinceSowing = (sowingDateStr: string): number => {
  if (!sowingDateStr) return 0;
  const sowingDate = new Date(sowingDateStr + "T12:00:00");
  if (isNaN(sowingDate.getTime())) return 0;
  const today = new Date("2026-05-12T12:00:00"); // Fecha contextual "hoy" simulada (12 de Mayo de 2026)
  const diffTime = today.getTime() - sowingDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export interface PhenologicalDetail {
  stageName: string;
  isCritical: boolean;
  criticalDesc: string;
  stageIndex: number;
}

export const getPhenologicalStageDetails = (cropName: string, days: number): PhenologicalDetail => {
  const stages = cropPhenologyMap[cropName] || [];
  let stageIndex = 0;

  const normalized = cropName.toLowerCase();
  if (normalized.includes("soja")) {
    if (days <= 20) stageIndex = 0;
    else if (days <= 50) stageIndex = 1;
    else if (days <= 80) stageIndex = 2; // R1 - R2 (Crítico)
    else if (days <= 110) stageIndex = 3; // R3 - R5 (Crítico)
    else stageIndex = 4;
  } else if (normalized.includes("maíz") || normalized.includes("maiz")) {
    if (days <= 20) stageIndex = 0;
    else if (days <= 60) stageIndex = 1;
    else if (days <= 90) stageIndex = 2; // VT - R1 (Crítico)
    else if (days <= 120) stageIndex = 3;
    else stageIndex = 4;
  } else if (normalized.includes("trigo")) {
    if (days <= 30) stageIndex = 0;
    else if (days <= 70) stageIndex = 1;
    else if (days <= 100) stageIndex = 2; // Z40 - Z59 (Crítico)
    else if (days <= 130) stageIndex = 3;
    else stageIndex = 4;
  } else {
    if (days <= 25) stageIndex = 0;
    else if (days <= 55) stageIndex = 1;
    else if (days <= 85) stageIndex = 2; // Reproductivo
    else if (days <= 115) stageIndex = 3;
    else stageIndex = 4;
  }

  const activeStage = stages[Math.min(stageIndex, stages.length - 1)];
  const stageName = activeStage ? activeStage.etapa : "Desconocida";

  let isCritical = false;
  let criticalDesc = "";

  if (normalized.includes("soja") && (stageIndex === 2 || stageIndex === 3)) {
    isCritical = true;
    criticalDesc = "Floración y Llenado de Vainas (Fase Crítica de Rendimiento)";
  } else if ((normalized.includes("maíz") || normalized.includes("maiz")) && stageIndex === 2) {
    isCritical = true;
    criticalDesc = "Panojamiento y Floración (Fase de Máxima Sensibilidad Hídrica)";
  } else if (normalized.includes("trigo") && stageIndex === 2) {
    isCritical = true;
    criticalDesc = "Espigazón y Antesis (Determinación de Granos Potenciales)";
  } else if (stageIndex === 2) {
    isCritical = true;
    criticalDesc = "Período Crítico Reproductivo";
  }

  return {
    stageName,
    isCritical,
    criticalDesc,
    stageIndex
  };
};

export const getStandardNdviCurve = (cropName: string): number[] => {
  const normalizedCropName = cropName.toLowerCase();
  
  if (normalizedCropName.includes("soja")) {
    return [0.15, 0.15, 0.16, 0.20, 0.32, 0.48, 0.62, 0.74, 0.80, 0.82, 0.82, 0.80, 0.76, 0.68, 0.58, 0.45, 0.32, 0.20];
  } else if (normalizedCropName.includes("maíz") || normalizedCropName.includes("maiz")) {
    return [0.15, 0.15, 0.17, 0.24, 0.36, 0.50, 0.64, 0.74, 0.78, 0.80, 0.80, 0.78, 0.74, 0.66, 0.56, 0.44, 0.30, 0.18];
  } else if (normalizedCropName.includes("trigo")) {
    return [0.15, 0.15, 0.16, 0.22, 0.30, 0.42, 0.54, 0.64, 0.68, 0.70, 0.70, 0.68, 0.64, 0.58, 0.50, 0.40, 0.28, 0.18];
  } else {
    // Modelo matemático estandarizado dinámico de campana biológica para otros cultivos (18 elementos)
    const profile = [0.0, 0.0, 0.02, 0.08, 0.25, 0.49, 0.70, 0.88, 0.97, 1.0, 1.0, 0.97, 0.91, 0.79, 0.64, 0.45, 0.25, 0.08];
    const maxNdvi = 0.75;
    return profile.map(mult => {
      const val = 0.15 + mult * (maxNdvi - 0.15);
      return Number(val.toFixed(2));
    });
  }
};

export const getDynamicLoteHistory = (loteId: string, cropName: string, sowingDateStr: string): Measurement[] => {
  let staticHistory = LOTES_HISTORICAL_DATA[loteId];
  const standardCurve = getStandardNdviCurve(cropName);

  // Generador de historial dinámico para nuevos lotes sin datos estáticos
  if (!staticHistory) {
    staticHistory = Array.from({ length: 18 }, (_, index) => {
      const ndviEstandar = standardCurve[index] || 0.15;
      // Añade una leve perturbación normal para simular
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
  
  return staticHistory.map((item, index) => {
    // Escala semanal a partir de la siembra
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

// --- ALGORITMO CENTRALIZADO DE DETECCIÓN DE ANOMALÍAS ---

export const calculateActiveAlerts = (lotesList: Lote[], sowingDates: Record<string, string>): AnomalyAlert[] => {
  const alertsList: AnomalyAlert[] = [];
  
  lotesList.forEach(l => {
    const sowingDateStr = sowingDates[l.id] || "2026-03-25";
    const history = getDynamicLoteHistory(l.id, l.cultivo, sowingDateStr);
    if (history.length < 4) return;

    let consecutiveDropCount = 0;
    let peakIndex = history.length - 1;
    let foundRacha = false;

    // Escanea hacia atrás comenzando desde la última medición, pero también evalúa el pasado reciente como posibles finales de racha.
    // Analizamos las últimas 4 mediciones como finales potenciales de un descenso consecutivo.
    const maxScanEnd = history.length - 1;
    const minScanEnd = Math.max(0, history.length - 4);

    for (let scanEnd = maxScanEnd; scanEnd >= minScanEnd; scanEnd--) {
      let tempIndex = scanEnd;
      let tempDropCount = 0;

      while (tempIndex > 0 && history[tempIndex].ndvi < history[tempIndex - 1].ndvi) {
        tempDropCount++;
        tempIndex--;
      }

      // Verificamos si encontramos una racha válida de caída (mínimo 2 caídas consecutivas)
      if (tempDropCount >= 2) {
        const latest = history[history.length - 1];
        const currentDeviation = latest.ndviEstandar - latest.ndvi;

        // Si la racha termina justo en la última medición, es una caída fresca/activa.
        // Si la racha terminó un poco antes, sigue activa si la última medición no se ha recuperado (desvío actual >= 0.05).
        if (scanEnd === history.length - 1 || currentDeviation >= 0.05) {
          consecutiveDropCount = tempDropCount;
          peakIndex = tempIndex;
          foundRacha = true;
          break; // Detenerse en la racha más reciente calificada
        }
      }
    }

    const peakNdvi = history[peakIndex].ndvi;
    const currentNdvi = history[history.length - 1].ndvi;
    
    const maxDeviation = Math.max(...history.map(h => h.ndviEstandar - h.ndvi));
    const dropMagnitude = maxDeviation;

    if (foundRacha && consecutiveDropCount >= 2 && dropMagnitude >= 0.12) {
      const days = getDaysSinceSowing(sowingDateStr);
      const pheno = getPhenologicalStageDetails(l.cultivo, days);

      let severity: "high" | "mid" | "none" = "none";
      if (dropMagnitude >= 0.25) {
        severity = "high";
      } else if (dropMagnitude >= 0.12) {
        severity = "mid";
      }

      const rachaDescendente: number[] = [];
      const rachaFechas: string[] = [];
      for (let idx = peakIndex; idx < history.length; idx++) {
        rachaDescendente.push(history[idx].ndvi);
        rachaFechas.push(history[idx].fecha);
      }

      alertsList.push({
        id: `alert-ndvi-${l.id}`,
        loteId: l.id,
        loteNombre: l.nombre,
        cultivo: l.cultivo,
        fechaSiembra: sowingDateStr,
        diasCiclo: days,
        etapaActiva: pheno.stageName,
        isCriticalStage: pheno.isCritical,
        criticalDesc: pheno.criticalDesc,
        maxNdvi: peakNdvi,
        currentNdvi: currentNdvi,
        magnitudCaida: dropMagnitude,
        rachaDescendente,
        rachaFechas,
        severity
      });
    }
  });

  return alertsList;
};

// --- REGISTRO Y ADICIÓN DINÁMICA DE LOTES ---

const polygonAround = (lat: number, lng: number, size = 0.04): [number, number][] => [
  [lat + size, lng - size],
  [lat + size, lng + size],
  [lat - size, lng + size * 0.7],
  [lat - size * 0.8, lng - size * 1.1],
];

export const addDynamicLote = (
  nombre: string,
  cultivo: "Soja" | "Maíz" | "Trigo" | "Otro",
  sowingDate: string,
  superficie: number
): Lote => {
  const currentLotes = getSavedLotes();
  
  // Generar un ID único basado en el largo + 1
  const idStr = String(currentLotes.length + 1);
  
  // Coordenadas geográficas realistas (relativamente cercanas a los campos existentes de la región pampeana)
  const offsetLat = (Math.random() - 0.5) * 0.6;
  const offsetLng = (Math.random() - 0.5) * 0.6;
  const baseLat = -34.8 + offsetLat;
  const baseLng = -60.5 + offsetLng;
  const center: [number, number] = [baseLat, baseLng];
  const polygon = polygonAround(baseLat, baseLng, 0.035);

  const mappedCultivo = cultivo === "Otro" ? "Soja" : cultivo; // Mapea a un cultivo soportado por default

  const newLote: Lote = {
    id: idStr,
    nombre,
    cultivo: mappedCultivo as "Soja" | "Maíz" | "Trigo",
    etapa: "Fase Vegetativa",
    superficie,
    ndvi: 0.75, // Vigor inicial por defecto
    severity: "none",
    center,
    polygon
  };

  // Guardar el lote
  const updatedLotes = [...currentLotes, newLote];
  saveLotes(updatedLotes);

  // Guardar la fecha de siembra
  const currentDates = getSavedSowingDates();
  currentDates[idStr] = sowingDate;
  saveSowingDates(currentDates);

  // Disparar evento para re-renderizado síncrono en todos los componentes
  window.dispatchEvent(new Event("lotesUpdated"));

  return newLote;
};
