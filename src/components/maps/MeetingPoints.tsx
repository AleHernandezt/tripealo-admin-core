import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Route,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MapComponent from "./Map";

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: "origin" | "destination" | "pickup";
  name?: string;
  time?: string;
}

interface LocationGeometry {
  type: "Point";
  crs: {
    type: "name";
    properties: {
      name: string;
    };
  };
  coordinates: [number, number]; // [lng, lat]
}

interface MeetingPoint {
  id: string;
  trip_id: string;
  traveller_id: string;
  location: LocationGeometry; // Usar la interfaz correcta aquí
  pickup_time: string;
  stop_order: number | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  traveller?: {
    id: string;
    user_id: string;
    user?: {
      email: string;
      full_name: string;
      avatar_url: string;
    };
  };
}

interface Trip {
  id: string;
  experience?: {
    origin_location: LocationGeometry;
    destination_location: LocationGeometry;
    origin: string;
    destination: string;
  };
}

interface MeetingPointsMapProps {
  tripId: string;
}

const MeetingPointsMap = ({ tripId }: MeetingPointsMapProps) => {
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Obtener datos del trip y meeting points
  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener trip con información de ubicación
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select(
          `
          *,
          experience:experiences(origin_location, destination_location, origin, destination)
        `
        )
        .eq("id", tripId)
        .single();

      if (tripError) throw tripError;

      const { data: pointsData, error: pointsError } = await supabase
        .from("meeting_points")
        .select(
          `
          *,
          traveller:travellers(
            id,
            user_id,
            user:users(email, full_name, avatar_url)
          )
        `
        )
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (pointsError) {
        console.error("Error fetching meeting points:", pointsError);
        throw pointsError;
      }

      console.log("Meeting points data:", pointsData);

      setTrip(tripData);
      setMeetingPoints(pointsData || []);
    } catch (error) {
      console.error("Error fetching meeting points:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchData();
    }
  }, [tripId]);

  // Función para parsear geometría correctamente
  const parseGeometry = (geometry: LocationGeometry) => {
    if (!geometry || !geometry.coordinates) return null;

    try {
      const [lng, lat] = geometry.coordinates;
      return { lng, lat };
    } catch (error) {
      console.error("Error parsing geometry:", error);
      return null;
    }
  };

  // Aceptar punto de recogida
  const handleAcceptPoint = async (pointId: string) => {
    try {
      const { error } = await supabase
        .from("meeting_points")
        .update({ status: "confirmed" })
        .eq("id", pointId);

      if (error) throw error;

      setMeetingPoints((prev) =>
        prev.map((point) =>
          point.id === pointId ? { ...point, status: "confirmed" } : point
        )
      );
    } catch (error) {
      console.error("Error accepting point:", error);
    }
  };

  // Rechazar punto de recogida
  const handleRejectPoint = async (pointId: string) => {
    try {
      const { error } = await supabase
        .from("meeting_points")
        .update({ status: "rejected" })
        .eq("id", pointId);

      if (error) throw error;

      setMeetingPoints((prev) =>
        prev.map((point) =>
          point.id === pointId ? { ...point, status: "rejected" } : point
        )
      );
    } catch (error) {
      console.error("Error rejecting point:", error);
    }
  };

  const getMapPoints = () => {
    const points: MapPoint[] = [];

    // Agregar origen
    if (trip?.experience?.origin_location) {
      const originCoords = parseGeometry(trip.experience.origin_location);
      if (originCoords) {
        points.push({
          id: "origin",
          lat: originCoords.lat,
          lng: originCoords.lng,
          type: "origin",
          name: trip.experience.origin,
        });
      }
    }

    // Agregar destino
    if (trip?.experience?.destination_location) {
      const destinationCoords = parseGeometry(
        trip.experience.destination_location
      );
      if (destinationCoords) {
        points.push({
          id: "destination",
          lat: destinationCoords.lat,
          lng: destinationCoords.lng,
          type: "destination",
          name: trip.experience.destination,
        });
      }
    }

    // Agregar puntos de recogida aceptados
    meetingPoints
      .filter((point) => point.status === "confirmed")
      .forEach((point) => {
        const coords = parseGeometry(point.location);
        if (coords) {
          points.push({
            id: point.id,
            lat: coords.lat,
            lng: coords.lng,
            type: "pickup",
            name: getTravelerName(point.traveller),
            time: new Date(point.pickup_time).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
      });

    return points;
  };

  // Función para simular ruta optimizada (reemplaza con tu lógica real)
  const getOptimizedRoute = () => {
    const points = getMapPoints();
    if (points.length < 2) return [];

    // Simular una ruta simple conectando los puntos en orden
    return points.map((point) => [point.lat, point.lng] as [number, number]);
  };

  // Optimizar ruta
  const optimizeRoute = async () => {
    try {
      setOptimizing(true);

      // Obtener puntos aceptados
      const confirmedPoints = meetingPoints.filter(
        (point) => point.status === "confirmed"
      );

      // Aquí integrarías con tu algoritmo de optimización de ruta
      // Por ahora, simulamos la optimización asignando stop_order
      const optimizedPoints = [...confirmedPoints].sort(
        (a, b) =>
          new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime()
      );

      // Actualizar stop_order en la base de datos
      for (let i = 0; i < optimizedPoints.length; i++) {
        const point = optimizedPoints[i];
        const { error } = await supabase
          .from("meeting_points")
          .update({ stop_order: i + 1 })
          .eq("id", point.id);

        if (error) throw error;
      }

      // Recargar datos
      await fetchData();
    } catch (error) {
      console.error("Error optimizing route:", error);
    } finally {
      setOptimizing(false);
    }
  };

  // Calcular estadísticas
  const stats = {
    total: meetingPoints.length,
    pending: meetingPoints.filter((p) => p.status === "pending").length,
    confirmed: meetingPoints.filter((p) => p.status === "confirmed").length,
    rejected: meetingPoints.filter((p) => p.status === "rejected").length,
    optimized: meetingPoints.filter((p) => p.stop_order !== null).length,
  };

  // Simular cálculo de distancia y tiempo (reemplazar con cálculo real)
  const routeStats = {
    distance: stats.confirmed ? (stats.confirmed * 5 + 10).toFixed(1) : "0", // km
    time: stats.confirmed ? stats.confirmed * 10 + 30 : 0, // minutos
  };

  // Obtener nombre del viajero
  const getTravelerName = (traveller: any) => {
    if (!traveller) return "Viajero no disponible";

    if (traveller.user?.full_name) {
      return traveller.user.full_name;
    }

    return "Viajero sin nombre";
  };

  // Obtener email del viajero
  const getTravelerEmail = (traveller: any) => {
    return traveller?.user?.email || "Email no disponible";
  };

  // Obtener avatar del viajero
  const getTravelerAvatar = (traveller: any) => {
    return traveller?.user?.avatar_url;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mapa con React Leaflet - SIN el placeholder */}
      <MapComponent
        origin={parseGeometry(trip?.experience?.origin_location)}
        destination={parseGeometry(trip?.experience?.destination_location)}
        meetingPoints={getMapPoints()}
        optimizedRoute={getOptimizedRoute()}
      />

      {/* Información de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-muted-foreground">
              Solicitudes Totales
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmed}
            </div>
            <div className="text-sm text-muted-foreground">Aceptadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {routeStats.distance} km
            </div>
            <div className="text-sm text-muted-foreground">Distancia Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {routeStats.time} min
            </div>
            <div className="text-sm text-muted-foreground">Tiempo Estimado</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de puntos de recogida */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Recogida</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Viajero</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Hora Recogida</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetingPoints.map((point) => (
                <TableRow key={point.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getTravelerAvatar(point.traveller) ? (
                        <img
                          src={getTravelerAvatar(point.traveller)}
                          alt={getTravelerName(point.traveller)}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="font-medium">
                        {getTravelerName(point.traveller)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {getTravelerEmail(point.traveller)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {point.status === "pending" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    )}
                    {point.status === "confirmed" && (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Aceptado
                      </Badge>
                    )}
                    {point.status === "rejected" && (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        Rechazado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(point.pickup_time).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {point.stop_order ? (
                      <Badge variant="default">#{point.stop_order}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No asignado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {point.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptPoint(point.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectPoint(point.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      {point.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectPoint(point.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      )}
                      {point.status === "rejected" && (
                        <Button
                          size="sm"
                          onClick={() => handleAcceptPoint(point.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aceptar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meetingPoints.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                No hay solicitudes de recogida
              </h3>
              <p className="text-muted-foreground">
                Los viajeros aún no han solicitado puntos de recogida
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={optimizeRoute}
          disabled={optimizing || stats.confirmed === 0}
        >
          {optimizing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Route className="h-4 w-4 mr-2" />
          )}
          {optimizing ? "Optimizando..." : "Optimizar Ruta"}
        </Button>
        <Button onClick={fetchData}>
          <MapPin className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>
    </div>
  );
};

export default MeetingPointsMap;
