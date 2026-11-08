import { Link } from 'react-router-dom';
import { APP_NAME } from '../../constants/brand';

const Footer = () => {
  return (
    <footer className="bg-surface pt-16 pb-12 border-t border-border text-xs text-ink-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-7 h-7 rounded bg-primary text-white font-serif font-bold text-sm flex items-center justify-center">
                A
              </span>
              <span className="font-serif text-lg font-bold text-ink-primary tracking-tight">
                {APP_NAME}
              </span>
            </Link>
            <p className="font-sans text-xs text-ink-secondary leading-relaxed">
              An intelligent, resume-grounded interview preparation platform built for technical candidates and engineering leaders.
            </p>
            <div className="pt-2">
              <span className="font-mono text-[10px] text-ink-muted">
                ARCHITECTURAL EDITION 2.4 &bull; 2026
              </span>
            </div>
          </div>
          
          {/* Product */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-ink-primary uppercase tracking-wider">
              Product & Suite
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="hover:text-primary transition-colors">
                  Interview Minutes & Pricing
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-primary transition-colors">
                  Resume Intelligence Engine
                </Link>
              </li>
              <li>
                <a href="#compare" className="hover:text-primary transition-colors">
                  Platform Comparison
                </a>
              </li>
              <li>
                <a href="#methodology" className="hover:text-primary transition-colors">
                  STAR Answer Methodology
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-ink-primary uppercase tracking-wider">
              Compliance & Security
            </h4>
            <ul className="space-y-2">
              <li><span className="hover:text-primary cursor-pointer transition-colors">Candidate Privacy Policy</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Refund & Minute Expiration Policy</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Data Encryption & Storage Standards</span></li>
            </ul>
          </div>

          {/* Infrastructure status */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-ink-primary uppercase tracking-wider">
              System Telemetry
            </h4>
            <div className="p-3.5 rounded bg-surface-subtle border border-border space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span>LLM PROVIDER:</span>
                <span className="text-primary font-bold">GEMINI 2.0 FLASH</span>
              </div>
              <div className="flex items-center justify-between">
                <span>DATABASE:</span>
                <span className="text-ink-primary font-bold">NEON POSTGRESQL</span>
              </div>
              <div className="flex items-center justify-between">
                <span>L1 CACHE:</span>
                <span className="text-accent font-bold">REDIS ENGINE</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom strip */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-ink-muted">
          <p>© 2026 {APP_NAME}. All engineering benchmarks and interview syllabi reserved.</p>
          <p className="font-mono">SWISS MINIMALIST INTERFACE SPECIFICATION</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
