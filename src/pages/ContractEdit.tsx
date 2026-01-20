import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contract, Blueprint, BlueprintField } from "@/types/contract";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Send, Upload } from "lucide-react";

export default function ContractEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [contractTitle, setContractTitle] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string | boolean>>({});
  const [signatureUrls, setSignatureUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const contracts: Contract[] = JSON.parse(localStorage.getItem("contracts") || "[]");
    const found = contracts.find((c) => c.id === id);
    
    if (found) {
      setContract(found);
      setContractTitle(found.title);
      setFieldValues(found.fieldValues || {});

      const blueprints: Blueprint[] = JSON.parse(localStorage.getItem("blueprints") || "[]");
      const bp = blueprints.find((b) => b.id === found.blueprintId);
      setBlueprint(bp || null);

      // Extract signature URLs from blueprint fields
      if (bp) {
        const sigs: Record<string, string> = {};
        bp.fields.forEach((f) => {
          if (f.type === "signature" && f.signatureUrl) {
            sigs[f.id] = f.signatureUrl;
          }
        });
        setSignatureUrls(sigs);
      }
    }
  }, [id]);

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
    const isDisabled = contract?.status !== "draft";

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
                {!isDisabled && (
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
                )}
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

  const handleSave = (status: "draft" | "pending") => {
    if (!contract || !contractTitle) {
      toast({
        title: "Missing information",
        description: "Please enter a contract title.",
        variant: "destructive",
      });
      return;
    }

    const contracts: Contract[] = JSON.parse(localStorage.getItem("contracts") || "[]");
    const updated = contracts.map((c) =>
      c.id === contract.id
        ? {
            ...c,
            title: contractTitle,
            status,
            fieldValues,
            updatedAt: new Date(),
          }
        : c
    );
    localStorage.setItem("contracts", JSON.stringify(updated));

    toast({
      title: status === "draft" ? "Draft saved" : "Sent for confirmation",
      description: status === "draft" ? "Contract draft has been saved." : "Contract has been sent for confirmation.",
    });

    navigate("/");
  };

  if (!contract) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Contract not found.</p>
          <Button variant="link" onClick={() => navigate("/")}>
            Go back to dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (contract.status !== "draft") {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Only draft contracts can be edited.</p>
          <Button variant="link" onClick={() => navigate(`/contracts/${contract.id}`)}>
            View contract
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Edit Contract</h1>
          <p className="text-muted-foreground mt-1">
            Blueprint: {contract.blueprintName}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contract Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title</Label>
                <Input
                  id="title"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  placeholder="Enter contract title"
                />
              </div>
            </CardContent>
          </Card>

          {blueprint && blueprint.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contract Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blueprint.fields.map(renderField)}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => handleSave("draft")} className="gap-2">
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave("pending")} className="gap-2">
              <Send className="w-4 h-4" />
              Send for confirmation
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
