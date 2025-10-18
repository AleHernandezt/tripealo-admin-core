import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Experiencia {
  id: string;
  nombre: string;
  descripcion: string;
  categorias: string[];
  nivelEsfuerzo: 'bajo' | 'medio' | 'alto';
  activa: boolean;
}

const categoriasDisponibles = ['fiesta', 'relax', 'naturaleza', 'aventura', 'cultura', 'gastronomia', 'deportes', 'romantico'];

const Experiencias = () => {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([
    {
      id: '1',
      nombre: 'Tour por las montañas',
      descripcion: 'Recorrido de 3 días por las montañas más hermosas',
      categorias: ['naturaleza', 'aventura'],
      nivelEsfuerzo: 'alto',
      activa: true
    },
    {
      id: '2',
      nombre: 'Noche de salsa',
      descripcion: 'Experiencia nocturna con las mejores discotecas',
      categorias: ['fiesta', 'cultura'],
      nivelEsfuerzo: 'bajo',
      activa: true
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExperiencia, setNewExperiencia] = useState({
    nombre: '',
    descripcion: '',
    categorias: [] as string[],
    nivelEsfuerzo: 'medio' as 'bajo' | 'medio' | 'alto',
  });

  const filteredExperiencias = experiencias.filter(exp =>
    exp.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateExperiencia = () => {
    const experiencia: Experiencia = {
      id: Date.now().toString(),
      ...newExperiencia,
      activa: true
    };
    setExperiencias([...experiencias, experiencia]);
    setNewExperiencia({
      nombre: '',
      descripcion: '',
      categorias: [],
      nivelEsfuerzo: 'medio'
    });
    setIsDialogOpen(false);
  };

  const toggleActiva = (id: string) => {
    setExperiencias(experiencias.map(exp =>
      exp.id === id ? { ...exp, activa: !exp.activa } : exp
    ));
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'bajo': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medio': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'alto': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Experiencias</h1>
            <p className="text-muted-foreground mt-2">
              {filteredExperiencias.length} experiencias disponibles
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Experiencia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Experiencia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={newExperiencia.nombre}
                    onChange={(e) => setNewExperiencia({ ...newExperiencia, nombre: e.target.value })}
                    placeholder="Nombre de la experiencia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={newExperiencia.descripcion}
                    onChange={(e) => setNewExperiencia({ ...newExperiencia, descripcion: e.target.value })}
                    placeholder="Describe la experiencia"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categorías</Label>
                  <div className="flex flex-wrap gap-2">
                    {categoriasDisponibles.map((cat) => (
                      <Badge
                        key={cat}
                        variant={newExperiencia.categorias.includes(cat) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          if (newExperiencia.categorias.includes(cat)) {
                            setNewExperiencia({
                              ...newExperiencia,
                              categorias: newExperiencia.categorias.filter(c => c !== cat)
                            });
                          } else {
                            setNewExperiencia({
                              ...newExperiencia,
                              categorias: [...newExperiencia.categorias, cat]
                            });
                          }
                        }}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nivel de Esfuerzo Físico</Label>
                  <Select
                    value={newExperiencia.nivelEsfuerzo}
                    onValueChange={(value: 'bajo' | 'medio' | 'alto') =>
                      setNewExperiencia({ ...newExperiencia, nivelEsfuerzo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bajo">Bajo</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateExperiencia} className="w-full">
                  Crear Experiencia
                </Button>
              </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiencias.map((experiencia) => (
            <Card key={experiencia.id} className={!experiencia.activa ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{experiencia.nombre}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={experiencia.activa}
                      onCheckedChange={() => toggleActiva(experiencia.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{experiencia.descripcion}</p>
                <div className="flex flex-wrap gap-2">
                  {experiencia.categorias.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
                <Badge className={getNivelColor(experiencia.nivelEsfuerzo)}>
                  Esfuerzo {experiencia.nivelEsfuerzo}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Experiencias;
