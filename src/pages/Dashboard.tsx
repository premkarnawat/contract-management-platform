import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contract, ContractStatus } from "@/types/contract";
import { format } from "date-fns";
import { Eye, Pencil, Send, XCircle, CheckCircle, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const statusFilters: { value: ContractStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "signed", label: "Signed" },
  { value: "revoked", label: "Revoked" },
];

export default function Dashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = () => {
    const saved = JSON.parse(localStorage.getItem("contracts") || "[]");
    setContracts(saved);
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    const matchesSearch =
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.blueprintName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateContractStatus = (id: string, newStatus: ContractStatus) => {
    const updated = contracts.map((c) =>
      c.id === id
        ? {
            ...c,
            status: newStatus,
            updatedAt: new Date(),
            ...(newStatus === "signed" ? { signedAt: new Date() } : {}),
          }
        : c
    );
    setContracts(updated);
    localStorage.setItem("contracts", JSON.stringify(updated));
    toast({
      title: "Contract updated",
      description: `Contract status changed to ${newStatus}.`,
    });
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const getActions = (contract: Contract) => {
    const actions: { icon: React.ElementType; label: string; onClick: () => void; variant?: "ghost" | "destructive" }[] = [
      { icon: Eye, label: "View", onClick: () => navigate(`/contracts/${contract.id}`) },
    ];

    switch (contract.status) {
      case "draft":
        actions.push(
          { icon: Pencil, label: "Edit", onClick: () => navigate(`/contracts/${contract.id}/edit`) },
          { icon: Send, label: "Send", onClick: () => updateContractStatus(contract.id, "pending") }
        );
        break;
      case "pending":
        actions.push(
          { icon: CheckCircle, label: "Mark Signed", onClick: () => updateContractStatus(contract.id, "signed") },
          { icon: XCircle, label: "Revoke", onClick: () => updateContractStatus(contract.id, "revoked"), variant: "destructive" }
        );
        break;
      case "active":
        actions.push({
          icon: XCircle,
          label: "Revoke",
          onClick: () => updateContractStatus(contract.id, "revoked"),
          variant: "destructive",
        });
        break;
      case "signed":
        // No additional actions for signed contracts
        break;
      case "revoked":
        // No actions for revoked contracts
        break;
    }

    return actions;
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Contract Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your contracts
            </p>
          </div>
          <Link to="/contracts/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Contract
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts..."
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ContractStatus | "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header">Title</TableHead>
                <TableHead className="table-header">Blueprint</TableHead>
                <TableHead className="table-header">Status</TableHead>
                <TableHead className="table-header">Created</TableHead>
                <TableHead className="table-header">Updated</TableHead>
                <TableHead className="table-header text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {contracts.length === 0
                      ? "No contracts yet. Create your first contract to get started."
                      : "No contracts match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {contract.blueprintName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={contract.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(contract.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(contract.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {getActions(contract).map((action, idx) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={idx}
                              variant={action.variant === "destructive" ? "ghost" : "ghost"}
                              size="sm"
                              onClick={action.onClick}
                              className={
                                action.variant === "destructive"
                                  ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                                  : ""
                              }
                            >
                              <Icon className="w-4 h-4" />
                              <span className="sr-only">{action.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
