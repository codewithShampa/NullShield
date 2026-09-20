import React, { useState } from 'react';
import { Layers, ArrowRight, ShieldCheck, KeyRound, Radio, Database } from 'lucide-react';

interface ProtocolStepperProps {
  className?: string;
}

const STEPS = [
  {
    num: '01',
    title: 'Witness Acquisition',
    subtitle: 'Client-side secret generation',
    icon: <KeyRound size={18} className="text-accent transition-all duration-300 ease-in-out antialiased tracking-tight" />,
    tag: 'Local Client Only (WASM)',
    codeSnippet: `// 256-bit entropy derived in voter's browser
witness voterSecret(): Bytes<32>;
const sk = voterSecret(); // Stays strictly in client memory`,
    description: 'Your browser derives a private 256-bit cryptographic secret. This witness never leaves your device and is never transmitted over the network.'
  },
  {
    num: '02',
    title: 'Circuit Constraint Proving',
    subtitle: 'On-device zero-knowledge proving',
    icon: <ShieldCheck size={18} className="text-purple-400" />,
    tag: 'Zero-Knowledge Prover',
    codeSnippet: `// Compact compiler evaluates choice constraint:
pure circuit voterNullifier(sk: Bytes<32>): Bytes<32> {
  return persistentHash([pad(32, "nullshield:voter:v1"), sk]);
}`,
    description: 'The Compact compiler executes on-device zero-knowledge proving. A mathematical proof is formed demonstrating valid ballot rules without revealing your selection.'
  },
  {
    num: '03',
    title: 'Relay & Consensus Verification',
    subtitle: 'Midnight Preprod network gossip',
    icon: <Radio size={18} className="text-cyan-400" />,
    tag: 'Midnight Network Nodes',
    codeSnippet: `// Relay unproven transaction via connected 1AM/Lace wallet:
await submitTxAsync(session.providers, {
  unprovenTx: txData.private.unprovenTx,
});`,
    description: 'The proof and a deterministic nullifier hash are broadcast to Midnight Preprod. Validators verify the cryptographic integrity without seeing the choice.'
  },
  {
    num: '04',
    title: 'Public Ledger State Commit',
    subtitle: 'Transparent auditable increment',
    icon: <Database size={18} className="text-emerald-400" />,
    tag: 'Public Blockchain State',
    codeSnippet: `// Atomic increment committed to Midnight ledger:
has_voted.insert(disclose(nullifier), true);
total_yes.increment(disclose(yes_inc));
total_votes.increment(1);`,
    description: 'The smart contract marks the nullifier as spent to prevent double-voting, and increments the public tally counter irreversibly on-chain.'
  }
];

/**
 * ProtocolStepper component - auto-documented
 */
export default function ProtocolStepper({ className = '' }: ProtocolStepperProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className={`protocol-stepper-box ${className}`}>
      <div className="mb-lg">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent uppercase tracking-wider mb-1">
          <Layers size={13} />
          <span>Interactive Protocol Architecture</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">How Zero-Knowledge Governance Works</h2>
        <p className="text-secondary text-sm mt-1">
          Explore each stage of Midnight Network's four-phase execution pipeline.
        </p>
      </div>

      {/* Stepper Navigation Tabs */}
      <div className="stepper-nav">
        {STEPS.map((step, idx) => (
          <button type="button"
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`stepper-tab ${activeStep === idx ? 'active' : ''}`}
          >
            <span className="stepper-num">{step.num}</span>
            <span className="truncate">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Active Step Details Panel */}
      <div className="glass-card bg-black/40 border border-white/10 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-sm flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {STEPS[activeStep].icon}
            <span className="font-bold text-white text-lg">{STEPS[activeStep].title}</span>
          </div>
          <span className="font-mono text-xs text-accent bg-accent/10 border border-accent/25 px-2.5 py-1 rounded">
            {STEPS[activeStep].tag}
          </span>
        </div>

        <p className="text-secondary text-sm leading-relaxed mb-md">
          {STEPS[activeStep].description}
        </p>

        {/* Compact Code Snippet */}
        <div className="p-3.5 bg-black/60 rounded-lg border border-white/5 font-mono text-xs text-purple-300 overflow-x-auto">
          <pre>{STEPS[activeStep].codeSnippet}</pre>
        </div>
      </div>
    </section>
  );
}
