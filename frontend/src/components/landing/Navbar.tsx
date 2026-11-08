import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { APP_NAME } from '../../constants/brand';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Lockup */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="w-8 h-8 rounded bg-primary text-white font-serif font-bold text-lg flex items-center justify-center group-hover:bg-primary-hover transition-colors">
                A
              </span>
              <div className="flex flex-col text-left">
                <span className="font-serif text-xl font-bold text-ink-primary tracking-tight leading-none">
                  {APP_NAME}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted mt-0.5">
                  Editorial Career Tech
                </span>
              </div>
            </Link>
          </div>

          {/* Editorial Nav Links */}
          <div className="hidden md:flex space-x-8 items-center font-sans text-xs font-semibold tracking-wider uppercase text-ink-secondary">
            <a href="#features" className="hover:text-primary transition-colors">Platform</a>
            <a href="#methodology" className="hover:text-primary transition-colors">Methodology</a>
            <Link to="/pricing" className="hover:text-primary transition-colors">Minutes & Pricing</Link>
            <a href="#compare" className="hover:text-primary transition-colors">Compare</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/auth/signin"
              className="text-ink-secondary hover:text-ink-primary text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth/signup"
              className="btn-primary text-xs !min-h-[40px] !px-4"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-ink-secondary hover:text-ink-primary border border-border rounded"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-surface border-b border-border shadow-elevated">
          <div className="px-4 pt-3 pb-6 space-y-2">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle"
            >
              Platform Overview
            </a>
            <a
              href="#methodology"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle"
            >
              STAR Methodology
            </a>
            <Link
              to="/pricing"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle"
            >
              Pricing & Voice Packs
            </Link>
            <a
              href="#compare"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle"
            >
              Benchmark Comparison
            </a>
            <div className="pt-4 flex flex-col gap-2.5 border-t border-border">
              <Link
                to="/auth/signin"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 border border-border text-ink-primary rounded text-xs font-semibold uppercase tracking-wider hover:bg-surface-subtle transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full text-center text-xs"
              >
                Create Candidate Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
