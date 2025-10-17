import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Agency } from "./types";

interface ProApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agency: Agency | null;
}

export const ProApprovalModal = ({
  open,
  onOpenChange,
  agency,
}: ProApprovalModalProps) => {
  if (!agency) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Aprobar Solicitud Pro</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            La agencia <span className="font-semibold text-foreground">"{agency.nombre}"</span> ha
            solicitado una cuenta Pro. Revisa su perfil y aprueba o rechaza la
            solicitud.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Rechazar
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Aprobar como Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
