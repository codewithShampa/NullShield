import React from 'react';
import { EyeOff, Fingerprint, ShieldCheck, FileCheck2, Code, Sparkles } from 'lucide-react';

interface BentoGridProps {
  className?: string;
}

/**
 * BentoGrid component - auto-documented
 */
export default function BentoGrid({ className = '' }: BentoGridProps) {
  return (
    <section className={`mb-2xl ${className}`}>
      <div className="text-center max-w-xl mx-auto mb-xl antialiased tracking-tight transition-all duration-300 ease-in-out">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium mb-sm">
          <Sparkles size={13} />
          <span>CRYPTOGRAPHIC PILLARS</span>
        </div>
        <h2 className="text-3xl font-bold mb-xs">Engineered for Trustless Governance</h2>
        <p className="text-secondary text-sm">
          Four fundamental security properties of Midnight Network's zero-knowledge execution layer protecting your ballot.
        </p>
      </div>

      <div className="bento-grid">
        {/* Card 1: Witness Boundary (Span 2) */}
        <div className="bento-card bento-col-2">
          <div className="bento-icon-box">
            <EyeOff size={22} />
          </div>
          <h3 className="bento-title">Cryptographic Witness Isolation</h3>
          <p className="bento-desc">
            In traditional blockchain voting, every address and transaction payload is transparently visible to all observers. In NullShield, your ballot selection and identity secret exist exclusively inside your browser's private witness memory.
          </p>
          <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-xs text-accent">
            <code>witness voterSecret(): Bytes&lt;32&gt;; // Never crosses network boundary</code>
          </div>
        </div>

        {/* Card 2: Sybil Nullifiers */}
        <div className="bento-card">
          <div className="bento-icon-box">
            <Fingerprint size={22} />
          </div>
          <h3 className="bento-title">Sybil Nullifiers</h3>
          <p className="bento-desc">
            One-way deterministic hashes guarantee one-person-one-vote without revealing which voter cast the ballot.
          </p>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block border border-emerald-500/20">
            Domain: nullshield:voter:v1
          </span>
        </div>

        {/* Card 3: Verifiable Tallies */}
        <div className="bento-card">
          <div className="bento-icon-box">
            <ShieldCheck size={22} />
          </div>
          <h3 className="bento-title">Auditable Ledger Tallies</h3>
          <p className="bento-desc">
            Every vote updates public on-chain counters on the Midnight ledger. Anyone can query the GraphQL indexer to audit results in real time.
          </p>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded inline-block border border-cyan-500/20">
            Indexer GraphQL API v4
          </span>
        </div>

        {/* Card 4: Receipts (Span 2) */}
        <div className="bento-card bento-col-2">
          <div className="bento-icon-box">
            <FileCheck2 size={22} />
          </div>
          <h3 className="bento-title">Tamper-Evident Vote Receipts</h3>
          <p className="bento-desc">
            Upon successful ballot submission, NullShield generates an encrypted, 32-bit polynomial checksum receipt. Voters can mathematically prove their ballot was included without ever disclosing whether they voted Yes or No.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded">
              Checksum Verification
            </span>
            <span className="text-xs font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded">
              Non-Repudiable Audit
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
