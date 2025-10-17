export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: "usuario" | "agencia" | "admin";
  estado: string;
  fechaRegistro: string;
  status: "activo" | "inactivo";
  reservasRealizadas: number;
}
