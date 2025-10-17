import { TableCell, TableRow } from "@/components/ui/table";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "./RoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { User } from "./types";

interface UserRowProps {
  user: User;
}

export const UserRow = ({ user }: UserRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.nombre}</TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <RoleBadge rol={user.rol} />
      </TableCell>
      <TableCell>{user.estado}</TableCell>
      <TableCell className="text-muted-foreground">{user.fechaRegistro}</TableCell>
      <TableCell>{user.reservasRealizadas}</TableCell>
      <TableCell>
        <UserStatusBadge status={user.status} />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
            <DropdownMenuItem>Ver Reservas</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Suspender Usuario
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
