import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FieldPalette } from "@/components/blueprint/FieldPalette";
import { BlueprintCanvas, fieldSizes } from "@/components/blueprint/BlueprintCanvas";
import { BlueprintList } from "@/components/blueprint/BlueprintList";
import { BlueprintViewer } from "@/components/blueprint/BlueprintViewer";
import { Blueprint, BlueprintField, FieldType } from "@/types/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function BlueprintBuilder() {
  const [blueprintName, setBlueprintName] = useState("Untitled Blueprint");
  const [selectedFieldType, setSelectedFieldType] = useState<FieldType | null>(null);
  const [fields, setFields] = useState<BlueprintField[]>([]);
  const [savedBlueprints, setSavedBlueprints] = useState<Blueprint[]>([]);
  const [viewingBlueprint, setViewingBlueprint] = useState<Blueprint | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("blueprints") || "[]");
    setSavedBlueprints(stored);
  }, []);

  const handleFieldSelect = (type: FieldType) => {
    setSelectedFieldType(type === selectedFieldType ? null : type);
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedFieldType) return;

    const size = fieldSizes[selectedFieldType];
    const fieldCount = fields.filter((f) => f.type === selectedFieldType).length + 1;
    const label = `${selectedFieldType.charAt(0).toUpperCase() + selectedFieldType.slice(1)} ${fieldCount}`;

    const newField: BlueprintField = {
      id: `field-${Date.now()}`,
      type: selectedFieldType,
      label,
      x: x - size.width / 2,
      y: y - size.height / 2,
      width: size.width,
      height: size.height,
    };

    setFields([...fields, newField]);
    setSelectedFieldType(null);
  };

  const handleFieldDelete = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleFieldMove = (id: string, x: number, y: number) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, x, y } : f)));
  };

  const handleFieldUpdate = (id: string, updates: Partial<BlueprintField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSave = () => {
    if (fields.length === 0) {
      toast({
        title: "Cannot save empty blueprint",
        description: "Add at least one field to the canvas.",
        variant: "destructive",
      });
      return;
    }

    const blueprint: Blueprint = {
      id: `bp-${Date.now()}`,
      name: blueprintName,
      fields,
      createdAt: new Date(),
    };
    const updated = [...savedBlueprints, blueprint];
    setSavedBlueprints(updated);
    localStorage.setItem("blueprints", JSON.stringify(updated));

    toast({
      title: "Blueprint saved",
      description: `"${blueprintName}" has been saved successfully.`,
    });

    setFields([]);
    setBlueprintName("Untitled Blueprint");
  };

  const handleLoadBlueprint = (blueprint: Blueprint) => {
    setFields(blueprint.fields);
    setBlueprintName(blueprint.name);
    setSheetOpen(false);
    toast({
      title: "Blueprint loaded",
      description: `"${blueprint.name}" has been loaded to the canvas.`,
    });
  };

  const handleDeleteBlueprint = (id: string) => {
    const updated = savedBlueprints.filter((bp) => bp.id !== id);
    setSavedBlueprints(updated);
    localStorage.setItem("blueprints", JSON.stringify(updated));
    toast({
      title: "Blueprint deleted",
      description: "The blueprint has been removed.",
    });
  };

  const handleViewBlueprint = (blueprint: Blueprint) => {
    setViewingBlueprint(blueprint);
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        <div className="h-14 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Input
              value={blueprintName}
              onChange={(e) => setBlueprintName(e.target.value)}
              className="w-64 font-medium"
              placeholder="Blueprint name"
            />
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Saved ({savedBlueprints.length})
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Saved Blueprints</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <BlueprintList
                    blueprints={savedBlueprints}
                    onLoad={handleLoadBlueprint}
                    onDelete={handleDeleteBlueprint}
                    onView={handleViewBlueprint}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Blueprint
          </Button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <FieldPalette
            onFieldSelect={handleFieldSelect}
            selectedField={selectedFieldType}
          />
          <BlueprintCanvas
            fields={fields}
            onCanvasClick={handleCanvasClick}
            onFieldDelete={handleFieldDelete}
            onFieldMove={handleFieldMove}
            onFieldUpdate={handleFieldUpdate}
            selectedFieldType={selectedFieldType}
          />
        </div>
      </div>
      
      <BlueprintViewer
        blueprint={viewingBlueprint}
        open={!!viewingBlueprint}
        onClose={() => setViewingBlueprint(null)}
      />
    </AppLayout>
  );
}
