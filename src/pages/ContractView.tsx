import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Contract, Blueprint, BlueprintField } from "@/types/contract";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Send, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContractView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  useEffect(() => {
    const contracts: Contract[] = JSON.parse(localStorage.getItem("contracts") || "[]");
    const found = contracts.find((c) => c.id === id);
    setContract(found || null);

    if (found) {
      const blueprints: Blueprint[] = JSON.parse(localStorage.getItem("blueprints") || "[]");
      const bp = blueprints.find((b) => b.id === found.blueprintId);
      setBlueprint(bp || null);
    }
  }, [id]);

  const updateContractStatus = (newStatus: Contract["status"]) => {
    if (!contract) return;

    const contracts: Contract[] = JSON.parse(localStorage.getItem("contracts") || "[]");
    const updated = contracts.map((c) =>
      c.id === contract.id
        ? {
            ...c,
            status: newStatus,
            updatedAt: new Date(),
            ...(newStatus === "signed" ? { signedAt: new Date() } : {}),
          }
        : c
    );
    localStorage.setItem("contracts", JSON.stringify(updated));
    setContract({ ...contract, status: newStatus, updatedAt: new Date() });
    toast({
      title: "Contract updated",
      description: `Contract status changed to ${newStatus}.`,
    });
  };

  const renderFieldValue = (field: BlueprintField) => {
    const value = contract?.fieldValues[field.id];

    switch (field.type) {
      case "checkbox":
        return (
          <div key={field.id} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${value ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
              {value && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
            </div>
            <span className="text-sm">{field.label}</span>
          </div>
        );
      case "signature":
        return (
          <div key={field.id} className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
            {field.signatureUrl ? (
              <img src={field.signatureUrl} alt="Signature" className="h-16 border rounded" />
            ) : (
              <div className="h-16 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground text-sm">
                No signature
              </div>
            )}
          </div>
        );
      default:
        return (
          <div key={field.id} className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
            <p className="text-sm">{value?.toString() || "—"}</p>
          </div>
        );
    }
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

  const canEdit = contract.status === "draft";
  const canSend = contract.status === "draft";
  const canSign = contract.status === "pending";
  const canRevoke = contract.status === "pending" || contract.status === "active";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{contract.title}</h1>
            <p className="text-muted-foreground mt-1">
              Blueprint: {contract.blueprintName}
            </p>
          </div>
          <StatusBadge status={contract.status} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{format(new Date(contract.createdAt), "MMM d, yyyy HH:mm")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{format(new Date(contract.updatedAt), "MMM d, yyyy HH:mm")}</p>
              </div>
              {contract.signedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Signed At</p>
                  <p className="text-sm">{format(new Date(contract.signedAt), "MMM d, yyyy HH:mm")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {blueprint && blueprint.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Field Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blueprint.fields.map(renderFieldValue)}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-end">
            {canEdit && (
              <Button variant="outline" onClick={() => navigate(`/contracts/${contract.id}/edit`)} className="gap-2">
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
            {canSend && (
              <Button onClick={() => updateContractStatus("pending")} className="gap-2">
                <Send className="w-4 h-4" />
                Send for confirmation
              </Button>
            )}
            {canSign && (
              <Button onClick={() => updateContractStatus("signed")} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Mark as Signed
              </Button>
            )}
            {canRevoke && (
              <Button variant="destructive" onClick={() => updateContractStatus("revoked")} className="gap-2">
                <XCircle className="w-4 h-4" />
                Revoke
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
