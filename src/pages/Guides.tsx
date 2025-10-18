import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";

interface Guide {
  id: string;
  agency_id: string;
  first_name: string;
  last_name?: string;
  vat?: string;
  email?: string;
  status?: "available" | "on_trip" | "unavailable";
  password?: string;
  created_at?: string;
}

type GuideFormData = {
  first_name: string;
  last_name: string;
  vat: string;
  email: string;
  password: string;
  status: "available" | "on_trip" | "unavailable";
};

const Guides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Configuración de React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<GuideFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      vat: "",
      email: "",
      password: "",
      status: "available",
    },
  });

  // Obtener guías desde Supabase
  const fetchGuides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setGuides(data || []);
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // Crear nueva guía
  const onCreateGuide = async (data: GuideFormData) => {
    try {
      setCreating(true);

      const nuevaGuide = {
        first_name: data.first_name,
        last_name: data.last_name || null,
        vat: data.vat || null,
        email: data.email || null,
        password: data.password || null,
        status: data.status,
        agency_id: "5234281c-76a9-418d-bd49-c85715c6d7e1", // Ajusta según tu lógica de agency_id
      };

      const { data: result, error } = await supabase
        .from("guides")
        .insert([nuevaGuide])
        .select();

      if (error) {
        throw error;
      }

      if (result) {
        setGuides((prev) => [result[0], ...prev]);
        reset();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating guide:", error);
    } finally {
      setCreating(false);
    }
  };

  // Cambiar estado del guía
  const updateGuideStatus = async (
    id: string,
    newStatus: "available" | "on_trip" | "unavailable"
  ) => {
    try {
      const { error } = await supabase
        .from("guides")
        .update({
          status: newStatus,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setGuides((prev) =>
        prev.map((guide) =>
          guide.id === id ? { ...guide, status: newStatus } : guide
        )
      );
    } catch (error) {
      console.error("Error updating guide status:", error);
    }
  };

  const filteredGuides = guides.filter(
    (guide) =>
      `${guide.first_name} ${guide.last_name || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      guide.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.vat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "on_trip":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "unavailable":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "on_trip":
        return "En Viaje";
      case "unavailable":
        return "No Disponible";
      default:
        return "Desconocido";
    }
  };

  const getNextStatus = (
    currentStatus: string
  ): "available" | "on_trip" | "unavailable" => {
    switch (currentStatus) {
      case "available":
        return "on_trip";
      case "on_trip":
        return "unavailable";
      case "unavailable":
        return "available";
      default:
        return "available";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Guías</h1>
            <p className="text-muted-foreground mt-2">
              {filteredGuides.length} guías registrados
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Guía
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Guía</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateGuide)}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      {...register("first_name", {
                        required: "El nombre es requerido",
                      })}
                      placeholder="Nombre del guía"
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-500">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      {...register("last_name")}
                      placeholder="Apellido del guía"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vat">Cédula/RIF</Label>
                    <Input
                      id="vat"
                      {...register("vat")}
                      placeholder="Cédula o RIF"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Email inválido",
                        },
                      })}
                      placeholder="email@ejemplo.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Contraseña temporal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={watch("status")}
                    onValueChange={(
                      value: "available" | "on_trip" | "unavailable"
                    ) => setValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="on_trip">En Viaje</SelectItem>
                      <SelectItem value="unavailable">No Disponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {creating ? "Creando..." : "Crear Guía"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar guías por nombre, email o cédula..."
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
            {filteredGuides.map((guide) => (
              <Card
                key={guide.id}
                className={guide.status === "unavailable" ? "opacity-60" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {guide.first_name} {guide.last_name || ""}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateGuideStatus(
                            guide.id,
                            getNextStatus(guide.status || "available")
                          )
                        }
                      >
                        Cambiar Estado
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {guide.email && (
                      <div className="text-sm">
                        <span className="font-medium">Email: </span>
                        {guide.email}
                      </div>
                    )}
                    {guide.vat && (
                      <div className="text-sm">
                        <span className="font-medium">Cédula/RIF: </span>
                        {guide.vat}
                      </div>
                    )}
                  </div>

                  <Badge
                    className={getStatusColor(guide.status || "available")}
                  >
                    {getStatusText(guide.status || "available")}
                  </Badge>

                  <div className="text-xs text-muted-foreground">
                    Registrado:{" "}
                    {new Date(guide.created_at || "").toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron guías</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Guides;
