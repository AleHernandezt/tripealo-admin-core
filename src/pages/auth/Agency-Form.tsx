import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";

interface Agency {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  state: string | null;
  rating: number | null;
  review_count: number | null;
  is_premium: boolean | null;
  is_featured: boolean | null;
  created_at: string;
}

type AgencyFormData = {
  name: string;
  description: string;
  logo_url: string;
  state: string;
  rating: number;
  is_premium: boolean;
  is_featured: boolean;
};

const FormAgencies = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
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
  } = useForm<AgencyFormData>({
    defaultValues: {
      name: "",
      description: "",
      logo_url: "",
      state: "",
      rating: 0,
      is_premium: false,
      is_featured: false,
    },
  });

  // Obtener agencias desde Supabase
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAgencies(data || []);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  // Crear nueva agencia
  const onCreateAgency = async (data: AgencyFormData) => {
    try {
      setCreating(true);

      const nuevaAgencia = {
        name: data.name,
        description: data.description || null,
        logo_url: data.logo_url || null,
        state: data.state || null,
        rating: data.rating || null,
        review_count: 0, // Valor por defecto
        is_premium: data.is_premium || false,
        is_featured: data.is_featured || false,
        created_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from("agencies")
        .insert([nuevaAgencia])
        .select();

      if (error) {
        throw error;
      }

      if (result) {
        setAgencies((prev) => [result[0], ...prev]);
        reset();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating agency:", error);
    } finally {
      setCreating(false);
    }
  };

  // Toggle estado premium
  const togglePremium = async (id: string, currentPremium: boolean) => {
    try {
      const { error } = await supabase
        .from("agencies")
        .update({
          is_premium: !currentPremium,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setAgencies((prev) =>
        prev.map((agency) =>
          agency.id === id ? { ...agency, is_premium: !currentPremium } : agency
        )
      );
    } catch (error) {
      console.error("Error updating agency premium status:", error);
    }
  };

  // Toggle estado featured
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("agencies")
        .update({
          is_featured: !currentFeatured,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setAgencies((prev) =>
        prev.map((agency) =>
          agency.id === id
            ? { ...agency, is_featured: !currentFeatured }
            : agency
        )
      );
    } catch (error) {
      console.error("Error updating agency featured status:", error);
    }
  };

  const filteredAgencies = agencies.filter((agency) =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number | null) => {
    if (!rating) return null;

    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">
          ({agencies.find((a) => a.id === agencies[0]?.id)?.review_count || 0}{" "}
          reviews)
        </span>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Agencias</h1>
            <p className="text-muted-foreground mt-2">
              {filteredAgencies.length} agencias registradas
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Agencia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Agencia</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onCreateAgency)}
                className="space-y-4 py-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Agencia *</Label>
                  <Input
                    id="name"
                    {...register("name", {
                      required: "El nombre es requerido",
                    })}
                    placeholder="Nombre de la agencia"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe los servicios de la agencia"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">URL del Logo</Label>
                    <Input
                      id="logo_url"
                      {...register("logo_url")}
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado/Provincia</Label>
                    <Input
                      id="state"
                      {...register("state")}
                      placeholder="Estado donde opera"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Calificación (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...register("rating", {
                      min: { value: 0, message: "Mínimo 0" },
                      max: { value: 5, message: "Máximo 5" },
                      valueAsNumber: true,
                    })}
                    placeholder="4.5"
                  />
                  {errors.rating && (
                    <p className="text-sm text-red-500">
                      {errors.rating.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_premium"
                      checked={watch("is_premium")}
                      onCheckedChange={(checked) =>
                        setValue("is_premium", checked)
                      }
                    />
                    <Label htmlFor="is_premium">Agencia Premium</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={watch("is_featured")}
                      onCheckedChange={(checked) =>
                        setValue("is_featured", checked)
                      }
                    />
                    <Label htmlFor="is_featured">Destacada</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {creating ? "Creando..." : "Crear Agencia"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar agencias..."
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
            {filteredAgencies.map((agency) => (
              <Card key={agency.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {agency.logo_url && (
                        <img
                          src={agency.logo_url}
                          alt={agency.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <CardTitle className="text-lg">{agency.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {agency.is_premium && (
                        <Badge
                          variant="default"
                          className="bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agency.description && (
                    <p className="text-sm text-muted-foreground">
                      {agency.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {agency.state && (
                      <Badge variant="secondary">{agency.state}</Badge>
                    )}
                    {agency.is_featured && (
                      <Badge variant="default">Destacada</Badge>
                    )}
                  </div>

                  {renderStars(agency.rating)}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={agency.is_premium || false}
                          onCheckedChange={() =>
                            togglePremium(agency.id, agency.is_premium || false)
                          }
                        />
                        <Label className="text-xs">Premium</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={agency.is_featured || false}
                          onCheckedChange={() =>
                            toggleFeatured(
                              agency.id,
                              agency.is_featured || false
                            )
                          }
                        />
                        <Label className="text-xs">Destacada</Label>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Registrada:{" "}
                    {new Date(agency.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredAgencies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron agencias</p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="mt-2"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FormAgencies;
