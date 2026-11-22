import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { calculateRisk, initialStudents, interventions, type RiskLevel, type Role, type Student } from "@/lib/school";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "early-warning" | "students" | "grading";
const tabs: { id: Tab; label: string; icon: string; subtitle: string }[] = [
  { id: "dashboard", label: "Analytics Dashboard", icon: "📊", subtitle: "Real-time academic performance and early-warning overview" },
  { id: "early-warning", label: "Early-Warning Center", icon: "🚨", subtitle: "Every student ranked by automatic risk scoring" },
  { id: "students", label: "Student Directory", icon: "👨‍🎓", subtitle: "Academic and fee records" },
  { id: "grading", label: "Attendance & Grading", icon: "📝", subtitle: "Update records and recalculate risk live" },
];
const roleLabel: Record<Role, string> = { admin: "Admin Portal", teacher: "Teacher Portal", parent: "Parent / Student Portal" };

function RiskBadge({ level, children }: { level: RiskLevel; children?: React.ReactNode }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold", `badge-risk-${level}`)}>{children ?? level}</span>;
}

async function send(promise: ReturnType<typeof api.login>) {
  try {
    const r = await promise;
    if (r.success) toast.success(r.message); else toast.error(r.message);
  } catch (e) {
    toast.warning("Saved locally only", { description: e instanceof Error ? e.message : undefined });
  }
}

