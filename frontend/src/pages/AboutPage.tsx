import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  BookOpen, 
  Code2, 
  Terminal, 
  Lock, 
  EyeOff, 
  Database, 
  CheckCircle2, 
  ExternalLink,
  Cpu,
  FileCheck
} from 'lucide-react';
import { config } from '../config';

/**
 * AboutPage component - auto-documented
 */
export default function AboutPage() {
  return (
    <div className="page-container transition-all duration-300 ease-in-out">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-xl antialiased tracking-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium mb-sm">
            <BookOpen size={13} />
            TECHNICAL SPECIFICATIONS
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-xs">
            Architecture & Privacy Model
          </h1>
          <p className="text-secondary text-sm">
            How NullShield leverages Zero-Knowledge cryptography and Compact smart contracts on Midnight.
          </p>
        </motion.div>

        {/* 1. Comparison Matrix */}
        <div className="glass-card p-6 rounded-2xl mb-lg">
          <h2 className="text-lg font-bold text-white mb-md flex items-center gap-2">
            <ShieldCheck size={18} className="text-accent" />
            <span>Governance Paradigm Comparison</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/10 text-muted uppercase font-mono">
                  <th className="pb-3">Voting Dimension</th>
                  <th className="pb-3 text-rose-400">Traditional Web2</th>
                  <th className="pb-3 text-amber-400">Public L1 (Ethereum)</th>
                  <th className="pb-3 text-accent">NullShield (Midnight)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-secondary">
                <tr>
                  <td className="py-3 font-semibold text-white">Voter Privacy</td>
                  <td className="py-3 text-rose-300">Server logs identity</td>
                  <td className="py-3 text-rose-300">Public wallet address</td>
                  <td className="py-3 text-emerald-400 font-bold">100% Shielded (Witness)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Double-Vote Prevention</td>
                  <td className="py-3">Centralized DB check</td>
                  <td className="py-3">Address mapping</td>
                  <td className="py-3 text-emerald-400 font-bold">Sybil Nullifier Map</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Tally Auditability</td>
                  <td className="py-3 text-rose-300">Opaque (Trust admins)</td>
                  <td className="py-3 text-emerald-400">Fully transparent</td>
                  <td className="py-3 text-emerald-400 font-bold">Public On-Chain Ledger</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Proof of Vote Inclusion</td>
                  <td className="py-3 text-rose-300">None</td>
                  <td className="py-3">Public TX Hash</td>
                  <td className="py-3 text-emerald-400 font-bold">Verifiable ZK Receipt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. ZK Witness Boundaries */}
        <div className="glass-card p-6 rounded-2xl mb-lg">
          <h2 className="text-lg font-bold text-white mb-sm flex items-center gap-2">
            <Lock size={18} className="text-cyan-400" />
            <span>The Witness Boundary in Compact</span>
          </h2>
          <p className="text-secondary text-xs leading-relaxed mb-md">
            Compact is Midnight’s domain-specific language that compiles into zero-knowledge circuits. The language enforces a strict mathematical boundary between private witnesses and public ledger states:
          </p>

          <div className="p-4 bg-black/50 rounded-xl border border-white/5 font-mono text-xs text-accent mb-md overflow-x-auto">
            <div className="text-muted mb-1">// Private Witness: Never leaves the voter device</div>
            <div className="text-white font-semibold">witness voterSecret(): Bytes&lt;32&gt;;</div>
            <br />
            <div className="text-muted mb-1">// Pure Circuit: Deterministic Sybil nullifier derivation</div>
            <div>pure circuit voterNullifier(sk: Bytes&lt;32&gt;): Bytes&lt;32&gt; &#123;</div>
            <div className="pl-4">return persistentHash([pad(32, "nullshield:voter:v1"), sk]);</div>
            <div>&#125;</div>
            <br />
            <div className="text-muted mb-1">// Public State: Disclosed only as spent flag</div>
            <div className="text-white font-semibold">export ledger has_voted: Map&lt;Bytes&lt;32&gt;, Boolean&gt;;</div>
          </div>

          <p className="text-secondary text-xs leading-relaxed">
            By proving that the nullifier corresponds to a valid secret without ever disclosing that secret, NullShield prevents sybil replay attacks while preserving complete voter anonymity.
          </p>
        </div>

        {/* 3. Formal Security Audit Credentials */}
        <div className="glass-card p-6 rounded-2xl mb-lg">
          <div className="flex items-center justify-between mb-sm flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileCheck size={18} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Security & Audit Verification</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              PASSED (24/24 Tests)
            </span>
          </div>
          <p className="text-secondary text-xs leading-relaxed mb-md">
            NullShield underwent a rigorous security audit covering domain separation, collision resistance, low-entropy secret guardrails, and transaction transcript analysis.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#/about"
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              <span>Read Full Audit Report (AUDIT.md)</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
