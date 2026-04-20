
# CampoRemoto IA — Prototipo funcional

Plataforma web de inteligencia agrícola proactiva para productores agropecuarios argentinos. Prototipo con datos ficticios, navegación completa y diseño profesional inspirado en Vercel/Linear con paleta verde de campo.

## Sistema de diseño

- **Paleta HSL** en `index.css`: verde oscuro primario `#1B4332`, verde acento `#52B788`, fondos blanco/gris claro, semáforo de severidad (amarillo/naranja/rojo + verde "sin anomalía").
- **Tipografía Inter** vía Google Fonts.
- **Tokens semánticos** para severidad: `--severity-none`, `--severity-low`, `--severity-mid`, `--severity-high` para uso consistente en badges, mapas y gráficos.
- Estilo flat, bordes suaves, sin gradientes fuertes, sombras sutiles tipo dashboard.

## Layout base

- **Sidebar fija a la izquierda** (shadcn `Sidebar`, `collapsible="icon"`):
  - Logo: ícono SVG de hoja con señal satelital + "CampoRemoto IA"
  - Navegación: Dashboard · Mis Lotes · Alertas · Configuración (con `NavLink` + estado activo)
  - Footer: avatar de Juan Pérez + botón cerrar sesión
- **Header** con `SidebarTrigger` siempre visible (responsive, hamburger en mobile).
- App arranca directo en `/dashboard` (sin login). Ruta `/` redirige a `/dashboard`.

## Páginas

### `/dashboard`
- Saludo "Buen día, Juan 🌱" + fecha actual.
- 4 KPI cards: Total lotes (8), Alertas activas (3), Sin anomalías (5), Última imagen ("hace 2 días").
- **Mapa interactivo** (react-leaflet + OpenStreetMap) centrado en Bs. As. con 5 polígonos coloreados según severidad, popup con nombre/cultivo/estado + botón "Ver detalle" que navega a `/lotes/:id`.
- **Tabla de alertas recientes** (5 últimas) con badges de severidad + botón "Ver todas las alertas" → `/alertas`.

### `/lotes`
- Header + botón "＋ Agregar lote" (abre modal).
- Grilla responsive (3/1 col) de cards con: nombre, cultivo · etapa, ha, NDVI con barra de progreso coloreada, badge de estado, "Ver detalle".
- 5 lotes con los datos exactos especificados.

### `/lotes/:id` (mostrando "La Esperanza")
- Encabezado con metadata + badge rojo "Alerta severa activa".
- **Mapa del lote** con selector de capa (Tabs: NDVI · NDWI · Ambientes). En "Ambientes" el polígono se subdivide en 4 zonas coloreadas con leyenda.
- **Gráfico temporal NDVI** (Recharts, 90 días): línea NDVI diario (curva sube → pico → caída últimos 10 días), línea punteada media histórica, área sombreada roja donde NDVI < media.
- **Card de alerta activa** con ícono, texto explicativo, recomendación, badge "Enviado por WhatsApp · hace 2 horas", botón "Marcar como revisada".
- Tabla con historial de 4 alertas del lote.

### `/alertas`
- Filtros: Todas · Activas · Resueltas + dropdown por lote.
- **Timeline vertical** con 8 alertas ficticias (ícono color severidad, lote, descripción, fecha, badge estado).
- Paginación simple al pie.

### `/configuracion`
- 3 Tabs: **Notificaciones · Umbrales (default) · Mis lotes**.
- Notificaciones: input WhatsApp +54, toggles alertas y resumen semanal, dropdowns día/hora, guardar.
- Umbrales: dropdown lote + cultivo, tabla editable NDVI/NDWI con inputs numéricos (leve/moderado/severo), botones restaurar y guardar.
- Mis lotes: lista compacta de los 5 lotes con accesos rápidos.

### Modal "Agregar lote"
- Dialog con 2 tabs: **Subir archivo** (drag & drop .shp/.zip/.kml) y **Dibujar en mapa** (mapa con instrucción de trazado — placeholder visual del polígono).
- Campos comunes debajo: nombre, cultivo, fecha de siembra + checkbox "inferir automáticamente", superficie (ha), botón "Guardar lote".

## Navegación y datos

- Rutas registradas en `App.tsx`; "Ver detalle" siempre navega a `/lotes/1`.
- Toda la data (lotes, alertas, series NDVI, usuario) en un módulo `src/data/mock.ts` para consistencia entre páginas.
- Coordenadas reales de los 5 lotes en Bs. As. para el mapa.

## Stack técnico

- **react-router-dom** (ya instalado) para rutas.
- **react-leaflet + leaflet** para mapas con polígonos.
- **recharts** para el gráfico temporal de NDVI.
- **shadcn/ui**: Sidebar, Card, Table, Tabs, Dialog, Badge, Button, Input, Select, Switch, Toast.
- **lucide-react** para íconos (Leaf, Satellite, AlertTriangle, MapPin, etc.).

El resultado es un prototipo navegable de 5 pantallas + modal, con datos ficticios coherentes y visual de producto profesional listo para demo.
