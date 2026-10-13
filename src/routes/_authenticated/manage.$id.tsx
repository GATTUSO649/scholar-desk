import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AdminGate } from "@/components/AdminGate";
import { RequestSummary, useRequest } from "@/components/RequestDetail";
import { STATUS_LABEL, STATUS_ORDER, type PaymentStatus, type RequestStatus } from "@/lib/status";
import { uploadFiles } from "@/lib/requests";

export const Route = createFileRoute("/_authenticated/manage/$id")({
  head: () => ({ meta: [{ title: "Manage request — ScholarDesk" }, { name: "description", content: "Admin request workspace." }] }),
  component: () => {
    const { user } = Route.useRouteContext();
    return <AdminGate userId={user.id}><Manage /></AdminGate>;
  },
});

const CURRENCIES = ["USD", "KES", "GBP", "EUR"];
const PAYS: PaymentStatus[] = ["unpaid", "pending", "paid", "refunded"];

function Manage() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data, isLoading } = useRequest(id);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const studentId = data?.req?.student_id;
  const { data: student } = useQuery({
    queryKey: ["profile", studentId],
    enabled: !!studentId,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", studentId!).maybeSingle()).data,
  });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!data?.req) return <p>Not found.</p>;
  const r = data.req;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const status = fd.get("status") as RequestStatus;
    const payment_status = fd.get("payment_status") as PaymentStatus;
    const priceRaw = String(fd.get("price") ?? "");
    const price = priceRaw === "" ? null : Number(priceRaw);
    if (price != null && (isNaN(price) || price < 0)) { toast.error("Invalid price"); return; }
    const note = String(fd.get("note") ?? "").trim().slice(0, 2000);
    const grade = String(fd.get("grade") ?? "").trim().slice(0, 20) || null;
    const admin_feedback = String(fd.get("admin_feedback") ?? "").trim().slice(0, 4000) || null;
    const gradeChanged = grade !== (r!.grade ?? null) || admin_feedback !== (r!.admin_feedback ?? null);
    setBusy(true);
    const { error } = await supabase.from("requests").update({
      status, payment_status, price, currency: String(fd.get("currency")), admin_notes: String(fd.get("admin_notes") ?? ""),
      grade, admin_feedback,
      ...(gradeChanged ? { graded_at: grade || admin_feedback ? new Date().toISOString() : null, graded_by: grade || admin_feedback ? user.id : null } : {}),
    }).eq("id", id);
    if (!error && (status !== r!.status || note)) {
      await supabase.from("request_updates").insert({ request_id: id, status: status !== r!.status ? status : null, note: note || null, created_by: user.id });
    }
    if (!error && files.length && studentId) {
      await uploadFiles(id, studentId, files, "delivery");
      setFiles([]);
    }
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["request", id] });
    qc.invalidateQueries({ queryKey: ["admin-requests"] });
    (e.target as HTMLFormElement).querySelector<HTMLTextAreaElement>("#note")!.value = "";
    toast.success("Saved");
  }

  return (
    <div className="space-y-6">
      <Link to="/admin" className="text-sm text-muted-foreground hover:underline">← All requests</Link>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <RequestSummary data={data} />
        <aside className="space-y-6">
          {student && (
            <div className="rounded-2xl border bg-card p-5 text-sm shadow-soft">
              <h2 className="font-semibold">Student</h2>
              <p className="mt-2 font-medium">{student.full_name}</p>
              <p className="text-muted-foreground">{student.email}</p>
              <p className="text-muted-foreground">{student.phone}</p>
              <p className="mt-2 text-xs text-muted-foreground">{student.institution} · {student.course} · Year {student.year_of_study}</p>
            </div>
          )}
          <form onSubmit={save} key={r.updated_at} className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="font-semibold">Update request</h2>
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={r.status} className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {[...STATUS_ORDER, "cancelled" as const].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-[1fr_90px] gap-2">
              <div><Label htmlFor="price">Quote</Label><Input id="price" name="price" type="number" step="0.01" min={0} defaultValue={r.price ?? ""} className="mt-1.5" /></div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select id="currency" name="currency" defaultValue={r.currency} className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="payment_status">Payment</Label>
              <select id="payment_status" name="payment_status" defaultValue={r.payment_status} className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize">
                {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><Label htmlFor="grade">Grade</Label><Input id="grade" name="grade" maxLength={20} placeholder="e.g. A, 78/100" defaultValue={r.grade ?? ""} className="mt-1.5" /></div>
            <div><Label htmlFor="admin_feedback">Feedback to student</Label><Textarea id="admin_feedback" name="admin_feedback" rows={3} defaultValue={r.admin_feedback ?? ""} className="mt-1.5" /></div>
            <div><Label htmlFor="note">Message to student (optional)</Label><Textarea id="note" name="note" rows={3} className="mt-1.5" /></div>
            <div><Label htmlFor="admin_notes">Internal notes</Label><Textarea id="admin_notes" name="admin_notes" rows={2} defaultValue={r.admin_notes ?? ""} className="mt-1.5" /></div>
            <div>
              <Label>Upload completed work</Label>
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                <Upload className="h-4 w-4" /> {files.length ? `${files.length} file(s) selected` : "Choose files"}
                <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
              </label>
            </div>
            <Button className="w-full" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
