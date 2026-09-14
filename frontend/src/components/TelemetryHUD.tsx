import React from 'react';
import { Shield, Cpu, Lock, Radio } from 'lucide-react';

interface TelemetryHUDProps {
  className?: string;
}

/**
 * TelemetryHUD component - auto-documented
 */
export default function TelemetryHUD({ className = '' }: TelemetryHUDProps) {
  return (
    <section className={`telemetry-strip ${className}`}>
      {/* Metric 1 */}
      <div className="telemetry-cell transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between text-muted text-xs mb-1 antialiased tracking-tight">
          <span className="font-mono uppercase tracking-wider">Witness Shield</span>
          <Lock size={13} className="text-accent" />
        </div>
        <div className="telemetry-val text-gradient">100%</div>
        <div className="telemetry-lbl">Voter Anonymity</div>
        <div className="text-xs text-muted">0 bits leaked across boundary</div>
      </div>

      {/* Metric 2 */}
      <div className="telemetry-cell">
        <div className="flex items-center justify-between text-muted text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">Proof Latency</span>
          <Cpu size={13} className="text-purple-400" />
        </div>
        <div className="telemetry-val">~2.4s</div>
        <div className="telemetry-lbl">Client Proving Speed</div>
        <div className="text-xs text-muted">On-device WASM synthesis</div>
      </div>

      {/* Metric 3 */}
      <div className="telemetry-cell">
        <div className="flex items-center justify-between text-muted text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">Replay Defense</span>
          <Shield size={13} className="text-emerald-400" />
        </div>
        <div className="telemetry-val text-emerald-400">Sybil-Proof</div>
        <div className="telemetry-lbl">Double-Vote Prevention</div>
        <div className="text-xs text-muted">Deterministic nullifiers</div>
      </div>

      {/* Metric 4 */}
      <div className="telemetry-cell">
        <div className="flex items-center justify-between text-muted text-xs mb-1">
          <span className="font-mono uppercase tracking-wider">Consensus Sync</span>
          <Radio size={13} className="text-cyan-400" />
        </div>
        <div className="telemetry-val text-cyan-400">Preprod</div>
        <div className="telemetry-lbl">Network Status</div>
        <div className="text-xs text-muted">1AM & Indexer v4 active</div>
      </div>
    </section>
  );
}
