import { Blueprint } from "@/types/contract";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlueprintListProps {
  blueprints: Blueprint[];
  onLoad: (blueprint: Blueprint) => void;
  onDelete: (id: string) => void;
  onView: (blueprint: Blueprint) => void;
}

export function BlueprintList({ blueprints, onLoad, onDelete, onView }: BlueprintListProps) {
  if (blueprints.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No saved blueprints</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 pr-2">
        {blueprints.map((bp) => (
          <div
            key={bp.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{bp.name}</p>
              <p className="text-xs text-muted-foreground">
                {bp.fields.length} field{bp.fields.length !== 1 ? 's' : ''} • {new Date(bp.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(bp)}
                className="h-8 w-8 p-0"
                title="View blueprint"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoad(bp)}
                className="h-8 w-8 p-0"
                title="Load to canvas"
              >
                <FileText className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(bp.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete blueprint"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}