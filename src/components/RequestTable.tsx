import { Link } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
import { StatusBadge, PayBadge } from "@/components/StatusBadge";
import { fmtDate, money } from "@/lib/requests";
import type { RequestStatus, PaymentStatus } from "@/lib/status";

export type Row = {
  id: string; ref: string; title: string; status: RequestStatus; payment_status: PaymentStatus;
  deadline: string | null; price: number | null; currency: string; services: { name: string } | null;
  profiles?: { full_name: string } | null;
};

export function RequestTable({ rows, admin = false }: { rows: Row[]; admin?: boolean }) {
  if (!rows.length)
    return (
      <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
        <FolderOpen className="mx-auto h-8 w-8" />
        <p className="mt-3 text-sm">No requests yet.</p>
      </div>
    );
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <ul className="divide-y">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              to={admin ? "/manage/$id" : "/request/$id"}
              params={{ id: r.id }}
              className="grid gap-2 px-5 py-4 transition-colors hover:bg-muted sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-6"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.ref} · {r.services?.name ?? "General"}{admin && r.profiles ? ` · ${r.profiles.full_name}` : ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Due {fmtDate(r.deadline)}</p>
              <p className="text-sm font-medium">{money(r.price, r.currency)}</p>
              <div className="flex gap-2"><StatusBadge status={r.status} /><PayBadge status={r.payment_status} /></div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
