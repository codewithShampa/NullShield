import React, { useState, useEffect } from 'react';
import { KeyRound, Fingerprint, ShieldCheck, Database, Terminal as TerminalIcon } from 'lucide-react';

interface ZKTerminalProps {
  className?: string;
}

/**
 * ZKTerminal component - auto-documented
 */
export default function ZKTerminal({ className = '' }: ZKTerminalProps) {
  const [activeStage, setActiveStage] = useState(0);
  const [proverLatency, setProverLatency] = useState(2420);

  // Cycle through active circuit stages gently
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage(prev => (prev + 1) % 4);
      setProverLatency(Math.floor(2300 + Math.random() * 240));
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`zk-terminal-wrapper ${className}`}>
      {/* Terminal Title Bar */}
      <div className="terminal-header transition-all duration-300 ease-in-out">
        <div className="terminal-dots">
          <span className="terminal-dot dot-red" />
          <span className="terminal-dot dot-yellow" />
          <span className="terminal-dot dot-green" />
        </div>
        <div className="terminal-title flex items-center gap-1.5">
          <TerminalIcon size={12} className="text-accent antialiased tracking-tight" />
          <span>Midnight Compact Prover Engine v0.31.0 · Circuit: cast_vote</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PROVER ONLINE ({proverLatency}ms)</span>
        </div>
      </div>

      {/* Terminal Work Area */}
      <div className="terminal-body">
        {/* Left Circuit Constraint Pipeline */}
        <div className="circuit-flow-panel">
          <div className={`circuit-step-box ${activeStage === 0 ? 'active' : ''}`}>
            <div className="flex items-center gap-2.5">
              <KeyRound size={16} className="text-accent" />
              <div>
                <div className="font-semibold text-white">Private Witness Input</div>
                <div className="text-[11px] text-muted font-mono">witness voterSecret(): Bytes&lt;32&gt;</div>
              </div>
            </div>
            <span className="text-xs font-mono text-accent font-semibold">DISCLOSED: 0%</span>
          </div>

          <div className={`circuit-step-box ${activeStage === 1 ? 'active' : ''}`}>
            <div className="flex items-center gap-2.5">
              <Fingerprint size={16} className="text-cyan-400" />
              <div>
                <div className="font-semibold text-white">Nullifier Derivation</div>
                <div className="text-[11px] text-muted font-mono">domain: nullshield:voter:v1</div>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">ONE-WAY HASH</span>
          </div>

          <div className={`circuit-step-box ${activeStage === 2 ? 'active' : ''}`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <div>
                <div className="font-semibold text-white">R1CS Constraint Evaluation</div>
                <div className="text-[11px] text-muted font-mono">choice in [0, 1] conditional inc</div>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">CONSTRAINTS SAT</span>
          </div>

          <div className={`circuit-step-box ${activeStage === 3 ? 'active' : ''}`}>
            <div className="flex items-center gap-2.5">
              <Database size={16} className="text-purple-400" />
              <div>
                <div className="font-semibold text-white">On-Chain Ledger State Commit</div>
                <div className="text-[11px] text-muted font-mono">total_votes.increment(1)</div>
              </div>
            </div>
            <span className="text-xs font-mono text-purple-400 font-semibold">PREPROD FINAL</span>
          </div>
        </div>

        {/* Right Live Proving Log Stream */}
        <div className="terminal-log-stream">
          <div className="log-line log-muted">[INIT] Loading WASM Compact Prover Runtime v0.31.0...</div>
          <div className="log-line">[SYS] Initializing Midnight Preprod Public Data Provider (GraphQL v4)</div>
          <div className="log-line log-cyan">[ZK] Generating ephemeral witness commitment...</div>
          <div className="log-line font-mono text-[11px] text-muted">
            &gt; persistentHash([pad32("nullshield:voter:v1"), voterSecret])
          </div>
          <div className="log-line log-purple">[CIRCUIT] Constraint evaluation: choice in [0, 1] -&gt; PASS</div>
          <div className="log-line log-cyan">[NULLIFIER] Sybil check: has_voted.member(nullifier) == false</div>
          <div className="log-line log-emerald">[PROVER] Groth16 Zero-Knowledge SNARK proof generated in {proverLatency}ms</div>
          <div className="log-line text-emerald-400">[READY] Unproven transaction prepared for 1AM wallet submission_</div>
        </div>
      </div>
    </section>
  );
}
