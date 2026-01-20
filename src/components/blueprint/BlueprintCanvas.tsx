import { BlueprintField, FieldType } from "@/types/contract";
import { useRef, useState, useCallback, useEffect } from "react";
import { CanvasField } from "./CanvasField";

interface BlueprintCanvasProps {
  fields: BlueprintField[];
  onCanvasClick: (x: number, y: number) => void;
  onFieldDelete: (id: string) => void;
  onFieldMove: (id: string, x: number, y: number) => void;
  onFieldUpdate: (id: string, updates: Partial<BlueprintField>) => void;
  selectedFieldType: FieldType | null;
}

const GRID_SIZE = 20;

const fieldSizes: Record<FieldType, { width: number; height: number }> = {
  text: { width: 200, height: 36 },
  date: { width: 150, height: 36 },
  signature: { width: 200, height: 80 },
  checkbox: { width: 28, height: 28 },
};

interface DragState {
  fieldId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export function BlueprintCanvas({
  fields,
  onCanvasClick,
  onFieldDelete,
  onFieldMove,
  onFieldUpdate,
  selectedFieldType,
}: BlueprintCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (dragState) return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapToGrid(e.clientX - rect.left);
    const y = snapToGrid(e.clientY - rect.top);
    onCanvasClick(x, y);
  };

  const handleDragStart = useCallback((e: React.MouseEvent, field: BlueprintField) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragState({
      fieldId: field.id,
      startX: field.x,
      startY: field.y,
      offsetX: e.clientX - rect.left - field.x,
      offsetY: e.clientY - rect.top - field.y,
    });
    setDragPosition({ x: field.x, y: field.y });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const field = fields.find(f => f.id === dragState.fieldId);
    if (!field) return;

    let newX = e.clientX - rect.left - dragState.offsetX;
    let newY = e.clientY - rect.top - dragState.offsetY;

    // Snap to grid
    newX = snapToGrid(newX);
    newY = snapToGrid(newY);

    // Constrain to canvas bounds
    newX = Math.max(0, Math.min(newX, 816 - field.width));
    newY = Math.max(0, Math.min(newY, 1056 - field.height));

    setDragPosition({ x: newX, y: newY });
  }, [dragState, fields]);

  const handleMouseUp = useCallback(() => {
    if (dragState && dragPosition) {
      onFieldMove(dragState.fieldId, dragPosition.x, dragPosition.y);
    }
    setDragState(null);
    setDragPosition(null);
  }, [dragState, dragPosition, onFieldMove]);

  useEffect(() => {
    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex-1 p-6 bg-muted/30 overflow-auto">
      <div
        ref={canvasRef}
        onClick={handleClick}
        className={`relative bg-canvas-bg border rounded-lg shadow-sm mx-auto ${
          selectedFieldType ? "cursor-crosshair" : "cursor-default"
        }`}
        style={{
          width: "816px",
          height: "1056px",
          backgroundImage:
            "linear-gradient(hsl(var(--canvas-grid)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--canvas-grid)) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {fields.map((field) => {
          const isDragging = dragState?.fieldId === field.id;
          const displayX = isDragging && dragPosition ? dragPosition.x : field.x;
          const displayY = isDragging && dragPosition ? dragPosition.y : field.y;
          
          return (
            <CanvasField
              key={field.id}
              field={field}
              isDragging={isDragging}
              displayX={displayX}
              displayY={displayY}
              onDelete={onFieldDelete}
              onUpdate={onFieldUpdate}
              onDragStart={handleDragStart}
            />
          );
        })}
        {fields.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">
              {selectedFieldType
                ? "Click to place the field"
                : "Select a field type from the sidebar"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { fieldSizes };
