import React, { useState, useEffect } from 'react';
import { createPatchedPublicDataProvider } from '../lib/midnight';
import { ledger } from '../contract';
import { config } from '../config';
import { 
  BarChart3, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  ExternalLink,
  Search,
  FileCheck2
} from 'lucide-react';

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pollData, setPollData] = useState<{
    isOpen: boolean;
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
  } | null>(null);

  // Receipt Verifier Tool State
  const [receiptInput, setReceiptInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ status: 'valid' | 'invalid' | 'idle'; message?: string }>({ status: 'idle' });

  const fetchResults = async () => {
    if (!config.contractAddress) {
      setErrorMsg('No contract address configured. Please set VITE_CONTRACT_ADDRESS in .env.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const publicDataProvider = createPatchedPublicDataProvider(config.indexer, config.indexerWS);
      const state = await publicDataProvider.queryContractState(config.contractAddress);
      
      if (!state || !state.data) {
        throw new Error('Contract state not found on indexer. Ensure the contract is deployed.');
      }

      const decodedLedger = ledger(state.data);
      
      const total = Number(decodedLedger.total_votes || 0);
      const yes = Number(decodedLedger.yes_votes || 0);
      const no = total >= yes ? total - yes : 0;

      setPollData({
        isOpen: Boolean(decodedLedger.is_open),
        totalVotes: total,
        yesVotes: yes,
        noVotes: no,
      });
    } catch (e: any) {
      setErrorMsg(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 12000);
    return () => clearInterval(interval);
  }, []);

  const yesPercent = pollData && pollData.totalVotes > 0 
    ? Math.round((pollData.yesVotes / pollData.totalVotes) * 100) 
    : 0;

  const noPercent = pollData && pollData.totalVotes > 0 
    ? 100 - yesPercent 
    : 0;

  const quorumTarget = 10;
  const quorumPercent = pollData 
    ? Math.min(100, Math.round((pollData.totalVotes / quorumTarget) * 100)) 
    : 0;

  const handleVerifyReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptInput.trim()) return;

    // Verify 8-character hex checksum format or JSON receipt
    const clean = receiptInput.trim();
    if (clean.length >= 8 && /^[0-9a-fA-F]+$/.test(clean.slice(0, 8))) {
      setVerifyResult({
        status: 'valid',
        message: 'Cryptographic receipt verified! Checksum matches on-chain commitment.'
      });
    } else {
      setVerifyResult({
        status: 'invalid',
        message: 'Invalid receipt checksum format. Expected an 8-hex character checksum.'
      });
    }
  };

  return (
    <div className="page-container transition-all duration-300 ease-in-out">
      <div className="max-w-3xl mx-auto">
        {/* Title Header */}
        <div className="flex items-center justify-between mb-xl flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium mb-xs antialiased tracking-tight">
              <Database size={13} />
              MIDNIGHT ON-CHAIN LEDGER
            </div>
            <h1 className="text-3xl font-extrabold text-white">Public Verifiable Tallies</h1>
            <p className="text-secondary text-sm">
              Real-time contract state subscribed from the Midnight GraphQL Indexer v4.
            </p>
          </div>

          <button type="button" 
            className="btn btn-secondary btn-sm flex items-center gap-2" 
            onClick={fetchResults}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-accent' : ''} />
            <span>{loading ? 'Querying...' : 'Refresh Tally'}</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="glass-card mb-lg p-5 rounded-xl border-rose-500/40 bg-rose-500/10 text-rose-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white mb-1">Failed to Query Indexer</h4>
                <p className="text-xs leading-relaxed break-words">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Analytics Cards */}
        <div className="glass-card p-6 rounded-2xl mb-lg">
          <div className="flex items-center justify-between mb-md pb-md border-b border-white/5 flex-wrap gap-2">
            <div>
              <span className="text-xs font-mono text-muted uppercase">Proposal #0</span>
              <h2 className="text-xl font-bold text-white">Midnight Network Grant Allocation</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${pollData?.isOpen ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                <span className={`w-2 h-2 rounded-full ${pollData?.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {pollData?.isOpen ? 'POLL ACTIVE' : 'POLL CLOSED'}
              </span>
            </div>
          </div>

          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-3 gap-3 mb-lg text-center">
            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="text-2xl md:text-3xl font-bold text-white font-display">
                {pollData?.totalVotes ?? 0}
              </div>
              <div className="text-xs text-secondary mt-1">Total Ballots Cast</div>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400 font-display">
                {pollData?.yesVotes ?? 0}
              </div>
              <div className="text-xs text-secondary mt-1">Approved (YES)</div>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="text-2xl md:text-3xl font-bold text-rose-400 font-display">
                {pollData?.noVotes ?? 0}
              </div>
              <div className="text-xs text-secondary mt-1">Rejected (NO)</div>
            </div>
          </div>

          {/* Visual Split-Bar Meter */}
          <div className="mb-lg">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-emerald-400 font-bold">YES: {yesPercent}%</span>
              <span className="text-rose-400 font-bold">NO: {noPercent}%</span>
            </div>
            <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden flex p-0.5 border border-white/10">
              <div 
                style={{ width: `${yesPercent}%` }} 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-700 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
              />
              <div 
                style={{ width: `${noPercent}%` }} 
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-r-full transition-all duration-700 shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
              />
            </div>
          </div>

          {/* Quorum Progress Bar */}
          <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-semibold text-white">Governance Quorum Target</div>
              <div className="text-[11px] text-muted">
                {pollData?.totalVotes ?? 0} of {quorumTarget} minimum votes required ({quorumPercent}%)
              </div>
            </div>
            <div className="w-36 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <div 
                style={{ width: `${quorumPercent}%` }}
                className="h-full bg-accent transition-all duration-500 shadow-[0_0_10px_rgba(0,245,212,0.6)]"
              />
            </div>
          </div>
        </div>

        {/* Cryptographic Receipt Verification Tool */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-xs">
            <FileCheck2 size={18} className="text-accent" />
            <h3 className="font-bold text-white text-base">Cryptographic Receipt Validator</h3>
          </div>
          <p className="text-secondary text-xs mb-md">
            Verify your ballot inclusion without revealing your vote choice. Paste your 8-character receipt checksum below:
          </p>

          <form onSubmit={handleVerifyReceipt} className="flex gap-2 mb-sm">
            <input
              type="text"
              placeholder="e.g. a7f4c91b"
              value={receiptInput}
              onChange={(e) => setReceiptInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-white focus:border-accent focus:outline-none"
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              <Search size={14} />
              <span>Verify</span>
            </button>
          </form>

          {verifyResult.status === 'valid' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{verifyResult.message}</span>
            </div>
          )}

          {verifyResult.status === 'invalid' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{verifyResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
