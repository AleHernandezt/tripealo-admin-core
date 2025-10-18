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
  onApprove: () => void;
}

export const ProApprovalModal = ({
  open,
  onOpenChange,
  agency,
  onApprove,
}: ProApprovalModalProps) => {
  if (!agency) return null;

  const handleReject = () => {
    onOpenChange(false);
  };

  const handleApprove = () => {
    onApprove();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Aprobar Solicitud Pro</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            La agencia{" "}
            <span className="font-semibold text-foreground">
              "{agency.nombre}"
            </span>{" "}
            ha solicitado una cuenta Pro. Revisa su perfil y aprueba o rechaza
            la solicitud.
          </DialogDescription>
        </DialogHeader>

        {/* Información adicional de la agencia */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{agency.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ubicación:</span>
            <span>{agency.lugarOpera}</span>
          </div>
          {agency.rating && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rating:</span>
              <span>
                {agency.rating}/5 ({agency.review_count} reviews)
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleReject}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Rechazar
          </Button>
          <Button
            onClick={handleApprove}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Aprobar como Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
