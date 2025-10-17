import { TableCell, TableRow } from "@/components/ui/table";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LocationAccordion } from "./LocationAccordion";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge } from "./TypeBadge";
import { Agency } from "./types";

interface AgencyRowProps {
  agency: Agency;
  onApproveClick: (agency: Agency) => void;
}

export const AgencyRow = ({ agency, onApproveClick }: AgencyRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{agency.nombre}</TableCell>
      <TableCell className="text-muted-foreground">{agency.email}</TableCell>
      <TableCell>
        <LocationAccordion estados={agency.estados} />
      </TableCell>
      <TableCell>{agency.mediaViajes}</TableCell>
      <TableCell>
        <StatusBadge status={agency.status} />
      </TableCell>
      <TableCell>
        <TypeBadge tipo={agency.tipo} onClick={() => onApproveClick(agency)} />
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
            <DropdownMenuItem className="text-destructive">
              Desactivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
