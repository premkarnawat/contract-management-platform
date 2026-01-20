import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Blueprint, BlueprintField, Contract } from "@/types/contract";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, Send, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContractCreation() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("");
  const [contractTitle, setContractTitle] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});
  const [signatureUrls, setSignatureUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("blueprints") || "[]");
    setBlueprints(saved);
  }, []);

  const selectedBlueprint = blueprints.find((bp) => bp.id === selectedBlueprintId);

  const handleBlueprintChange = (id: string) => {
    setSelectedBlueprintId(id);
    setFieldValues({});
  };

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSignatureUpload = (fieldId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSignatureUrls((prev) => ({ ...prev, [fieldId]: reader.result as string }));
      setFieldValues((prev) => ({ ...prev, [fieldId]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const renderField = (field: BlueprintField) => {
    const isDisabled = false; // Would be true for locked/revoked contracts

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              value={(fieldValues[field.id] as string) || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={isDisabled}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );
      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="date"
              value={(fieldValues[field.id] as string) || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={isDisabled}
            />
          </div>
        );
      case "signature":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            {signatureUrls[field.id] ? (
              <div className="space-y-2">
                <img 
                  src={signatureUrls[field.id]} 
                  alt="Signature" 
                  className="h-20 border rounded bg-white p-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSignatureUrls((prev) => {
                      const updated = { ...prev };
                      delete updated[field.id];
                      return updated;
                    });
                    setFieldValues((prev) => {
                      const updated = { ...prev };
                      delete updated[field.id];
                      return updated;
                    });
                  }}
                >
                  Remove Signature
                </Button>
              </div>
            ) : (
              <label className="h-20 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isDisabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSignatureUpload(field.id, file);
                  }}
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  Click to upload signature
                </div>
              </label>
            )}
          </div>
        );
      case "checkbox":
        return (
          <div key={field.id} className="flex items-center gap-3">
            <Checkbox
              id={field.id}
              checked={(fieldValues[field.id] as boolean) || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, !!checked)}
              disabled={isDisabled}
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label}
            </Label>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSaveDraft = () => {
    if (!selectedBlueprint || !contractTitle) {
      toast({
        title: "Missing information",
        description: "Please select a blueprint and enter a contract title.",
        variant: "destructive",
      });
      return;
    }

    const contract: Contract = {
      id: `contract-${Date.now()}`,
      blueprintId: selectedBlueprint.id,
      blueprintName: selectedBlueprint.name,
      title: contractTitle,
      status: "draft",
      parties: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      fieldValues,
    };

    const contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
    contracts.push(contract);
    localStorage.setItem("contracts", JSON.stringify(contracts));

    toast({
      title: "Draft saved",
      description: "Contract draft has been saved.",
    });

    navigate("/");
  };

  const handleSendForSignature = () => {
    if (!selectedBlueprint || !contractTitle) {
      toast({
        title: "Missing information",
        description: "Please select a blueprint and enter a contract title.",
        variant: "destructive",
      });
      return;
    }

    const contract: Contract = {
      id: `contract-${Date.now()}`,
      blueprintId: selectedBlueprint.id,
      blueprintName: selectedBlueprint.name,
      title: contractTitle,
      status: "pending",
      parties: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      fieldValues,
    };

    const contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
    contracts.push(contract);
    localStorage.setItem("contracts", JSON.stringify(contracts));

    toast({
      title: "Sent for confirmation",
      description: "Contract has been sent for confirmation.",
    });

    navigate("/");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create New Contract</h1>
          <p className="text-muted-foreground mt-1">
            Select a blueprint and fill in the contract details
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title</Label>
                <Input
                  id="title"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  placeholder="Enter contract title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blueprint">Blueprint</Label>
                <Select value={selectedBlueprintId} onValueChange={handleBlueprintChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a blueprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {blueprints.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No blueprints available. Create one first.
                      </div>
                    ) : (
                      blueprints.map((bp) => (
                        <SelectItem key={bp.id} value={bp.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {bp.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedBlueprint && selectedBlueprint.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contract Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedBlueprint.fields.map(renderField)}
              </CardContent>
            </Card>
          )}

          {selectedBlueprint && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                <Save className="w-4 h-4" />
                Save as Draft
              </Button>
              <Button onClick={handleSendForSignature} className="gap-2">
                <Send className="w-4 h-4" />
                Send for confirmation
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
