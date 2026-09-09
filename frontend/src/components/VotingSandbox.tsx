import React, { useState } from 'react';
import { Zap, ShieldCheck, LockKeyhole, ArrowRight, RefreshCw, Check, Copy } from 'lucide-react';

interface VotingSandboxProps {
  className?: string;
}

/**
 * VotingSandbox component - auto-documented
 */
export default function VotingSandbox({ className = '' }: VotingSandboxProps) {
  const [sandboxChoice, setSandboxChoice] = useState<'yes' | 'no' | null>(null);
  const [sandboxStatus, setSandboxStatus] = useState<'idle' | 'proving' | 'success'>('idle');
  const [sandboxReceipt, setSandboxReceipt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSimulateVote = () => {
    if (!sandboxChoice) return;
    setSandboxStatus('proving');
    setTimeout(() => {
      const mockNullifier = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSandboxReceipt(mockNullifier);
      setSandboxStatus('success');
    }, 1800);
  };

  const resetSandbox = () => {
    setSandboxChoice(null);
    setSandboxStatus('idle');
    setSandboxReceipt(null);
    setCopied(false);
  };

  const copyNullifier = () => {
    if (!sandboxReceipt) return;
    navigator.clipboard.writeText(sandboxReceipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`sandbox-container ${className}`}>
      <div className="max-w-xl mx-auto text-center transition-all duration-300 ease-in-out antialiased tracking-tight">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium mb-sm border border-accent/20">
          <Zap size={13} />
          <span>INTERACTIVE CLIENT PROVER SANDBOX</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-xs">
          Test the Zero-Knowledge Voting Flow
        </h2>
        <p className="text-secondary text-sm mb-lg">
          Experience client-side zero-knowledge proof generation in real-time. No wallet connection or funds required for this sandbox preview.
        </p>

        {sandboxStatus === 'idle' && (
          <div>
            <div className="choice-grid">
              <button type="button"
                onClick={() => setSandboxChoice('yes')}
                className={`choice-card-btn ${sandboxChoice === 'yes' ? 'selected-yes' : ''}`}
              >
                <ShieldCheck size={20} className={sandboxChoice === 'yes' ? 'text-emerald-400' : 'text-muted'} />
                <span>Vote YES (Approve)</span>
              </button>
              <button
                onClick={() => setSandboxChoice('no')}
                className={`choice-card-btn ${sandboxChoice === 'no' ? 'selected-no' : ''}`}
              >
                <LockKeyhole size={20} className={sandboxChoice === 'no' ? 'text-rose-400' : 'text-muted'} />
                <span>Vote NO (Reject)</span>
              </button>
            </div>

            <button
              onClick={handleSimulateVote}
              disabled={!sandboxChoice}
              className="btn btn-primary btn-lg w-full max-w-sm mx-auto"
            >
              <span>Simulate ZK Proof Synthesis</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {sandboxStatus === 'proving' && (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <RefreshCw size={36} className="text-accent animate-spin" />
            <div className="font-bold text-lg text-white">Synthesizing Zero-Knowledge Proof...</div>
            <div className="text-xs font-mono text-secondary max-w-md">
              Computing R1CS constraint matrix · Deriving deterministic nullifier · Evaluating witness boundaries (2,420ms)
            </div>
          </div>
        )}

        {sandboxStatus === 'success' && (
          <div className="receipt-card max-w-md mx-auto text-left">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-sm">
              <Check size={18} />
              <span>Zero-Knowledge Proof Verified!</span>
            </div>
            <div className="text-xs text-secondary mb-xs">
              Ballot Choice: <span className="text-white font-semibold">ENCRYPTED INSIDE PROOF (ZERO LEAKAGE)</span>
            </div>
            <div className="text-xs text-secondary mb-xs flex items-center justify-between">
              <span>Deterministic Nullifier:</span>
              <button onClick={copyNullifier} className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary/50">
                {copied ? 'Copied!' : 'Copy'}
                <Copy size={11} />
              </button>
            </div>
            <div className="p-2 bg-black/40 rounded border border-white/5 font-mono text-xs text-accent mb-sm truncate">
              {sandboxReceipt}
            </div>
            <div className="text-xs text-secondary mb-md">
              On-Chain Ledger Status: <span className="text-emerald-400 font-medium">Eligible & Ready to Commit</span>
            </div>
            <button onClick={resetSandbox} className="btn btn-secondary btn-sm w-full">
              Reset Sandbox
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
