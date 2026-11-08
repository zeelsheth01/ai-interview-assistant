function Card({ title, count, meta }: { title: string; count: number | string; meta: string }) {
  return (
    <div className="card-swiss bg-surface p-5 space-y-2 text-left shadow-subtle">
      <span className="editorial-meta text-ink-muted block">{title}</span>
      <p className="font-mono text-2xl font-bold text-ink-primary tabular-nums">{count}</p>
      <span className="text-[11px] font-mono text-ink-secondary block">{meta}</span>
    </div>
  );
}

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="PARSED RESUMES" count="1" meta="Session active" />
      <Card title="GENERATED QUESTIONS" count="10" meta="Grounded in stack" />
      <Card title="STAR READINESS" count="92%" meta="Optimal cadence" />
    </div>
  );
}
