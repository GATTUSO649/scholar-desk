import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { RequestTable } from "@/components/RequestTable";
import { REQ_SELECT } from "@/lib/requests";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "My requests — ScholarDesk" }, { name: "description", content: "All your academic support requests." }] }),
  component: MyRequests,
});

function MyRequests() {
  const { user } = Route.useRouteContext();
  const [q, setQ] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["my-requests", user.id],
    queryFn: async () =>
      (await supabase.from("requests").select(REQ_SELECT).eq("student_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });
  const rows = data.filter((r) => `${r.title} ${r.ref}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <h1 className="text-3xl font-semibold">My requests</h1>
      <Input placeholder="Search by title or reference…" value={q} onChange={(e) => setQ(e.target.value)} className="mt-6 max-w-sm" />
      <div className="mt-6"><RequestTable rows={rows} /></div>
    </div>
  );
}
