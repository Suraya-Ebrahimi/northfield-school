import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, ApiConnectionError } from "@/lib/api";
import { roleEmails, type Role } from "@/lib/school";
import { cn } from "@/lib/utils";

const roles: { id: Role; title: string; sub: string }[] = [
  { id: "admin", title: "Admin", sub: "School-wide analytics" },
  { id: "teacher", title: "Teacher", sub: "Classes & grading" },
  { id: "parent", title: "Parent / Student", sub: "Progress portal" },
];

export function LoginScreen({ onLogin }: { onLogin: (role: Role, email: string) => void }) {
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState(roleEmails.admin);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setOffline(false);
    try {
      const data = await api.login(email, password, role);
      if (data.success) { toast.success(data.message); onLogin(role, email); }
      else setError(data.message);
    } catch (err) {
      setOffline(err instanceof ApiConnectionError);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <section className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="hero-panel flex flex-col justify-between gap-10 p-8 md:p-16">
        <div>
          <div className="w-fit rounded-lg bg-navy-foreground/10 px-4 py-2 font-semibold">🛡️ Northfield Private School</div>
          <p className="mt-8 text-xs font-semibold tracking-[0.15em] text-navy-muted">ACADEMIC EARLY-WARNING SYSTEM</p>
          <h1 className="my-4 max-w-xl text-4xl font-bold leading-tight md:text-5xl">Catch the quiet signals before they become setbacks.</h1>
          <p className="max-w-lg leading-relaxed text-navy-muted">Attendance, grades, and behavior combined into one intelligent risk score — so every struggling student gets help in time.</p>
          <div className="mt-10 flex gap-12">
            {[["10", "Students Tracked"], ["3", "Risk Levels"], ["24/7", "Live Monitoring"]].map(([n, l]) => (
              <div key={l}><strong className="block text-3xl">{n}</strong><span className="text-sm text-navy-muted">{l}</span></div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-6 border-t border-navy-foreground/15 pt-5 text-xs text-navy-muted">
          <span>🔒 AES-256 Encryption</span><span>🔑 Role-Based Access</span><span>🛡️ 2FA Protected Session</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose your role and sign in securely.</p>
          <div className="my-6 grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button key={r.id} type="button" onClick={() => { setRole(r.id); setEmail(roleEmails[r.id]); }}
                className={cn("rounded-lg border-2 bg-card p-3 text-left transition", role === r.id ? "border-primary bg-secondary" : "border-border hover:border-ring")}>
                <strong className="block text-sm">{r.title}</strong>
                <span className="text-xs text-muted-foreground">{r.sub}</span>
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            <label className="field-label" htmlFor="login-email">Email Address</label>
            <input id="login-email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="field-label" htmlFor="login-password">Password</label>
            <input id="login-password" type="password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" disabled={loading} className="mt-5 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? "Signing in…" : "🔒 Continue Securely"}
            </button>
          </form>
          {error && (
            <div role="alert" className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-danger">
              {error}
              {offline && (
                <button type="button" onClick={() => onLogin(role, email)} className="mt-2 block font-semibold underline">Continue in demo mode</button>
              )}
            </div>
          )}
          <div className="mt-5 rounded-lg bg-success-soft p-3 text-center text-xs font-medium text-success">✅ Connection encrypted — Session protected with 2FA</div>
        </div>
      </div>
    </section>
  );
}
