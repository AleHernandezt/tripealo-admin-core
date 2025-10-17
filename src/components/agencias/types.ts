export interface Agency {
  id: string;
  nombre: string;
  email: string;
  estados: string[];
  mediaViajes: number;
  status: "activo" | "inactivo";
  tipo: "standard" | "pro" | "pendiente";
}
