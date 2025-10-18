import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  incluye: string;
}

interface Viaje {
  id: string;
  experienciaNombre: string;
  fechaSalida: string;
  fechaTopePago: string;
  planes: Plan[];
}

const experienciasDisponibles = [
  { id: '1', nombre: 'Tour por las montañas' },
  { id: '2', nombre: 'Noche de salsa' },
];

const Viajes = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlanesDialogOpen, setIsPlanesDialogOpen] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState<string | null>(null);
  const [newViaje, setNewViaje] = useState({
    experienciaId: '',
    fechaSalida: '',
    fechaTopePago: '',
  });
  const [newPlan, setNewPlan] = useState({
    nombre: '',
    precio: 0,
    incluye: '',
  });

  const handleCreateViaje = () => {
    const experiencia = experienciasDisponibles.find(e => e.id === newViaje.experienciaId);
    if (!experiencia) return;

    const viaje: Viaje = {
      id: Date.now().toString(),
      experienciaNombre: experiencia.nombre,
      fechaSalida: newViaje.fechaSalida,
      fechaTopePago: newViaje.fechaTopePago,
      planes: []
    };
    setViajes([...viajes, viaje]);
    setNewViaje({ experienciaId: '', fechaSalida: '', fechaTopePago: '' });
    setIsDialogOpen(false);
  };

  const handleAddPlan = () => {
    if (!selectedViaje) return;
    
    const plan: Plan = {
      id: Date.now().toString(),
      ...newPlan
    };

    setViajes(viajes.map(v =>
      v.id === selectedViaje ? { ...v, planes: [...v.planes, plan] } : v
    ));
    setNewPlan({ nombre: '', precio: 0, incluye: '' });
    setIsPlanesDialogOpen(false);
  };

  const handleDeletePlan = (viajeId: string, planId: string) => {
    setViajes(viajes.map(v =>
      v.id === viajeId ? { ...v, planes: v.planes.filter(p => p.id !== planId) } : v
    ));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Viajes</h1>
            <p className="text-muted-foreground mt-2">
              {viajes.length} viajes programados
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Viaje
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Viaje</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Experiencia</Label>
                  <Select
                    value={newViaje.experienciaId}
                    onValueChange={(value) => setNewViaje({ ...newViaje, experienciaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienciasDisponibles.map((exp) => (
                        <SelectItem key={exp.id} value={exp.id}>
                          {exp.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Salida</Label>
                  <Input
                    type="date"
                    value={newViaje.fechaSalida}
                    onChange={(e) => setNewViaje({ ...newViaje, fechaSalida: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Tope de Pago</Label>
                  <Input
                    type="date"
                    value={newViaje.fechaTopePago}
                    onChange={(e) => setNewViaje({ ...newViaje, fechaTopePago: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateViaje} className="w-full">
                  Crear Viaje
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {viajes.map((viaje) => (
            <Card key={viaje.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{viaje.experienciaNombre}</CardTitle>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Salida: {new Date(viaje.fechaSalida).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Pago límite: {new Date(viaje.fechaTopePago).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedViaje(viaje.id);
                      setIsPlanesDialogOpen(true);
                    }}
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {viaje.planes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay planes agregados</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viaje.planes.map((plan) => (
                      <Card key={plan.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{plan.nombre}</CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePlan(viaje.id, plan.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Badge variant="secondary" className="text-lg font-semibold">
                            ${plan.precio.toLocaleString()}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{plan.incluye}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isPlanesDialogOpen} onOpenChange={setIsPlanesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre del Plan</Label>
                <Input
                  value={newPlan.nombre}
                  onChange={(e) => setNewPlan({ ...newPlan, nombre: e.target.value })}
                  placeholder="Ej: Plan Básico"
                />
              </div>
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input
                  type="number"
                  value={newPlan.precio}
                  onChange={(e) => setNewPlan({ ...newPlan, precio: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Incluye</Label>
                <Input
                  value={newPlan.incluye}
                  onChange={(e) => setNewPlan({ ...newPlan, incluye: e.target.value })}
                  placeholder="Ej: Incluye almuerzo y cena"
                />
              </div>
              <Button onClick={handleAddPlan} className="w-full">
                Agregar Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Viajes;
