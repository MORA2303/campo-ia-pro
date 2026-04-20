export type Severity = "none" | "low" | "mid" | "high";

export interface Lote {
  id: string;
  nombre: string;
  cultivo: "Soja" | "Maíz" | "Trigo";
  etapa: string;
  superficie: number;
  ndvi: number;
  severity: Severity;
  center: [number, number];
  polygon: [number, number][];
}

export interface Alerta {
  id: string;
  loteId: string;
  loteNombre: string;
  tipo: string;
  descripcion: string;
  severity: Severity;
  fecha: string;
  estado: "Activa" | "Resuelta";
}

export const usuario = {
  nombre: "Juan Pérez",
  email: "juan.perez@ejemplo.com",
  whatsapp: "+54 9 11 5555-1234",
  iniciales: "JP",
};

const polygonAround = (lat: number, lng: number, size = 0.04): [number, number][] => [
  [lat + size, lng - size],
  [lat + size, lng + size],
  [lat - size, lng + size * 0.7],
  [lat - size * 0.8, lng - size * 1.1],
];

export const lotes: Lote[] = [
  {
    id: "1",
    nombre: "La Esperanza",
    cultivo: "Soja",
    etapa: "Floración R2",
    superficie: 320,
    ndvi: 0.42,
    severity: "high",
    center: [-34.6, -60.5],
    polygon: polygonAround(-34.6, -60.5, 0.05),
  },
  {
    id: "2",
    nombre: "El Trébol",
    cultivo: "Maíz",
    etapa: "V8",
    superficie: 180,
    ndvi: 0.61,
    severity: "mid",
    center: [-34.8, -60.2],
    polygon: polygonAround(-34.8, -60.2, 0.035),
  },
  {
    id: "3",
    nombre: "San Jorge",
    cultivo: "Trigo",
    etapa: "Encañazón",
    superficie: 95,
    ndvi: 0.55,
    severity: "low",
    center: [-35.0, -60.8],
    polygon: polygonAround(-35.0, -60.8, 0.025),
  },
  {
    id: "4",
    nombre: "Don Ángel",
    cultivo: "Soja",
    etapa: "V6",
    superficie: 410,
    ndvi: 0.74,
    severity: "none",
    center: [-34.4, -61.0],
    polygon: polygonAround(-34.4, -61.0, 0.06),
  },
  {
    id: "5",
    nombre: "La Paloma",
    cultivo: "Maíz",
    etapa: "V12",
    superficie: 230,
    ndvi: 0.79,
    severity: "none",
    center: [-35.2, -60.4],
    polygon: polygonAround(-35.2, -60.4, 0.04),
  },
];

export const alertas: Alerta[] = [
  { id: "a1", loteId: "1", loteNombre: "La Esperanza", tipo: "Caída de NDVI", descripcion: "Caída severa de vigor en sector norte durante floración.", severity: "high", fecha: "hace 2 horas", estado: "Activa" },
  { id: "a2", loteId: "2", loteNombre: "El Trébol", tipo: "Estrés hídrico", descripcion: "NDWI por debajo del umbral en zona central del lote.", severity: "mid", fecha: "hace 1 día", estado: "Activa" },
  { id: "a3", loteId: "3", loteNombre: "San Jorge", tipo: "Caída de NDVI", descripcion: "Leve descenso de vigor respecto a la media histórica.", severity: "low", fecha: "hace 2 días", estado: "Activa" },
  { id: "a4", loteId: "1", loteNombre: "La Esperanza", tipo: "Estrés hídrico", descripcion: "Anegamiento parcial detectado tras lluvias intensas.", severity: "mid", fecha: "hace 5 días", estado: "Resuelta" },
  { id: "a5", loteId: "4", loteNombre: "Don Ángel", tipo: "Caída de NDVI", descripcion: "Variación leve recuperada en pasada siguiente.", severity: "low", fecha: "hace 8 días", estado: "Resuelta" },
  { id: "a6", loteId: "2", loteNombre: "El Trébol", tipo: "Caída de NDVI", descripcion: "Pequeña caída puntual en borde sur.", severity: "low", fecha: "hace 12 días", estado: "Resuelta" },
  { id: "a7", loteId: "5", loteNombre: "La Paloma", tipo: "Estrés hídrico", descripcion: "Descenso leve de NDWI durante ola de calor.", severity: "low", fecha: "hace 15 días", estado: "Resuelta" },
  { id: "a8", loteId: "3", loteNombre: "San Jorge", tipo: "Caída de NDVI", descripcion: "Anomalía moderada por helada tardía.", severity: "mid", fecha: "hace 20 días", estado: "Resuelta" },
];

// Serie NDVI 90 días: sube → pico → cae últimos 10 días
export const ndviSerie = (() => {
  const days = 90;
  const out: { dia: string; ndvi: number; media: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const x = days - 1 - i;
    let ndvi: number;
    if (x < 60) {
      ndvi = 0.3 + (x / 60) * 0.5 + Math.sin(x / 5) * 0.02;
    } else if (x < 80) {
      ndvi = 0.78 + Math.sin(x / 4) * 0.015;
    } else {
      const dropPct = (x - 80) / 10;
      ndvi = 0.78 - dropPct * 0.36 + Math.sin(x / 3) * 0.01;
    }
    const media = 0.35 + (Math.min(x, 70) / 70) * 0.4;
    out.push({
      dia: d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
      ndvi: Number(ndvi.toFixed(3)),
      media: Number(media.toFixed(3)),
    });
  }
  return out;
})();

export const severityLabel: Record<Severity, string> = {
  none: "Sin anomalía",
  low: "Alerta leve",
  mid: "Alerta moderada",
  high: "Alerta severa",
};

export const severityColor: Record<Severity, string> = {
  none: "hsl(147, 39%, 52%)",
  low: "hsl(44, 93%, 64%)",
  mid: "hsl(14, 87%, 67%)",
  high: "hsl(358, 70%, 50%)",
};
