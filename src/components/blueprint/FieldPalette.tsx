import { Type, Calendar, PenTool, CheckSquare } from "lucide-react";
import { FieldType } from "@/types/contract";

interface FieldPaletteProps {
  onFieldSelect: (type: FieldType) => void;
  selectedField: FieldType | null;
}

const fieldTypes: { type: FieldType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Text Field", icon: Type },
  { type: "date", label: "Date Field", icon: Calendar },
  { type: "signature", label: "Signature", icon: PenTool },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
];

export function FieldPalette({ onFieldSelect, selectedField }: FieldPaletteProps) {
  return (
    <div className="w-60 border-r bg-card p-4 flex flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Field Types
      </h3>
      {fieldTypes.map((field) => {
        const Icon = field.icon;
        const isSelected = selectedField === field.type;
        return (
          <button
            key={field.type}
            onClick={() => onFieldSelect(field.type)}
            className={`field-item ${isSelected ? "border-primary bg-primary/5" : ""}`}
          >
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{field.label}</span>
          </button>
        );
      })}
      <div className="mt-auto pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Click a field type, then click on the canvas to place it.
        </p>
      </div>
    </div>
  );
}
