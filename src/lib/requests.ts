import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const REQ_SELECT = "*, services(name)";

export async function openFile(path: string) {
  const { data, error } = await supabase.storage.from("assignment-files").createSignedUrl(path, 120);
  if (error || !data) { toast.error("Could not open file"); return; }
  window.open(data.signedUrl, "_blank", "noopener");
}

export async function uploadFiles(requestId: string, userId: string, files: File[], kind: "submission" | "delivery") {
  for (const f of files) {
    const safe = f.name.replace(/[^\w.\-]/g, "_");
    const path = `${userId}/${requestId}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from("assignment-files").upload(path, f);
    if (error) {
      toast.error(`Upload failed: ${f.name}`);
      continue;
    }
    await supabase.from("request_files").insert({ request_id: requestId, uploaded_by: userId, path, name: f.name, kind });
  }
}

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export const money = (n?: number | null, c = "USD") =>
  n == null ? "—" : new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(Number(n));
