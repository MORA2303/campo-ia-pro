import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import { Lote, severityColor, severityLabel } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MapaLotesProps {
  lotes: Lote[];
  height?: string;
}

export function MapaLotes({ lotes, height = "420px" }: MapaLotesProps) {
  const navigate = useNavigate();
  const center: [number, number] = [-34.75, -60.55];

  return (
    <div className="overflow-hidden rounded-lg border" style={{ height }}>
      <MapContainer center={center} zoom={9} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lotes.map((lote) => (
          <Polygon
            key={lote.id}
            positions={lote.polygon}
            pathOptions={{
              color: severityColor[lote.severity],
              fillColor: severityColor[lote.severity],
              fillOpacity: 0.45,
              weight: 2,
            }}
          >
            <Popup>
              <div className="space-y-2 text-sm">
                <div className="font-semibold">{lote.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  {lote.cultivo} · {lote.superficie} ha
                </div>
                <div className="text-xs">
                  Estado: <span className="font-medium">{severityLabel[lote.severity]}</span>
                </div>
                <Button size="sm" className="w-full" onClick={() => navigate(`/lotes/${lote.id}`)}>
                  Ver detalle
                </Button>
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
}
