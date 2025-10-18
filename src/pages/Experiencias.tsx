import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, X, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Configuración de iconos para Leaflet
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Icono personalizado para origen (azul)
const OriginIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "origin-marker",
});

// Icono personalizado para destino (rojo)
const DestinationIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "destination-marker",
});

// Estilos CSS para los marcadores
const markerStyles = `
  .origin-marker .leaflet-marker-icon {
    filter: hue-rotate(200deg) !important;
  }
  .destination-marker .leaflet-marker-icon {
    filter: hue-rotate(0deg) brightness(0.7) saturate(2) !important;
  }
`;

interface Experience {
  id: string;
  agency_id: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  origin?: string;
  destination?: string;
  duration?: string;
  difficulty: "low" | "mid" | "high";
  active?: boolean;
  origin_location?: { x: number; y: number } | null;
  destination_location?: { x: number; y: number } | null;
  categories?: Category[];
}

interface Category {
  id: string;
  name: string;
}

type ExperienceFormData = {
  title: string;
  description: string;
  image_url: string;
  origin: string;
  destination: string;
  duration: string;
  difficulty: "low" | "mid" | "high";
  categories: string[];
  origin_location: { lat: number; lng: number } | null;
  destination_location: { lat: number; lng: number } | null;
};

// Componente para manejar clicks en el mapa
function MapClickHandler({
  onOriginSelect,
  onDestinationSelect,
  selectionMode,
}: {
  onOriginSelect: (lat: number, lng: number) => void;
  onDestinationSelect: (lat: number, lng: number) => void;
  selectionMode: "origin" | "destination";
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (selectionMode === "origin") {
        onOriginSelect(lat, lng);
      } else {
        onDestinationSelect(lat, lng);
      }
    },
  });
  return null;
}

