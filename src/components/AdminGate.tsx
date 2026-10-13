import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { useIsAdmin } from "@/lib/auth";

export function AdminGate({ userId, children }: { userId: string; children: ReactNode }) {
  const { data, isLoading } = useIsAdmin(userId);
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!data)
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-3 font-semibold">Admins only</p>
        <p className="text-sm text-muted-foreground">You don't have access to this page.</p>
      </div>
    );
  return <>{children}</>;
}
