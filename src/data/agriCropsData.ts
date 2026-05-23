export type CropCategory = "Extensivo" | "Forraje";
export type ArgentineProvince = "Buenos Aires" | "Santa Fe" | "La Pampa" | "Córdoba" | "Entre Ríos";

export interface CropData {
  id: string;
  nombre: string;
  categoria: CropCategory;
  provincias: ArgentineProvince[];
  siembra: string;
  cosecha: string;
  ndviOptimo: string;
  descripcion: string;
  activo: boolean;
}

export const agriCropsList: CropData[] = [
  {
    id: "c1",
    nombre: "Soja",
    categoria: "Extensivo",
    provincias: ["Buenos Aires", "Santa Fe", "Córdoba", "La Pampa", "Entre Ríos"],
    siembra: "• Buenos Aires:\n  - Temprana (1ª): Noviembre (1 - 25 Nov)\n  - Tardía (2ª): Diciembre (5 - 30 Dic)\n• Santa Fe (Zona Núcleo):\n  - Temprana (1ª): fines de Octubre - Noviembre (20 Oct - 15 Nov)\n  - Tardía (2ª): Diciembre - Enero (1 - 20 Dic)\n• Córdoba:\n  - Temprana (1ª): fines de Octubre - Noviembre (todo Noviembre)\n  - Tardía (2ª): Diciembre - Enero (10 Dic - 5 Ene)\n• Entre Ríos:\n  - Temprana (1ª): mediados de Octubre - Noviembre (25 Oct - 20 Nov)\n  - Tardía (2ª): Diciembre - Enero (5 - 25 Dic)\n• La Pampa:\n  - Temprana (1ª): Noviembre (5 - 30 Nov)\n  - Tardía (2ª): Diciembre (1 - 20 Dic)",
    cosecha: "Marzo - Mayo",
    ndviOptimo: "0.65 - 0.85",
    descripcion: "Principal cultivo de exportación de Argentina, adaptado a la zona núcleo. Altamente demandante en época reproductiva.",
    activo: true
  },
  {
    id: "c2",
    nombre: "Maíz",
    categoria: "Extensivo",
    provincias: ["Buenos Aires", "Santa Fe", "Córdoba", "La Pampa", "Entre Ríos"],
    siembra: "• Temprana:\n  Septiembre - Octubre (óptimo 15 Sep - 25 Oct)\n• Tardía:\n  Noviembre - Diciembre (óptimo 20 Nov - 15 Dic)",
    cosecha: "Marzo - Abril / Julio - Agosto",
    ndviOptimo: "0.70 - 0.90",
    descripcion: "Cereal fundamental para la rotación y provisión de rastrojos, clave en la ganadería y la industria del bioetanol en Córdoba y Santa Fe.",
    activo: true
  },
  {
    id: "c3",
    nombre: "Trigo",
    categoria: "Extensivo",
    provincias: ["Buenos Aires", "Santa Fe", "Córdoba", "La Pampa", "Entre Ríos"],
    siembra: "• Temprana (Ciclos largos):\n  Mayo - Junio (óptimo 15 May - 15 Jun)\n• Tardía (Ciclos cortos):\n  Julio - Agosto (óptimo 20 Jun - 25 Jul)",
    cosecha: "Noviembre - Diciembre",
    ndviOptimo: "0.55 - 0.75",
    descripcion: "Cultivo invernal clave. Muy sensible a heladas tardías en floración y a deficiencias hídricas en encañazón.",
    activo: true
  },
  {
    id: "c4",
    nombre: "Alfalfa",
    categoria: "Forraje",
    provincias: ["Buenos Aires", "Santa Fe", "Córdoba", "La Pampa", "Entre Ríos"],
    siembra: "• Temprana (Otoño):\n  Marzo - Abril (máximo arraigo)\n• Tardía (Primavera):\n  Septiembre - Octubre (alternativa)",
    cosecha: "Múltiples cortes (Primavera - Otoño)",
    ndviOptimo: "0.60 - 0.80",
    descripcion: "La reina de las forrajeras. Base de las pasturas plurianuales para producción de carne y leche en toda la región pampeana.",
    activo: true
  },
  {
    id: "c5",
    nombre: "Maní",
    categoria: "Extensivo",
    provincias: ["Córdoba"],
    siembra: "• Temprana:\n  Octubre (óptimo 15 - 30 Oct)\n• Tardía:\n  Noviembre - Diciembre",
    cosecha: "Abril - Mayo",
    ndviOptimo: "0.60 - 0.80",
    descripcion: "Cultivo regional de alto valor de exportación, concentrado casi en su totalidad en la provincia de Córdoba.",
    activo: true
  },
  {
    id: "c6",
    nombre: "Girasol",
    categoria: "Extensivo",
    provincias: ["Buenos Aires", "La Pampa", "Santa Fe", "Córdoba"],
    siembra: "• Temprana:\n  Septiembre - Octubre (óptimo fines de Sep)\n• Tardía:\n  Noviembre - Diciembre",
    cosecha: "Febrero - Marzo",
    ndviOptimo: "0.55 - 0.75",
    descripcion: "Oleaginosa con gran tolerancia a condiciones de sequía moderada, con fuerte presencia en el oeste bonaerense y La Pampa.",
    activo: true
  },
  {
    id: "c7",
    nombre: "Cebada Cervecera",
    categoria: "Extensivo",
    provincias: ["Buenos Aires", "La Pampa"],
    siembra: "• Temprana (Ciclos largos):\n  Mayo - Junio\n• Tardía (Ciclos cortos):\n  Julio",
    cosecha: "Noviembre - Diciembre",
    ndviOptimo: "0.58 - 0.76",
    descripcion: "Alternativa invernal al trigo, cosechada tempranamente para liberar el lote para soja de segunda en el sur bonaerense.",
    activo: true
  },
  {
    id: "c8",
    nombre: "Lino",
    categoria: "Extensivo",
    provincias: ["Entre Ríos"],
    siembra: "• Temprana:\n  Mayo - Junio\n• Tardía:\n  Julio",
    cosecha: "Noviembre - Diciembre",
    ndviOptimo: "0.50 - 0.70",
    descripcion: "Oleaginosa tradicional de la provincia de Entre Ríos, apreciada por su fibra y aceite industrial.",
    activo: true
  },
  {
    id: "c9",
    nombre: "Sorgo Granífero",
    categoria: "Extensivo",
    provincias: ["Santa Fe", "Córdoba", "Entre Ríos", "La Pampa"],
    siembra: "• Temprana:\n  Octubre - Noviembre (suelo > 18°C)\n• Tardía:\n  Diciembre - Enero",
    cosecha: "Abril - Mayo",
    ndviOptimo: "0.55 - 0.78",
    descripcion: "Excelente tolerancia a estrés hídrico y térmico. Clave para suelos marginales y silaje ganadero.",
    activo: true
  },
  {
    id: "c10",
    nombre: "Festuca",
    categoria: "Forraje",
    provincias: ["Buenos Aires", "Santa Fe", "Entre Ríos"],
    siembra: "• Temprana (Otoño):\n  Marzo - Abril\n• Tardía (Primavera):\n  Septiembre - Octubre",
    cosecha: "Otoño - Primavera (Pastoreo directo)",
    ndviOptimo: "0.55 - 0.75",
    descripcion: "Gramínea perenne de gran rusticidad y producción de biomasa, base de la ganadería vacuna bonaerense.",
    activo: true
  },
  {
    id: "c11",
    nombre: "Raygrass Anual",
    categoria: "Forraje",
    provincias: ["Buenos Aires", "Entre Ríos", "Santa Fe"],
    siembra: "• Temprana:\n  Febrero - Marzo\n• Tardía:\n  Abril - Mayo",
    cosecha: "Invierno - Primavera",
    ndviOptimo: "0.60 - 0.82",
    descripcion: "Verdeo de invierno de rápido establecimiento y alta calidad nutricional para baches forrajeros.",
    activo: true
  },
  {
    id: "c12",
    nombre: "Pasto Llorón",
    categoria: "Forraje",
    provincias: ["La Pampa", "Córdoba"],
    siembra: "• Temprana (Primavera):\n  Octubre - Noviembre\n• Tardía (Verano):\n  Diciembre - Enero",
    cosecha: "Primavera - Verano",
    ndviOptimo: "0.40 - 0.65",
    descripcion: "Gramínea mega térmica ideal para los suelos arenosos y climas semiáridos del oeste pampeano.",
    activo: true
  },
  {
    id: "c13",
    nombre: "Avena Forrajera",
    categoria: "Forraje",
    provincias: ["Buenos Aires", "La Pampa", "Santa Fe", "Córdoba", "Entre Ríos"],
    siembra: "• Temprana:\n  Febrero - Marzo\n• Tardía:\n  Abril - Mayo",
    cosecha: "Invierno (Pastoreo)",
    ndviOptimo: "0.55 - 0.78",
    descripcion: "El verdeo de invierno más difundido, proporcionando forraje tierno y digestible durante los meses más fríos.",
    activo: true
  },
  {
    id: "c14",
    nombre: "Centeno Forrajero",
    categoria: "Forraje",
    provincias: ["La Pampa", "Córdoba", "Buenos Aires"],
    siembra: "• Temprana:\n  Febrero - Marzo\n• Tardía:\n  Abril - Mayo",
    cosecha: "Invierno (Pastoreo)",
    ndviOptimo: "0.48 - 0.70",
    descripcion: "Gramínea invernal hiper-rústica, con excelente comportamiento ante el viento y el frío extremo.",
    activo: true
  },
  {
    id: "c15",
    nombre: "Lotus Corniculatus",
    categoria: "Forraje",
    provincias: ["Entre Ríos", "Buenos Aires"],
    siembra: "• Temprana (Otoño):\n  Marzo - Abril\n• Tardía (Primavera):\n  Septiembre - Octubre",
    cosecha: "Primavera - Verano",
    ndviOptimo: "0.50 - 0.75",
    descripcion: "Leguminosa forrajera ideal para suelos arcillosos o con problemas de drenaje en Entre Ríos y Cuenca del Salado.",
    activo: true
  }
];

