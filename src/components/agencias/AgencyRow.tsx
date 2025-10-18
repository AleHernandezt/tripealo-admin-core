import { TableCell, TableRow } from "@/components/ui/table";
import { MoreVertical, Instagram, Music, ExternalLink } from "lucide-react";
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
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden">
            {agency.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200"></div>
            )}
          </div>
          <div>
            <span>{agency.nombre}</span>
            {agency.rating && (
              <div className="text-xs text-muted-foreground mt-1">
                ⭐ {agency.rating}/5 ({agency.review_count || 0} reviews)
              </div>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <div className="text-muted-foreground">{agency.email}</div>
          <div className="flex gap-3">
            {agency.instagram && (
              <a
                href={agency.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 transition-colors"
              >
                <Instagram className="h-3 w-3" />
                <span>Instagram</span>
                <ExternalLink className="h-2 w-2" />
              </a>
            )}
            {agency.tiktok && (
              <a
                href={agency.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-800 hover:text-black transition-colors"
              >
                <Music className="h-3 w-3" />
                <span>TikTok</span>
                <ExternalLink className="h-2 w-2" />
              </a>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell>
        {agency.estados.length === 0 ? (
          <div className="text-muted-foreground">Sin estados</div>
        ) : (
          <LocationAccordion estados={agency.estados} />
        )}
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
            {agency.instagram && (
              <DropdownMenuItem asChild>
                <a
                  href={agency.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full"
                >
                  <Instagram className="h-4 w-4" />
                  Ver Instagram
                </a>
              </DropdownMenuItem>
            )}
            {agency.tiktok && (
              <DropdownMenuItem asChild>
                <a
                  href={agency.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full text-white"
                >
                  <Music className="h-4 w-4" />
                  Ver TikTok
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive">
              Desactivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
