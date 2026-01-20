import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
  {
    variants: {
      status: {
        signed: "bg-status-signed-bg text-status-signed",
        pending: "bg-status-pending-bg text-status-pending",
        active: "bg-status-active-bg text-status-active",
        draft: "bg-status-draft-bg text-status-draft",
        revoked: "bg-status-revoked-bg text-status-revoked",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "signed" | "pending" | "active" | "draft" | "revoked";
}

export function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  const labels: Record<string, string> = {
    signed: "Signed",
    pending: "Pending",
    active: "Active",
    draft: "Draft",
    revoked: "Revoked",
  };

  return (
    <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
      {labels[status]}
    </span>
  );
}
