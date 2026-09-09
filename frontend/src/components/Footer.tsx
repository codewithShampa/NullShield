import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { ExternalLink, ShieldCheck, Terminal, Code2 } from 'lucide-react';
import { config } from '../config';

/**
 * Footer component - auto-documented
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container transition-all duration-300 ease-in-out">
      <div className="footer-content">
        {/* Brand Column */}
        <div>
          <Logo size={28} variant="full" className="mb-md" />
          <p className="text-secondary text-sm mb-lg max-w-sm antialiased tracking-tight">
            Institutional zero-knowledge confidential voting and governance protocol on the Midnight blockchain. 
            Cryptographically proving ballot integrity without exposing voter identity.
          </p>
          <div className="flex items-center gap-2">
            <span className="nav-status-pill text-xs">
              <span className="nav-status-dot" />
              Preprod Network Verified
            </span>
          </div>
        </div>

        {/* Protocol Links */}
        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-md">
            Protocol
          </h4>
          <ul className="flex flex-col gap-2 text-sm text-secondary">
            <li><Link to="/vote" className="hover:text-accent focus:outline-none focus:ring-2 focus:ring-primary/50">Anonymous Voting</Link></li>
            <li><Link to="/results" className="hover:text-accent">Verifiable Results</Link></li>
            <li><Link to="/admin" className="hover:text-accent">Admin Console</Link></li>
            <li><Link to="/about" className="hover:text-accent">Zero-Knowledge Specs</Link></li>
          </ul>
        </div>

        {/* Midnight Network Explorer Links */}
        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-md">
            Midnight Links
          </h4>
          <ul className="flex flex-col gap-2 text-sm text-secondary">
            <li>
              <a 
                href={`https://explorer.1am.xyz/contract/${config.contractAddress}?network=preprod`}
                target="_blank" 
                rel="noreferrer"
                className="hover:text-accent inline-flex items-center gap-1"
              >
                1AM Contract Explorer <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a 
                href="https://docs.midnight.network" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-accent inline-flex items-center gap-1"
              >
                Midnight Docs <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/codePaji/nullshield" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-accent inline-flex items-center gap-1"
              >
                GitHub Repository <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>

        {/* Security & Audit */}
        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-md">
            Security & Audit
          </h4>
          <ul className="flex flex-col gap-2 text-sm text-secondary">
            <li className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck size={14} /> Formal Audit Completed
            </li>
            <li>Compact Compiler: v0.31.0</li>
            <li>ZK Proof Engine: ZK-SNARKs</li>
            <li>Sybil Resistance: Nullifiers</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {currentYear} NullShield Protocol. Open source under Apache-2.0. Built for Midnight Network.
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-muted">
          <span>COMMIT: b0e97ce</span>
          <span>PREPROD NETWORK</span>
        </div>
      </div>
    </footer>
  );
}

// Code cleanup 60
