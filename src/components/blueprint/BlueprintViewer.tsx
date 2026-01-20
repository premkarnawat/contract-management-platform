import { Blueprint, FieldType } from "@/types/contract";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Type, Calendar, PenTool, CheckSquare } from "lucide-react";

interface BlueprintViewerProps {
  blueprint: Blueprint | null;
  open: boolean;
  onClose: () => void;
}

const fieldIcons: Record<FieldType, React.ElementType> = {
  text: Type,
  date: Calendar,
  signature: PenTool,
  checkbox: CheckSquare,
};

export function BlueprintViewer({ blueprint, open, onClose }: BlueprintViewerProps) {
  if (!blueprint) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{blueprint.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4 bg-muted/30 rounded-lg">
          <div
            className="relative bg-canvas-bg border rounded-lg shadow-sm mx-auto"
            style={{
              width: "612px", // 75% of 816
              height: "792px", // 75% of 1056
              backgroundImage:
                "linear-gradient(hsl(var(--canvas-grid)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--canvas-grid)) 1px, transparent 1px)",
              backgroundSize: "15px 15px", // 75% of 20px
              transform: "scale(1)",
              transformOrigin: "top center",
            }}
          >
            {blueprint.fields.map((field) => {
              const Icon = fieldIcons[field.type];
              return (
                <div
                  key={field.id}
                  className="absolute flex items-center bg-background border border-primary/30 rounded px-2"
                  style={{
                    left: field.x * 0.75,
                    top: field.y * 0.75,
                    width: field.width * 0.75,
                    height: field.height * 0.75,
                  }}
                >
                  <Icon className="w-3 h-3 text-primary/60 mr-1 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground truncate">{field.label}</span>
                </div>
              );
            })}
            {blueprint.fields.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">This blueprint has no fields</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 text-sm text-muted-foreground">
          <span>{blueprint.fields.length} field{blueprint.fields.length !== 1 ? 's' : ''}</span>
          <span>Created: {new Date(blueprint.createdAt).toLocaleDateString()}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}