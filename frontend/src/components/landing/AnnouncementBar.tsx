import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnnouncementBar = () => {
  return (
    <aside aria-label="Announcement" className="border-b border-border bg-surface-subtle text-ink-primary py-2 px-4 text-center text-xs">
      <Link
        to="/pricing"
        className="inline-flex items-center justify-center gap-2 text-ink-secondary hover:text-ink-primary transition-colors group"
      >
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-primary-light text-primary border border-primary-border font-semibold">
          NEW
        </span>
        <span className="font-medium">
          Verbal mock interviews with real-time speech telemetry from ₹10/min
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-accent group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </aside>
  );
};

export default AnnouncementBar;