export interface PhenologyStage {
  etapa: string;
  ndviRango: string;
  descripcion: string;
}

export const cropPhenologyMap: Record<string, PhenologyStage[]> = {
  "Soja": [
    { etapa: "VE - VC (Emergencia y Cotiledones)", ndviRango: "0.15 - 0.22", descripcion: "Plántulas emergiendo, gran parte del suelo se encuentra descubierto." },
    { etapa: "V1 - V5 (Desarrollo Vegetativo Inicial)", ndviRango: "0.25 - 0.45", descripcion: "Rápido crecimiento y expansión de hojas trifoliadas, nódulos activos fijando nitrógeno." },
    { etapa: "R1 - R2 (Floración Temprana a Plena)", ndviRango: "0.55 - 0.70", descripcion: "Aparición de primeras flores en tallo principal. Período crítico de demanda hídrica." },
    { etapa: "R3 - R5 (Desarrollo de Vainas y Llenado de Granos)", ndviRango: "0.75 - 0.85", descripcion: "Máxima intercepción lumínica y actividad fotosintética. Máximo NDVI foliar." },
    { etapa: "R6 - R8 (Madurez Fisiológica y Senescencia)", ndviRango: "0.20 - 0.40", descripcion: "Defoliación progresiva y maduración de vainas. El NDVI desciende fuertemente previo a la trilla." }
  ],
  "Maíz": [
    { etapa: "VE - V3 (Emergencia a 3 Hojas Ligadas)", ndviRango: "0.15 - 0.25", descripcion: "Plántulas emergiendo lentamente, establecimiento inicial del sistema radicular primario." },
    { etapa: "V4 - V12 (Crecimiento Vegetativo Rápido)", ndviRango: "0.30 - 0.60", descripcion: "Rápida elongación del tallo y definición de hileras potenciales por espiga." },
    { etapa: "VT - R1 (Panojamiento a Floración/Fecundación)", ndviRango: "0.75 - 0.90", descripcion: "Emergencia de panoja y estigmas. Período de máxima sensibilidad a estrés térmico e hídrico." },
    { etapa: "R2 - R5 (Llenado de Granos / Estado Dentado)", ndviRango: "0.65 - 0.80", descripcion: "Translocación masiva de carbohidratos desde el tallo y hojas hacia el grano." },
    { etapa: "R6 (Madurez Fisiológica y Secado)", ndviRango: "0.20 - 0.35", descripcion: "Formación de la capa negra en la base del grano. Senescencia total de la planta." }
  ],
  "Trigo": [
    { etapa: "Z10 - Z29 (Emergencia y Macollaje)", ndviRango: "0.15 - 0.30", descripcion: "Establecimiento inicial y emisión de tallos secundarios (macollos) desde la corona." },
    { etapa: "Z30 - Z39 (Encañazón y Elongación)", ndviRango: "0.35 - 0.60", descripcion: "Crecimiento vertical rápido, elevación del ápice de crecimiento sobre el nivel del suelo." },
    { etapa: "Z40 - Z59 (Espigazón y Antesis)", ndviRango: "0.65 - 0.78", descripcion: "Salida de la espiga e inicio de floración. Se define la cantidad de granos potenciales." },
    { etapa: "Z70 - Z89 (Llenado de Granos)", ndviRango: "0.50 - 0.70", descripcion: "Granos en estado lechoso y pastoso. Redistribución de reservas foliares." },
    { etapa: "Z90 (Madurez Fisiológica y Cosecha)", ndviRango: "0.15 - 0.25", descripcion: "Pérdida completa de humedad, plantas completamente pajizas listas para trilla." }
  ],
  "Alfalfa": [
    { etapa: "Post-Corte / Rebrote Inicial", ndviRango: "0.25 - 0.38", descripcion: "Hojas nuevas brotando de las yemas de la corona tras el corte o pastoreo." },
    { etapa: "Crecimiento Vegetativo Activo", ndviRango: "0.45 - 0.65", descripcion: "Expansión rápida del dosel con alta tasa de acumulación de materia seca." },
    { etapa: "Botón Floral (Pre-floración)", ndviRango: "0.70 - 0.78", descripcion: "Punto de equilibrio óptimo entre calidad nutricional (proteína) y volumen de forraje." },
    { etapa: "Floración Plena (10% - 50% Flor)", ndviRango: "0.75 - 0.82", descripcion: "Máximo volumen de materia seca acumulada, aunque disminuye la digestibilidad." },
    { etapa: "Dormición Invernal", ndviRango: "0.30 - 0.45", descripcion: "Reducción de crecimiento por fotoperíodo corto y bajas temperaturas, acumulación de reservas." }
  ],
  "Maní": [
    { etapa: "Emergencia y Crecimiento Inicial", ndviRango: "0.18 - 0.28", descripcion: "Aparición de hojas tetrafoliadas y desarrollo de la raíz pivotante profunda." },
    { etapa: "Floración y Clavado (Pegging)", ndviRango: "0.40 - 0.60", descripcion: "Polinización y elongación de clavos (ginóforos) que buscan enterrarse en el suelo." },
    { etapa: "Llenado de Vainas Subterráneas", ndviRango: "0.70 - 0.80", descripcion: "Máximo dosel foliar fotosintéticamente activo que sustenta la maduración de frutos subterráneos." },
    { etapa: "Madurez y Descalzado (Arrancado)", ndviRango: "0.30 - 0.45", descripcion: "Las plantas son arrancadas e invertidas para secado natural del fruto al sol." }
  ],
  "Girasol": [
    { etapa: "VE - V8 (Emergencia a Desarrollo Vegetativo)", ndviRango: "0.20 - 0.35", descripcion: "Establecimiento inicial de la plántula y emisión de hojas opuestas cordiformes." },
    { etapa: "R1 - R4 (Botón Floral a Pre-floración)", ndviRango: "0.40 - 0.65", descripcion: "Aparición de la inflorescencia en el ápice, heliotropismo activo orientado al este." },
    { etapa: "R5 (Floración Plena)", ndviRango: "0.68 - 0.78", descripcion: "Apertura secuencial de flores desde la periferia al centro del capítulo, polinización por insectos." },
    { etapa: "R6 - R8 (Llenado de Aquenios)", ndviRango: "0.50 - 0.65", descripcion: "Maduración y endurecimiento del fruto (semilla), capítulo de coloración amarillo-marrón." },
    { etapa: "R9 (Madurez Fisiológica y Secado)", ndviRango: "0.18 - 0.30", descripcion: "Capítulo y brácteas totalmente marrones. Pérdida de humedad lista para trilla." }
  ],
  "Cebada Cervecera": [
    { etapa: "Emergencia y Macollaje Inicial", ndviRango: "0.15 - 0.25", descripcion: "Germinación y desarrollo de primeras hojas basales." },
    { etapa: "Macollaje Activo e Inicio de Caña", ndviRango: "0.30 - 0.50", descripcion: "Emisión de macollos vigorosos que definirán la densidad de espigas por metro cuadrado." },
    { etapa: "Encañazón a Espigazón", ndviRango: "0.55 - 0.75", descripcion: "Desarrollo rápido de nudos y salida de la espiga de la hoja bandera." },
    { etapa: "Llenado de Granos y Maduración", ndviRango: "0.40 - 0.60", descripcion: "Redistribución de almidones para calidad maltera de la semilla." },
    { etapa: "Madurez de Cosecha", ndviRango: "0.15 - 0.25", descripcion: "Secado completo de la planta dorada, listo para cosecha anticipada al trigo." }
  ],
  "Lino": [
    { etapa: "Emergencia y Establecimiento", ndviRango: "0.15 - 0.25", descripcion: "Plántulas pequeñas de hojas lineales y raíz de rápido anclaje basal." },
    { etapa: "Crecimiento del Tallo y Ramificación", ndviRango: "0.30 - 0.50", descripcion: "Crecimiento en altura, acumulación de celulosa y fibras finas en tallos." },
    { etapa: "Floración Plena", ndviRango: "0.55 - 0.70", descripcion: "Espectáculo visual con apertura masiva de flores celestes o blancas durante las mañanas." },
    { etapa: "Maduración de Cápsulas", ndviRango: "0.35 - 0.50", descripcion: "Formación de cápsulas esféricas que albergan las semillas oleaginosas." }
  ],
  "Sorgo Granífero": [
    { etapa: "Emergencia e Implantación", ndviRango: "0.15 - 0.28", descripcion: "Establecimiento inicial que requiere temperaturas de suelo superiores a 18°C." },
    { etapa: "Crecimiento Vegetativo Rápido", ndviRango: "0.35 - 0.60", descripcion: "Excelente desarrollo foliar con gran tolerancia a deficiencias hídricas." },
    { etapa: "Panojamiento y Floración", ndviRango: "0.65 - 0.78", descripcion: "Exposición completa de la panoja y antesis, polinización activa." },
    { etapa: "Llenado de Granos y Madurez", ndviRango: "0.45 - 0.65", descripcion: "Grano lechoso, pastoso y finalmente duro. Senescencia de hojas inferiores." }
  ],
  "Festuca": [
    { etapa: "Implantación en Otoño", ndviRango: "0.20 - 0.35", descripcion: "Lento crecimiento inicial en otoño, establecimiento de corona profunda." },
    { etapa: "Macollaje y Tapizado", ndviRango: "0.40 - 0.60", descripcion: "Gran ramificación basal que forma un césped denso y resistente a pisoteos." },
    { etapa: "Rebrote Primaveral Activo", ndviRango: "0.65 - 0.78", descripcion: "Expansión foliar rápida estimulada por fotoperíodo largo y fertilización." },
    { etapa: "Cierre de Canopia (Máxima Oferta)", ndviRango: "0.70 - 0.80", descripcion: "Máximo volumen de forraje verde disponible para pastoreo o silaje." }
  ],
  "Raygrass Anual": [
    { etapa: "Emergencia Rápida e Implantación", ndviRango: "0.18 - 0.32", descripcion: "Germinación veloz en otoño, muy competitivo frente a malezas." },
    { etapa: "Macollaje e Inicio de Pastoreo", ndviRango: "0.45 - 0.65", descripcion: "Forraje tierno con altísima digestibilidad y aporte proteico de invierno." },
    { etapa: "Producción de Biomasa de Primavera", ndviRango: "0.70 - 0.82", descripcion: "Pico de crecimiento vegetativo explosivo previo a la transición reproductiva." },
    { etapa: "Floración y Semillazón (Fin de Ciclo)", ndviRango: "0.50 - 0.68", descripcion: "Emisión de cañas florales. Fuerte decaimiento en la calidad forrajera por fibra." }
  ],
  "Pasto Llorón": [
    { etapa: "Dormición Invernal (Latencia)", ndviRango: "0.18 - 0.25", descripcion: "Follaje seco pajizo provocado por heladas. Actividad fotosintética nula." },
    { etapa: "Rebrote Primaveral", ndviRango: "0.30 - 0.45", descripcion: "Brote de hojas tiernas verdes en la corona con las primeras temperaturas templadas." },
    { etapa: "Crecimiento Estival Activo", ndviRango: "0.50 - 0.65", descripcion: "Producción abundante de biomasa adaptada a climas semiáridos y suelos arenosos." },
    { etapa: "Espigazón y Panojas Estivales", ndviRango: "0.40 - 0.55", descripcion: "Desarrollo de cañas reproductivas que endurecen el forraje disminuyendo palatabilidad." }
  ],
  "Avena Forrajera": [
    { etapa: "Emergencia y Crecimiento Inicial", ndviRango: "0.15 - 0.28", descripcion: "Plántulas vigorosas de hojas anchas que cubren rápido el entresurco." },
    { etapa: "Macollaje Intenso (Apto Pastoreo)", ndviRango: "0.40 - 0.62", descripcion: "Estado ideal para el ingreso de animales (bache forrajero invernal)." },
    { etapa: "Rebrote Pos-Pastoreo", ndviRango: "0.65 - 0.78", descripcion: "Recuperación de biomasa foliar impulsada por reservas en caña y nitrógeno." },
    { etapa: "Encañazón y Pérdida de Calidad", ndviRango: "0.50 - 0.68", descripcion: "Elongación reproductiva que eleva la fibra y reduce la proteína digestible." }
  ],
  "Centeno Forrajero": [
    { etapa: "Implantación Invernal Rústica", ndviRango: "0.15 - 0.28", descripcion: "Crecimiento superior a avena ante fríos extremos y suelos marginales." },
    { etapa: "Macollaje e Invierno Activo", ndviRango: "0.38 - 0.58", descripcion: "Excelente anclaje y cobertura foliar invernal como cultivo de servicio." },
    { etapa: "Elongación de Caña Primaveral", ndviRango: "0.48 - 0.70", descripcion: "Rápido crecimiento vertical que aporta alto volumen de rastrojo y celulosa." },
    { etapa: "Senescencia o Terminado de Ciclo", ndviRango: "0.20 - 0.35", descripcion: "Secado químico o pastoreo total previo a la siembra del cultivo de verano." }
  ],
  "Lotus Corniculatus": [
    { etapa: "Emergencia y Establecimiento", ndviRango: "0.15 - 0.25", descripcion: "Desarrollo inicial de raíces y ramificaciones basales lentas." },
    { etapa: "Ramificación y Cobertura Rastrera", ndviRango: "0.35 - 0.55", descripcion: "Tallos extendiéndose en superficie cubriendo suelos arcillosos o inundables." },
    { etapa: "Floración Plena (Campo Amarillo)", ndviRango: "0.65 - 0.75", descripcion: "Apertura masiva de inflorescencias amarillas conspicuas, excelente calidad forrajera." },
    { etapa: "Fructificación y Resiembra Natural", ndviRango: "0.45 - 0.60", descripcion: "Formación de vainas características que promueven la persistencia de la pastura." }
  ]
};

export async function fetchLiveCropsAPI(): Promise<{ success: boolean; data: any; source: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(
      "https://datos.gob.ar/api/3/action/package_search?q=estimaciones+agricolas",
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API response status: ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.result || json,
      source: "API Oficial datos.gob.ar"
    };
  } catch (error) {
    console.warn("Error al conectar con la API de Datos Abiertos:", error);
    return {
      success: false,
      data: null,
      source: "Base de Datos Local (Failsafe)"
    };
  }
}