const Experiencias = () => {
  const defaultPosition: [number, number] = [10.4806, -66.9036]; // Caracas
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Estados para las ubicaciones del mapa
  const [originLocation, setOriginLocation] = useState<[number, number] | null>(
    null
  );
  const [destinationLocation, setDestinationLocation] = useState<
    [number, number] | null
  >(null);
  const [selectionMode, setSelectionMode] = useState<"origin" | "destination">(
    "origin"
  );

  // Configuración de React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ExperienceFormData>({
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      origin: "",
      destination: "",
      duration: "",
      difficulty: "low",
      categories: [],
      origin_location: null,
      destination_location: null,
    },
  });

  // Obtener experiencias con sus categorías desde Supabase
  const fetchExperiences = async () => {
    try {
      setLoading(true);

      // Obtener experiencias
      const { data: experiencesData, error: experiencesError } = await supabase
        .from("experiences")
        .select("*")
        .order("created_at", { ascending: false });

      if (experiencesError) {
        throw experiencesError;
      }

      // Obtener todas las categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) {
        throw categoriesError;
      }

      // Obtener relaciones de categorías para cada experiencia
      if (experiencesData && experiencesData.length > 0) {
        const experienceIds = experiencesData.map((exp) => exp.id);

        const { data: experiencesCategoriesData, error: relError } =
          await supabase
            .from("experiences_categories")
            .select(
              `
            experience_id,
            category_id,
            categories!inner(id, name)
          `
            )
            .in("experience_id", experienceIds);

        if (relError) {
          throw relError;
        }

        // Mapear experiencias con sus categorías
        const experiencesWithCategories = experiencesData.map((experience) => {
          const experienceCategories =
            experiencesCategoriesData
              ?.filter((rel) => rel.experience_id === experience.id)
              .map((rel) => rel.categories) || [];

          return {
            ...experience,
            categories: experienceCategories,
          };
        });

        setExperiences(experiencesWithCategories);
      } else {
        setExperiences([]);
      }

      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  // Manejar selección de ubicación de origen
  const handleOriginSelect = (lat: number, lng: number) => {
    const newLocation: [number, number] = [lat, lng];
    setOriginLocation(newLocation);
    setValue("origin_location", { lat, lng });
  };

  // Manejar selección de ubicación de destino
  const handleDestinationSelect = (lat: number, lng: number) => {
    const newLocation: [number, number] = [lat, lng];
    setDestinationLocation(newLocation);
    setValue("destination_location", { lat, lng });
  };

  // Crear nueva experiencia
  const onCreateExperience = async (data: ExperienceFormData) => {
    try {
      setCreating(true);

      // Convertir locations al formato PostGIS (longitud, latitud)
      const originLocationPostGIS = originLocation
        ? `POINT(${originLocation[1]} ${originLocation[0]})`
        : null;

      const destinationLocationPostGIS = destinationLocation
        ? `POINT(${destinationLocation[1]} ${destinationLocation[0]})`
        : null;

      // Crear la experiencia
      const newExperience = {
        title: data.title,
        description: data.description,
        image_url: data.image_url || null,
        origin: data.origin || null,
        destination: data.destination || null,
        duration: data.duration || null,
        difficulty: data.difficulty,
        origin_location: originLocationPostGIS,
        destination_location: destinationLocationPostGIS,
        agency_id: "5234281c-76a9-418d-bd49-c85715c6d7e1", // Ajusta según tu lógica
      };

      const { data: result, error: experienceError } = await supabase
        .from("experiences")
        .insert([newExperience])
        .select();

      if (experienceError) {
        throw experienceError;
      }

      if (result && result[0]) {
        const experienceId = result[0].id;

        // Crear relaciones en experiences_categories si hay categorías seleccionadas
        if (selectedCategories.length > 0) {
          const categoryRelations = selectedCategories.map((categoryId) => ({
            experience_id: experienceId,
            category_id: categoryId,
          }));

          const { error: categoriesError } = await supabase
            .from("experiences_categories")
            .insert(categoryRelations);

          if (categoriesError) {
            throw categoriesError;
          }
        }

        // Obtener la experiencia recién creada con sus categorías
        const { data: fullExperience, error: fetchError } = await supabase
          .from("experiences")
          .select(
            `
            *,
            experiences_categories(
              categories!inner(id, name)
            )
          `
          )
          .eq("id", experienceId)
          .single();

        if (!fetchError && fullExperience) {
          const experienceWithCategories = {
            ...fullExperience,
            categories:
              fullExperience.experiences_categories?.map(
                (rel: any) => rel.categories
              ) || [],
          };

          setExperiences((prev) => [experienceWithCategories, ...prev]);
        }

        reset();
        setSelectedCategories([]);
        setOriginLocation(null);
        setDestinationLocation(null);
        setSelectionMode("origin");
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating experience:", error);
    } finally {
      setCreating(false);
    }
  };

  // Toggle activa/inactiva
  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("experiences")
        .update({
          active: !currentActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setExperiences((prev) =>
        prev.map((exp) =>
          exp.id === id ? { ...exp, active: !currentActive } : exp
        )
      );
    } catch (error) {
      console.error("Error updating experience:", error);
    }
  };

  // Manejar selección de categorías
  const handleCategorySelect = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      const newSelectedCategories = [...selectedCategories, categoryId];
      setSelectedCategories(newSelectedCategories);
      setValue("categories", newSelectedCategories);
    }
  };

  // Remover categoría seleccionada
  const removeCategory = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.filter(
      (id) => id !== categoryId
    );
    setSelectedCategories(newSelectedCategories);
    setValue("categories", newSelectedCategories);
  };

  const filteredExperiences = experiences.filter((exp) =>
    exp.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "mid":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "low":
        return "Bajo";
      case "mid":
        return "Medio";
      case "high":
        return "Alto";
      default:
        return difficulty;
    }
  };
  return (
    <MainLayout>
      <style>{markerStyles}</style>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Experiencias</h1>
            <p className="text-muted-foreground mt-2">
              {filteredExperiences.length} experiencias disponibles
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Experiencia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Experiencia</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateExperience)}
                className="space-y-4 py-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Nombre *</Label>
                  <Input
                    id="title"
                    {...register("title", {
                      required: "El nombre es requerido",
                    })}
                    placeholder="Nombre de la experiencia"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    {...register("description", {
                      required: "La descripción es requerida",
                    })}
                    placeholder="Describe la experiencia"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origen</Label>
                    <Input
                      id="origin"
                      {...register("origin")}
                      placeholder="Ciudad de origen"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destino</Label>
                    <Input
                      id="destination"
                      {...register("destination")}
                      placeholder="Ciudad de destino"
                    />
                  </div>
                </div>

                {/* Mapa para seleccionar ubicaciones */}
                <div className="space-y-4">
                  <Label>Seleccionar Ubicaciones en el Mapa</Label>

                  <div className="flex gap-4 mb-4">
                    <Button
                      type="button"
                      variant={
                        selectionMode === "origin" ? "default" : "outline"
                      }
                      onClick={() => setSelectionMode("origin")}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Marcar Origen
                    </Button>
                    <Button
                      type="button"
                      variant={
                        selectionMode === "destination" ? "default" : "outline"
                      }
                      onClick={() => setSelectionMode("destination")}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Marcar Destino
                    </Button>
                  </div>

                  <div className="h-96 rounded-lg overflow-hidden border">
                    <MapContainer
                      center={defaultPosition}
                      zoom={10}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <MapClickHandler
                        onOriginSelect={handleOriginSelect}
                        onDestinationSelect={handleDestinationSelect}
                        selectionMode={selectionMode}
                      />

                      {originLocation && (
                        <Marker position={originLocation} icon={OriginIcon}>
                          <Popup>
                            <div className="text-center">
                              <strong>Origen</strong>
                              <br />
                              Lat: {originLocation[0].toFixed(4)}
                              <br />
                              Lng: {originLocation[1].toFixed(4)}
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {destinationLocation && (
                        <Marker
                          position={destinationLocation}
                          icon={DestinationIcon}
                        >
                          <Popup>
                            <div className="text-center">
                              <strong>Destino</strong>
                              <br />
                              Lat: {destinationLocation[0].toFixed(4)}
                              <br />
                              Lng: {destinationLocation[1].toFixed(4)}
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración</Label>
                    <Input
                      id="duration"
                      {...register("duration")}
                      placeholder="Ej: 3 días, 2 noches"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL de Imagen</Label>
                    <Input
                      id="image_url"
                      {...register("image_url")}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Nivel de Dificultad</Label>
                  <Select
                    value={watch("difficulty")}
                    onValueChange={(value: "low" | "mid" | "high") =>
                      setValue("difficulty", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="mid">Medio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categorías</Label>
                  <Select onValueChange={handleCategorySelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          disabled={selectedCategories.includes(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Categorías seleccionadas */}
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCategories.map((categoryId) => {
                        const category = categories.find(
                          (c) => c.id === categoryId
                        );
                        return category ? (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {category.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeCategory(categoryId)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {creating ? "Creando..." : "Crear Experiencia"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar experiencias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((experience) => (
              <Card
                key={experience.id}
                className={!experience.active ? "opacity-60" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {experience.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {experience.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={getDifficultyColor(experience.difficulty)}
                    >
                      Dificultad: {getDifficultyText(experience.difficulty)}
                    </Badge>
                  </div>

                  {experience.categories &&
                    experience.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {experience.categories.map((category) => (
                          <Badge key={category.id} variant="outline">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                  {(experience.origin || experience.destination) && (
                    <div className="text-sm text-muted-foreground">
                      {experience.origin && (
                        <span>Origen: {experience.origin}</span>
                      )}
                      {experience.destination && (
                        <span> → Destino: {experience.destination}</span>
                      )}
                    </div>
                  )}

                  {experience.duration && (
                    <div className="text-sm text-muted-foreground">
                      Duración: {experience.duration}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Creado:{" "}
                    {new Date(experience.created_at || "").toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredExperiences.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron experiencias
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Experiencias;
