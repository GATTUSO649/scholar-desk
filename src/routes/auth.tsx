import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type Mode = "login" | "register" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s["mode"] === "register" || s["mode"] === "forgot" ? (s["mode"] as Mode) : "login",
  }),
  head: () => ({
    meta: [
      { title: "Sign in or register — ScholarDesk" },
      { name: "description", content: "Log in to your student portal or create a ScholarDesk account." },
      { property: "og:title", content: "Sign in — ScholarDesk" },
      { property: "og:description", content: "Access your ScholarDesk student portal." },
    ],
  }),
  component: AuthPage,
});

const password = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol");

const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(100),
    reg_number: z.string().trim().min(2, "Enter your admission number").max(50),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().regex(/^\+?[0-9 ]{9,16}$/, "Enter a valid phone number, e.g. +254712345678"),
    country: z.string().trim().min(2, "Enter your country").max(60),
    institution: z.string().trim().min(2, "Enter your institution").max(120),
    course: z.string().trim().min(2, "Enter your course").max(120),
    year_of_study: z.string().trim().min(1, "Enter your year").max(20),
    password,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

const FIELDS: [keyof z.infer<typeof registerSchema>, string, string?][] = [
  ["full_name", "Full name"],
  ["reg_number", "Admission / registration number"],
  ["email", "Email", "email"],
  ["phone", "Phone number", "tel"],
  ["country", "Country"],
  ["institution", "Institution"],
  ["course", "Course / program"],
  ["year_of_study", "Year of study"],
  ["password", "Password", "password"],
  ["confirm", "Confirm password", "password"],
];

function AuthPage() {
  const { mode = "login" } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const setMode = (m: Mode) => {
    setErrors({});
    setSent(null);
    navigate({ to: "/auth", search: { mode: m }, replace: true });
  };

  async function onRegister(fd: FormData) {
    const parsed = registerSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
      return;
    }
    setErrors({});
    const { email, password: pw, confirm: _c, ...meta } = parsed.data;
    const { error } = await supabase.auth.signUp({
      email,
      password: pw,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: meta },
    });
    if (error) { toast.error(error.message); return; }
    setSent(`We sent a confirmation link to ${email}. Click it to activate your account.`);
  }

  async function onLogin(fd: FormData) {
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/dashboard" });
  }

  async function onForgot(fd: FormData) {
    const email = String(fd.get("email"));
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); return; }
    setSent(`If an account exists for ${email}, a reset link is on its way.`);
  }

  async function onGoogle() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Google sign-in failed"); return; }
    if (r.redirected) return;
    navigate({ to: "/dashboard" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (mode === "register") await onRegister(fd);
      else if (mode === "forgot") await onForgot(fd);
      else await onLogin(fd);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.2fr]">
      <aside className="hidden flex-col justify-between bg-hero p-10 text-ink-foreground lg:flex">
        <Logo light />
        <div>
          <h2 className="text-4xl font-semibold leading-tight">Your academic work, organised and supported.</h2>
          <p className="mt-4 text-ink-foreground/70">Submit requests, pay securely and follow every step from one dashboard.</p>
        </div>
        <p className="text-sm text-ink-foreground/50">Secure sign-in · Private files</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-3xl font-semibold">
            {mode === "register" ? "Create your student account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "register" ? "It takes about a minute." : mode === "forgot" ? "We'll email you a reset link." : "Log in to your student portal."}
          </p>

          {sent ? (
            <div className="mt-8 rounded-xl border bg-success/10 p-5 text-sm">{sent}</div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
              {mode === "register" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {FIELDS.map(([name, label, type]) => (
                    <div key={name} className={name === "full_name" || name === "email" ? "sm:col-span-2" : ""}>
                      <Label htmlFor={name}>{label}</Label>
                      <Input id={name} name={name} type={type ?? "text"} className="mt-1.5" />
                      {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]}</p>}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    Password: 8+ characters with uppercase, lowercase, a number and a symbol.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required className="mt-1.5" />
                  </div>
                  {mode === "login" && (
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <Input id="password" name="password" type="password" required className="mt-1.5" />
                    </div>
                  )}
                </>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? "Please wait…" : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}
              </Button>
              {mode !== "forgot" && (
                <>
                  <div className="relative py-2 text-center text-xs text-muted-foreground">
                    <span className="bg-background px-2">or</span>
                  </div>
                  <Button type="button" variant="outline" className="w-full" size="lg" onClick={onGoogle}>
                    Continue with Google
                  </Button>
                </>
              )}
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>New here? <button onClick={() => setMode("register")} className="font-semibold text-primary hover:underline">Create an account</button></>
            ) : (
              <>Already registered? <button onClick={() => setMode("login")} className="font-semibold text-primary hover:underline">Log in</button></>
            )}
          </p>
          <p className="mt-2 text-center text-xs"><Link to="/" className="text-muted-foreground hover:underline">← Back to home</Link></p>
        </div>
      </main>
    </div>
  );
}
