import { BlueprintField, FieldType } from "@/types/contract";
import { Type, Calendar, PenTool, CheckSquare, X, Move, Upload, Check, Edit2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface CanvasFieldProps {
  field: BlueprintField;
  isDragging: boolean;
  displayX: number;
  displayY: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<BlueprintField>) => void;
  onDragStart: (e: React.MouseEvent, field: BlueprintField) => void;
}

const fieldIcons: Record<FieldType, React.ElementType> = {
  text: Type,
  date: Calendar,
  signature: PenTool,
  checkbox: CheckSquare,
};

export function CanvasField({
  field,
  isDragging,
  displayX,
  displayY,
  onDelete,
  onUpdate,
  onDragStart,
}: CanvasFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(field.label);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const Icon = fieldIcons[field.type];

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (field.type === 'text' || field.type === 'date') {
      setIsEditing(true);
    } else if (field.type === 'signature') {
      fileInputRef.current?.click();
    } else if (field.type === 'checkbox') {
      onUpdate(field.id, { value: !field.value });
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingLabel(true);
    setLabelValue(field.label);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelValue(e.target.value);
  };

  const handleLabelBlur = () => {
    if (labelValue.trim() !== field.label) {
      onUpdate(field.id, { label: labelValue.trim() || field.label });
    }
    setIsEditingLabel(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setLabelValue(field.label);
      setIsEditingLabel(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(field.id, { value: e.target.value });
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate(field.id, { signatureUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderFieldContent = () => {
    switch (field.type) {
      case 'text':
        if (isEditing) {
          return (
            <Input
              autoFocus
              type="text"
              value={(field.value as string) || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-full w-full text-sm border-0 bg-background/80 focus-visible:ring-1"
              placeholder="Enter text..."
            />
          );
        }
        return (
          <>
            <Icon className="w-4 h-4 text-primary/60 mr-1 flex-shrink-0" />
            <span className="text-xs text-foreground truncate">
              {field.value ? String(field.value) : field.label}
            </span>
          </>
        );

      case 'date':
        if (isEditing) {
          return (
            <Input
              autoFocus
              type="date"
              value={(field.value as string) || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-full w-full text-sm border-0 bg-background/80 focus-visible:ring-1"
            />
          );
        }
        return (
          <>
            <Icon className="w-4 h-4 text-primary/60 mr-1 flex-shrink-0" />
            <span className="text-xs text-foreground truncate">
              {field.value ? String(field.value) : field.label}
            </span>
          </>
        );

      case 'signature':
        return (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
              className="hidden"
            />
            {field.signatureUrl ? (
              <img
                src={field.signatureUrl}
                alt="Signature"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs">Click to upload</span>
              </div>
            )}
            {isEditingLabel ? (
              <Input
                ref={labelInputRef}
                autoFocus
                type="text"
                value={labelValue}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute -bottom-6 left-0 right-0 h-5 text-xs px-1 py-0 border border-primary"
                style={{ zIndex: 1000 }}
              />
            ) : (
              <div 
                className="absolute -bottom-5 left-0 right-0 text-[10px] text-muted-foreground truncate px-1 cursor-pointer hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingLabel(true);
                  setLabelValue(field.label);
                }}
                title="Click to edit label"
              >
                {field.label}
              </div>
            )}
          </>
        );

      case 'checkbox':
        return (
          <>
            <div 
              className={`w-full h-full rounded border-2 flex items-center justify-center transition-colors ${
                field.value 
                  ? 'bg-primary border-primary' 
                  : 'bg-background border-muted-foreground/30 hover:border-primary/50'
              }`}
            >
              {field.value && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>
            {isEditingLabel ? (
              <Input
                ref={labelInputRef}
                autoFocus
                type="text"
                value={labelValue}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute -bottom-6 left-0 right-0 h-5 text-xs px-1 py-0 border border-primary"
                style={{ zIndex: 1000 }}
              />
            ) : (
              <div 
                className="absolute -bottom-5 left-0 right-0 text-[10px] text-muted-foreground truncate px-1 cursor-pointer hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingLabel(true);
                  setLabelValue(field.label);
                }}
                title="Click to edit label"
              >
                {field.label}
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  // Update label value when field.label changes externally
  useEffect(() => {
    if (field.label !== labelValue && !isEditingLabel) {
      setLabelValue(field.label);
    }
  }, [field.label, isEditingLabel]);

  return (
    <div
      className={`canvas-field group ${isDragging ? "ring-2 ring-primary shadow-lg z-50" : ""} ${
        field.type === 'checkbox' || field.type === 'signature' ? 'pb-6' : ''
      }`}
      style={{
        left: displayX,
        top: displayY,
        width: field.width,
        height: field.height,
        cursor: isDragging ? "grabbing" : isEditing || isEditingLabel ? "text" : "grab",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => !isEditing && !isEditingLabel && onDragStart(e, field)}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
    >
      {!isEditing && field.type !== 'signature' && field.type !== 'checkbox' && (
        <Move className="w-3 h-3 text-muted-foreground/50 mr-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      )}
      
      {field.type !== 'checkbox' && field.type !== 'signature' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditingLabel(true);
            setLabelValue(field.label);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute -top-5 left-0 w-4 h-4 bg-primary text-primary-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
          title="Edit label"
        >
          <Edit2 className="w-2.5 h-2.5" />
        </button>
      )}
      
      {field.type !== 'checkbox' && field.type !== 'signature' && isEditingLabel && (
        <Input
          ref={labelInputRef}
          autoFocus
          type="text"
          value={labelValue}
          onChange={handleLabelChange}
          onBlur={handleLabelBlur}
          onKeyDown={handleLabelKeyDown}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute -top-6 left-0 right-0 h-5 text-xs px-1 py-0 border border-primary bg-background"
          style={{ zIndex: 1000 }}
        />
      )}
      
      {renderFieldContent()}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(field.id);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}