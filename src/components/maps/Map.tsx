// components/MapComponent.tsx
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: "origin" | "destination" | "pickup";
  name?: string;
  time?: string;
}

interface MapComponentProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  meetingPoints: MapPoint[];
  optimizedRoute?: [number, number][];
}

const MapComponent = ({
  origin,
  destination,
  meetingPoints,
  optimizedRoute,
}: MapComponentProps) => {
  const [map, setMap] = useState<L.Map | null>(null);

  // Iconos personalizados
  const originIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const destinationIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const pickupIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Calcular bounds para ajustar el mapa a todos los puntos
  useEffect(() => {
    if (map && (origin || destination || meetingPoints.length > 0)) {
      const bounds = new L.LatLngBounds([]);

      if (origin) bounds.extend([origin.lat, origin.lng]);
      if (destination) bounds.extend([destination.lat, destination.lng]);
      meetingPoints.forEach((point) => bounds.extend([point.lat, point.lng]));

      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, origin, destination, meetingPoints]);

  if (!origin || !destination) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <p>No hay ubicaciones configuradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcador de origen */}
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Popup>
            <div className="text-center">
              <strong>Origen</strong>
              <br />
              {meetingPoints.find((p) => p.type === "origin")?.name ||
                "Punto de inicio"}
            </div>
          </Popup>
        </Marker>

        {/* Marcador de destino */}
        <Marker
          position={[destination.lat, destination.lng]}
          icon={destinationIcon}
        >
          <Popup>
            <div className="text-center">
              <strong>Destino</strong>
              <br />
              {meetingPoints.find((p) => p.type === "destination")?.name ||
                "Punto final"}
            </div>
          </Popup>
        </Marker>

        {/* Puntos de recogida */}
        {meetingPoints
          .filter((point) => point.type === "pickup")
          .map((point, index) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={pickupIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Parada {index + 1}</strong>
                  <br />
                  {point.name || "Punto de recogida"}
                  {point.time && (
                    <>
                      <br />
                      <small>Hora: {point.time}</small>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Ruta optimizada */}
        {optimizedRoute && optimizedRoute.length > 0 && (
          <Polyline
            positions={optimizedRoute}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
