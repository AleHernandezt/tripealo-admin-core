import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";

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
    first_name: string;
    last_name: string;
  };
  experience?: {
    title: string;
    description: string;
  };
}

interface Experience {
  id: string;
  title: string;
  description: string | null;
}

interface Guide {
  id: string;
  first_name: string;
  last_name: string | null;
  status: string;
}

type TripFormData = {
  experience_id: string;
  guide_id: string;
  start_date: string;
  end_date: string;
  price: number;
  seats_available: number;
  image_url: string;
  is_featured: boolean;
};

const Viajes = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TripFormData>({
    defaultValues: {
      experience_id: "",
      guide_id: "",
      start_date: "",
      end_date: "",
      price: 0,
      seats_available: 0,
      image_url: "",
      is_featured: false,
    },
  });

  // Obtener datos desde Supabase
  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener trips con relaciones
      const { data: tripsData, error: tripsError } = await supabase
        .from("trips")
        .select(
          `
          *,
          guide:guides(first_name, last_name),
          experience:experiences(title, description)
        `
        )
        .order("start_date", { ascending: true });

      if (tripsError) throw tripsError;

      // Obtener experiencias
      const { data: experiencesData, error: experiencesError } = await supabase
        .from("experiences")
        .select("id, title, description")
        .order("title");

      if (experiencesError) throw experiencesError;

      // Obtener guías disponibles
      const { data: guidesData, error: guidesError } = await supabase
        .from("guides")
        .select("id, first_name, last_name, status")
        .eq("status", "available")
        .order("first_name");

      if (guidesError) throw guidesError;

      setTrips(tripsData || []);
      setExperiences(experiencesData || []);
      setGuides(guidesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Crear nuevo trip
  const onCreateTrip = async (data: TripFormData) => {
    try {
      setCreating(true);

      const newTrip = {
        experience_id: data.experience_id,
        guide_id: data.guide_id,
        start_date: new Date(data.start_date).toISOString(),
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
        price: data.price,
        seats_available: data.seats_available,
        image_url: data.image_url || null,
        is_featured: data.is_featured,
        agency_id: "5234281c-76a9-418d-bd49-c85715c6d7e1", // Ajusta según tu lógica
      };

      const { data: result, error } = await supabase
        .from("trips")
        .insert([newTrip]).select(`
          *,
          guide:guides(first_name, last_name),
          experience:experiences(title, description)
        `);

      if (error) {
        throw error;
      }

      if (result) {
        setTrips((prev) => [result[0], ...prev]);
        reset();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating trip:", error);
    } finally {
      setCreating(false);
    }
  };

  // Eliminar trip
  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);

      if (error) {
        throw error;
      }

      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const getGuideName = (guide: any) => {
    if (!guide) return "Sin guía asignado";
    return `${guide.first_name} ${guide.last_name || ""}`.trim();
  };

  const getExperienceName = (experience: any) => {
    if (!experience) return "Experiencia no disponible";
    return experience.title;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Cargando viajes...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Viajes</h1>
            <p className="text-muted-foreground mt-2">
              {trips.length} viajes programados
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Viaje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Viaje</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateTrip)}
                className="space-y-4 py-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="experience_id">Experiencia *</Label>
                  <Select
                    value={watch("experience_id")}
                    onValueChange={(value) => setValue("experience_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {experiences.map((exp) => (
                        <SelectItem key={exp.id} value={exp.id}>
                          {exp.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.experience_id && (
                    <p className="text-sm text-red-500">
                      La experiencia es requerida
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guide_id">Guía *</Label>
                  <Select
                    value={watch("guide_id")}
                    onValueChange={(value) => setValue("guide_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un guía" />
                    </SelectTrigger>
                    <SelectContent>
                      {guides.map((guide) => (
                        <SelectItem key={guide.id} value={guide.id}>
                          {guide.first_name} {guide.last_name || ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.guide_id && (
                    <p className="text-sm text-red-500">El guía es requerido</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Fecha de Inicio *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      {...register("start_date", {
                        required: "La fecha de inicio es requerida",
                      })}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500">
                        {errors.start_date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">Fecha de Fin</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      {...register("end_date")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seats_available">
                      Asientos Disponibles
                    </Label>
                    <Input
                      id="seats_available"
                      type="number"
                      {...register("seats_available", { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de Imagen</Label>
                  <Input
                    id="image_url"
                    {...register("image_url")}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={watch("is_featured")}
                    onCheckedChange={(checked) =>
                      setValue("is_featured", checked)
                    }
                  />
                  <Label htmlFor="is_featured">Destacado</Label>
                </div>

                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {creating ? "Creando..." : "Crear Viaje"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {getExperienceName(trip.experience)}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Inicio: {new Date(trip.start_date).toLocaleString()}
                      </div>
                      {trip.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Fin: {new Date(trip.end_date).toLocaleString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        👤 {getGuideName(trip.guide)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {trip.is_featured && (
                      <Badge
                        variant="default"
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        Destacado
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trip.price && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Precio</Label>
                      <Badge
                        variant="secondary"
                        className="text-lg font-semibold"
                      >
                        ${trip.price.toLocaleString()}
                      </Badge>
                    </div>
                  )}
                  {trip.seats_available !== null && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Asientos</Label>
                      <div className="text-lg font-semibold">
                        {trip.seats_available} disponibles
                      </div>
                    </div>
                  )}
                  {trip.experience?.description && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Descripción</Label>
                      <p className="text-sm text-muted-foreground">
                        {trip.experience.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {trips.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay viajes programados</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Viajes;