export function Dashboard({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const [query, setQuery] = useState("");
  const [modalId, setModalId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>(interventions[0]!);
  const canEdit = role !== "parent";
  const visibleTabs = tabs.filter((t) => canEdit || t.id !== "grading");
  const current = tabs.find((t) => t.id === tab)!;

  const withRisk = useMemo(() => students.map((s) => ({ ...s, risk: calculateRisk(s) })), [students]);
  const total = students.length;
  const avgAtt = Math.round(students.reduce((a, s) => a + s.attendance, 0) / total);
  const avgScore = Math.round(students.reduce((a, s) => a + s.avgScore, 0) / total);
  const highRisk = withRisk.filter((s) => s.risk.level === "High");

  const [gradeId, setGradeId] = useState(students[0]!.id);
  const sel = students.find((s) => s.id === gradeId)!;
  const [form, setForm] = useState({ attendance: String(sel.attendance), avgScore: String(sel.avgScore), flags: String(sel.flags) });
  function pickStudent(id: string) {
    const s = students.find((x) => x.id === id)!;
    setGradeId(id); setForm({ attendance: String(s.attendance), avgScore: String(s.avgScore), flags: String(s.flags) });
  }
  async function saveGrades(e: FormEvent) {
    e.preventDefault();
    const data = { attendance: Number(form.attendance), avgScore: Number(form.avgScore), flags: Number(form.flags) };
    setStudents((list) => list.map((s) => (s.id === gradeId ? { ...s, ...data } : s)));
    await send(api.updateStudent(gradeId, data));
  }
  async function saveIntervention() {
    if (!modalId) return;
    const id = modalId;
    setStudents((list) => list.map((s) => (s.id === id ? { ...s, intervention: plan } : s)));
    setModalId(null);
    await send(api.assignIntervention(id, plan));
  }
  const modalStudent = students.find((s) => s.id === modalId);

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <aside className="flex flex-col justify-between bg-navy-deep p-6 text-navy-foreground">
        <div>
          <h3 className="mb-2 text-lg font-bold">🛡️ Northfield AEWS</h3>
          <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-navy-muted">{roleLabel[role]}</span>
          <nav className="mt-8 flex flex-col gap-1">
            {visibleTabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("rounded-lg px-4 py-3 text-left text-sm font-medium transition", tab === t.id ? "bg-navy-foreground/10 text-navy-foreground" : "text-navy-muted hover:bg-navy-foreground/10")}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onLogout} className="mt-8 rounded-lg border border-navy-foreground/25 px-4 py-2.5 text-sm font-medium">🚪 Sign Out / Switch Role</button>
      </aside>

      <main className="overflow-x-auto p-6 md:p-8">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-2xl font-bold">{current.label}</h2><p className="text-sm text-muted-foreground">{current.subtitle}</p></div>
          <span className="rounded-full bg-success-soft px-3.5 py-1.5 text-xs font-semibold text-success">🟢 Secure Session Active</span>
        </header>

        {tab === "dashboard" && (
          <>
            <div className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total Enrolled Students", total, "Active Academic Term", "text-success"],
                ["Average Attendance Rate", `${avgAtt}%`, "Target threshold: ≥ 85%", "text-muted-foreground"],
                ["School Average Score", `${avgScore}%`, "Passing threshold: ≥ 65%", "text-muted-foreground"],
                ["High-Risk Students (Alert)", highRisk.length, "Immediate intervention needed", "text-danger"],
              ].map(([l, v, n, c], i) => (
                <div key={String(l)} className={cn("rounded-xl border bg-card p-5", i === 3 && "border-l-4 border-l-danger")}>
                  <span className="text-sm text-muted-foreground">{l}</span>
                  <h3 className="my-1.5 text-3xl font-bold">{v}</h3>
                  <small className={String(c)}>{n}</small>
                </div>
              ))}
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">⚠️ Priority Early-Warning Alerts</h3><span className="text-sm text-muted-foreground">Flagged by the risk scoring algorithm</span></div>
              <div className="space-y-3">
                {highRisk.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4">
                    <div><strong>🚨 {s.name} ({s.id} - {s.gradeLevel})</strong><p className="text-sm text-muted-foreground">Trigger: {s.risk.trigger} | Attendance: {s.attendance}% | Score: {s.avgScore}%</p></div>
                    <RiskBadge level="High">{s.intervention}</RiskBadge>
                  </div>
                ))}
                {highRisk.length === 0 && <p className="text-sm text-muted-foreground">No high-risk students right now.</p>}
              </div>
            </div>
          </>
        )}

        {tab === "early-warning" && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {(["all", "High", "Moderate", "Low"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg border px-4 py-2 text-sm font-medium", filter === f ? "bg-primary text-primary-foreground" : "bg-card")}>
                  {f === "all" ? "All Students" : `${f === "High" ? "🔴" : f === "Moderate" ? "🟡" : "🟢"} ${f} Risk`}
                </button>
              ))}
            </div>
            <Table head={["Student ID", "Full Name", "Grade", "Attendance", "Avg Score", "Risk", "Primary Trigger", "Intervention Plan"]}>
              {withRisk.filter((s) => filter === "all" || s.risk.level === filter).map((s) => (
                <tr key={s.id} className="border-b">
                  <Td><strong>{s.id}</strong></Td><Td>{s.name}</Td><Td>{s.gradeLevel}</Td><Td>{s.attendance}%</Td><Td>{s.avgScore}%</Td>
                  <Td><RiskBadge level={s.risk.level}>{s.risk.level} Risk</RiskBadge></Td><Td>{s.risk.trigger}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">{s.intervention}
                      {canEdit && s.risk.level !== "Low" && (
                        <button onClick={() => { setModalId(s.id); setPlan(interventions[0]!); }} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary">Assign Plan</button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </>
        )}

        {tab === "students" && (
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold">Student Academic & Fee Records</h3>
              <input className="field max-w-xs" placeholder="Search by student name or ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Table bare head={["ID", "Student Name", "Class", "Attendance", "Current Avg", "Behavior Flags", "Fee Status", "Risk Level"]}>
              {withRisk.filter((s) => (s.name + s.id).toLowerCase().includes(query.toLowerCase())).map((s) => (
                <tr key={s.id} className="border-b">
                  <Td>{s.id}</Td><Td><strong>{s.name}</strong></Td><Td>{s.gradeLevel}</Td><Td>{s.attendance}%</Td><Td>{s.avgScore}%</Td><Td>{s.flags}</Td>
                  <Td><span className={cn(s.feeStatus === "Overdue" && "font-semibold text-danger", s.feeStatus === "Pending" && "text-warning")}>{s.feeStatus}</span></Td>
                  <Td><RiskBadge level={s.risk.level} /></Td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {tab === "grading" && canEdit && (
          <div className="max-w-3xl rounded-xl border bg-card p-6">
            <h3 className="font-bold">Update Student Grade & Attendance</h3>
            <p className="text-sm text-muted-foreground">Change a student's numbers and the risk level recalculates automatically.</p>
            <form onSubmit={saveGrades} className="mt-2 grid gap-x-4 sm:grid-cols-2">
              <div><label className="field-label" htmlFor="g-student">Select Student</label>
                <select id="g-student" className="field" value={gradeId} onChange={(e) => pickStudent(e.target.value)}>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id} - {s.gradeLevel})</option>)}
                </select></div>
              {([["attendance", "Attendance Percentage (%)", 100], ["avgScore", "Average Exam Score (%)", 100], ["flags", "Behavior Incident Flags", 10]] as const).map(([k, l, max]) => (
                <div key={k}><label className="field-label" htmlFor={`g-${k}`}>{l}</label>
                  <input id={`g-${k}`} type="number" min={0} max={max} required className="field" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
              ))}
              <div className="mt-5 flex flex-wrap items-center gap-4 sm:col-span-2">
                <button type="submit" className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90">💾 Save & Recalculate Risk Score</button>
                <span className="text-sm">Current: <RiskBadge level={calculateRisk(sel).level} /></span>
              </div>
            </form>
          </div>
        )}
      </main>

      {modalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setModalId(null)}>
          <div role="dialog" className="w-full max-w-md rounded-xl bg-card p-7" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Assign Academic Intervention</h3>
            <p className="text-sm text-muted-foreground">{modalStudent.name} ({modalStudent.id}) — {calculateRisk(modalStudent).trigger}</p>
            <label className="field-label" htmlFor="plan">Select Action Plan</label>
            <select id="plan" className="field" value={plan} onChange={(e) => setPlan(e.target.value)}>
              {interventions.map((i) => <option key={i}>{i}</option>)}
            </select>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalId(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button onClick={saveIntervention} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Confirm Intervention</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Table({ head, children, bare }: { head: string[]; children: React.ReactNode; bare?: boolean }) {
  return (
    <div className={cn("overflow-x-auto", !bare && "rounded-xl border bg-card p-4")}>
      <table className="w-full border-collapse text-sm">
        <thead><tr>{head.map((h) => <th key={h} className="border-b bg-muted px-3 py-3 text-left font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Td({ children }: { children?: React.ReactNode }) { return <td className="px-3 py-3.5 align-middle">{children}</td>; }
