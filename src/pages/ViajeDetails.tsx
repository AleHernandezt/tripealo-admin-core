import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  User,
  MapPin,
  DollarSign,
  Users,
  ArrowLeft,
  Loader2,
  Star,
  Clock,
  Navigation,
  Mail,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock4,
  AlertCircle,
  Route,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MeetingPointsMap from "@/components/maps/MeetingPoints";

// Interfaces simplificadas
interface Reservation {
  id: string;
  user_id: string;
  trip_id: string;
  total_price: number;
  payment_method: string | null;
  payment_reference: string | null;
  payment_status: string | null;
  partial_payment: boolean | null;
  partial_paid_amount: number | null;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    state: string;
    age: string;
  };
}

interface Trip {
  id: string;
  guide_id: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  agency_id: string | null;
  price: number | null;
  seats_available: number | null;
  image_url: string | null;
  is_featured: boolean | null;
  agency_rating: number | null;
  experience_id: string | null;
  guide?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
  };
  experience?: {
    id: string;
    title: string;
    description: string;
    origin: string;
    destination: string;
    duration: string;
    difficulty: string;
    image_url: string;
  };
}

const ViajeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const difficulty =
    trip?.experience?.difficulty === "low"
      ? "Facil"
      : trip?.experience?.difficulty === "mid"
      ? "Medio"
      : trip?.experience?.difficulty === "high"
      ? "Dificil"
      : "";

  // Obtener datos del viaje con reservas
  const fetchTripData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("ID del viaje no proporcionado");
      }

      // Obtener trip
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select(
          `
          *,
          guide:guides(id, first_name, last_name, email, status),
          experience:experiences(id, title, description, origin, destination, duration, difficulty, image_url)
        `
        )
        .eq("id", id)
        .single();

      if (tripError) throw tripError;
      if (!tripData) throw new Error("Viaje no encontrado");

      // Obtener reservas con información de usuarios SOLAMENTE
      const { data: reservationsData, error: reservationsError } =
        await supabase
          .from("reservations")
          .select(
            `
          *,
          user:users(id, email, full_name, avatar_url, state, age)
        `
          )
          .eq("trip_id", id)
          .order("created_at", { ascending: false });

      if (reservationsError) throw reservationsError;

      setTrip(tripData);
      setReservations(reservationsData || []);
    } catch (error) {
      console.error("Error fetching trip data:", error);
      setError(
        error instanceof Error ? error.message : "Error al cargar el viaje"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTripData();
    }
  }, [id]);

  // Funciones de utilidad
  const handleGoBack = () => navigate("/viajes");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusBadge = (status: string | null) => {
    const config = {
      paid: { label: "Pagado", variant: "default" as const, icon: CheckCircle },
      pending: {
        label: "Pendiente",
        variant: "secondary" as const,
        icon: Clock4,
      },
      failed: {
        label: "Fallido",
        variant: "destructive" as const,
        icon: XCircle,
      },
      refunded: {
        label: "Reembolsado",
        variant: "outline" as const,
        icon: AlertCircle,
      },
    };

    const statusKey = status || "pending";
    const statusConfig =
      config[statusKey as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string | null) => {
    if (!method) return null;

    const methodNames: { [key: string]: string } = {
      card: "Tarjeta",
      cash: "Efectivo",
      transfer: "Transferencia",
      paypal: "PayPal",
    };

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <CreditCard className="h-3 w-3" />
        {methodNames[method] || method}
      </Badge>
    );
  };

  // Estadísticas
  const stats = {
    total: reservations.length,
    paid: reservations.filter((r) => r.payment_status === "paid").length,
    pending: reservations.filter((r) => r.payment_status === "pending").length,
    failed: reservations.filter((r) => r.payment_status === "failed").length,
    totalRevenue: reservations
      .filter((r) => r.payment_status === "paid")
      .reduce((sum, reservation) => sum + reservation.total_price, 0),
    partialPayments: reservations.filter((r) => r.partial_payment).length,
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">
              Cargando detalles del viaje...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !trip) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-destructive mb-4">
              <MapPin className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {error ? "Error" : "Viaje no encontrado"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {error || "El viaje que buscas no existe o ha sido eliminado."}
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Viajes
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">Detalles del Viaje</h1>
              <p className="text-muted-foreground mt-2">
                {trip.experience?.title} • {stats.total} reservas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {trip.is_featured && (
              <Badge
                variant="default"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                Destacado
              </Badge>
            )}
            {trip.agency_rating && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {trip.agency_rating}
              </Badge>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Reservas
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.paid}
              </div>
              <div className="text-sm text-muted-foreground">Pagadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
              <div className="text-sm text-muted-foreground">Fallidas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Ingresos</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reservations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reservations">
              Reservas ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="trip-info">Información del Viaje</TabsTrigger>
            <TabsTrigger value="pickups">Recogidas</TabsTrigger>
          </TabsList>

          {/* Tabla de Reservas */}
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>Reservas Confirmadas</CardTitle>
              </CardHeader>
              <CardContent>
                {reservations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Estado Pago</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Pago Parcial</TableHead>
                        <TableHead>Fecha Reserva</TableHead>
                        <TableHead>Referencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {reservation.user?.avatar_url ? (
                                <img
                                  src={reservation.user.avatar_url}
                                  alt={reservation.user.full_name || "Usuario"}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">
                                  {reservation.user?.full_name ||
                                    "Usuario no disponible"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {reservation.user_id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {reservation.user?.email ||
                                  "Email no disponible"}
                              </div>
                              {reservation.user?.state && (
                                <div className="text-sm text-muted-foreground">
                                  {reservation.user.state}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(reservation.payment_status)}
                          </TableCell>
                          <TableCell>
                            {getPaymentMethodBadge(reservation.payment_method)}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              ${reservation.total_price.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {reservation.partial_payment ? (
                              <div className="text-center">
                                <Badge variant="secondary" className="mb-1">
                                  Parcial
                                </Badge>
                                <div className="text-sm text-muted-foreground">
                                  $
                                  {reservation.partial_paid_amount?.toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="outline">Completo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              reservation.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {reservation.payment_reference ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {reservation.payment_reference}
                              </code>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                N/A
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No hay reservas</h3>
                    <p className="text-muted-foreground">
                      Aún no hay reservas para este viaje
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información del Viaje */}
          <TabsContent value="trip-info">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Viaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      {trip.experience?.title || "Experiencia no disponible"}
                    </h2>
                    <p className="text-muted-foreground">
                      {trip.experience?.description ||
                        "Sin descripción disponible"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Fecha de Inicio</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(trip.start_date)}
                        </p>
                      </div>
                    </div>

                    {trip.end_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Fecha de Fin</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(trip.end_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {trip.experience?.origin && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Origen</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.experience.origin}
                          </p>
                        </div>
                      </div>
                    )}

                    {trip.experience?.destination && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Destino</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.experience.destination}
                          </p>
                        </div>
                      </div>
                    )}

                    {trip.experience?.duration && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Duración</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.experience.duration}
                          </p>
                        </div>
                      </div>
                    )}

                    {trip.experience?.difficulty && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Dificultad</p>
                          <Badge variant="outline">{difficulty}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Precio y Disponibilidad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trip.price !== null && (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">
                          ${trip.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Por persona
                        </p>
                      </div>
                    )}

                    {trip.seats_available !== null && (
                      <div className="text-center">
                        <p className="text-2xl font-semibold">
                          {trip.seats_available}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Asientos disponibles
                        </p>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-2xl font-semibold text-green-600">
                        {stats.paid}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reservas pagadas
                      </p>
                    </div>

                    {stats.partialPayments > 0 && (
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-orange-600">
                          {stats.partialPayments}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pagos parciales
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {trip.guide && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Información del Guía</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {trip.guide.first_name} {trip.guide.last_name}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {trip.guide.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {trip.guide.email}
                              </div>
                            )}
                            <Badge
                              variant={
                                trip.guide.status === "available"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {trip.guide.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pickups">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Gestión de Recogidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MeetingPointsMap tripId={id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ViajeDetails;
