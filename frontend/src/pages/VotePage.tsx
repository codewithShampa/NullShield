import React, { useState, useCallback } from 'react';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { BrowserCompiledVotingContract } from '../contract';
import { useWallet } from '../contexts/WalletContext';
import { config } from '../config';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown, 
  ShieldCheck, 
  LockKeyhole, 
  KeyRound, 
  RefreshCw, 
  Copy, 
  Check, 
  Download,
  Info
} from 'lucide-react';
import { validateVoterSecret, generateVoteReceipt, type VoteReceipt } from '../lib/validation';

/**
 * VotePage component - auto-documented
 */
export default function VotePage() {
  const { session, isConnected, isConnecting, connect } = useWallet();
  const [choice, setChoice] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'proving' | 'submitting' | 'success' | 'error'>('idle');
  const [provingStep, setProvingStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Voter Secret Management
  const [voterSecretHex, setVoterSecretHex] = useState<string>(() => {
    let secret = localStorage.getItem('nullshield_voter_secret') || localStorage.getItem('vaultproof_voter_secret');
    if (!secret) {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      secret = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('nullshield_voter_secret', secret);
    }
    return secret;
  });

  const regenerateSecret = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const newSecret = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem('nullshield_voter_secret', newSecret);
    setVoterSecretHex(newSecret);
  };

  const handleVote = useCallback(async () => {
    if (!session || !isConnected || choice === null) return;
    if (!config.contractAddress) {
      setStatus('error');
      setErrorMsg('No contract address configured. Please set VITE_CONTRACT_ADDRESS in .env.');
      return;
    }

    setStatus('proving');
    setProvingStep(1);
    setErrorMsg(null);

    try {
      const secretValidation = validateVoterSecret(voterSecretHex);
      if (!secretValidation.valid) {
        throw new Error(secretValidation.error || 'Invalid voter secret key.');
      }
      
      const voterSecret = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        voterSecret[i] = parseInt(voterSecretHex.slice(i * 2, i * 2 + 2), 16);
      }

      setProvingStep(2); // Generating ZK constraint proof

      const txData = await createUnprovenCallTx(session.providers as any, {
        compiledContract: BrowserCompiledVotingContract,
        contractAddress: config.contractAddress,
        circuitId: 'cast_vote',
        args: [BigInt(choice)],
        privateStateId: 'VoterState_' + voterSecretHex.slice(0, 8), 
        initialPrivateState: { voterSecret },
        signingKey: sampleSigningKey(),
      });

      setProvingStep(3); // Submitting unproven transaction
      setStatus('submitting');
      
      await submitTxAsync(session.providers as any, {
        unprovenTx: txData.private.unprovenTx,
      });

      setProvingStep(4); // Finalized

      // Generate verifiable client-side cryptographic receipt
      const voteReceipt = generateVoteReceipt(
        config.contractAddress,
        voterSecretHex.slice(0, 16) + '...',
        0,
        choice === 1,
        'preprod'
      );
      setReceipt(voteReceipt);
      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, isConnected, choice, voterSecretHex]);

  const copyReceiptJson = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const downloadReceipt = () => {
    if (!receipt) return;
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nullshield_receipt_${receipt.checksum}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container transition-all duration-300 ease-in-out">
      <div className="max-w-2xl mx-auto">
        {/* Title Header */}
        <div className="text-center mb-xl antialiased tracking-tight">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium mb-sm">
            <LockKeyhole size={13} />
            CONFIDENTIAL VOTING BOOTH
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-xs">
            Cast Anonymous Ballot
          </h1>
          <p className="text-secondary text-sm">
            Your vote is shielded inside a zero-knowledge circuit. The network verifies correctness without learning your decision.
          </p>
        </div>

        {/* 1. Wallet Connection Warning if not connected */}
        {!isConnected && (
          <div className="glass-card mb-lg border-amber-500/30 bg-amber-500/5 text-center p-6 rounded-xl">
            <AlertCircle size={28} className="text-amber-400 mx-auto mb-xs" />
            <h3 className="font-bold text-white mb-1">Wallet Connection Required</h3>
            <p className="text-secondary text-sm mb-md">
              Please connect your 1AM or Lace wallet on Midnight Preprod to prove and submit your ballot.
            </p>
            <button type="button"
              onClick={connect}
              disabled={isConnecting}
              className="btn btn-primary btn-sm mx-auto"
            >
              {isConnecting ? 'Connecting...' : 'Connect 1AM Wallet'}
            </button>
          </div>
        )}

        {/* 2. Ballot Options Grid */}
        <div className="glass-card mb-lg p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-sm flex items-center gap-2">
            <span>Proposal #0:</span>
            <span className="text-accent">Midnight Network Grant Allocation</span>
          </h2>
          <p className="text-secondary text-xs mb-lg leading-relaxed">
            Select your confidential ballot stance. Your choice will remain encrypted inside your local witness execution state.
          </p>

          <div className="choice-grid mb-md">
            {/* Option YES */}
            <button
              type="button"
              onClick={() => setChoice(1)}
              disabled={status === 'proving' || status === 'submitting'}
              className={`choice-card-btn ${choice === 1 ? 'selected-yes' : ''}`}
            >
              <ThumbsUp size={22} className={choice === 1 ? 'text-emerald-400' : 'text-muted'} />
              <div className="text-left">
                <div className="font-bold text-white">Approve (YES)</div>
                <div className="text-xs text-muted">Support proposal funding</div>
              </div>
            </button>

            {/* Option NO */}
            <button
              type="button"
              onClick={() => setChoice(0)}
              disabled={status === 'proving' || status === 'submitting'}
              className={`choice-card-btn ${choice === 0 ? 'selected-no' : ''}`}
            >
              <ThumbsDown size={22} className={choice === 0 ? 'text-rose-400' : 'text-muted'} />
              <div className="text-left">
                <div className="font-bold text-white">Reject (NO)</div>
                <div className="text-xs text-muted">Oppose proposal funding</div>
              </div>
            </button>
          </div>

          {/* Voter Secret Key Entropy Box */}
          <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 mb-md flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-accent" />
              <div>
                <div className="text-xs font-semibold text-white">Voter Secret Identity (Witness)</div>
                <div className="text-[11px] font-mono text-muted">
                  {voterSecretHex.slice(0, 10)}...{voterSecretHex.slice(-6)} (256-bit entropy)
                </div>
              </div>
            </div>
            <button
              onClick={regenerateSecret}
              disabled={status === 'proving' || status === 'submitting'}
              className="text-xs text-muted hover:text-accent flex items-center gap-1 font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              title="Regenerate voter identity seed"
            >
              <RefreshCw size={12} />
              <span>Regenerate</span>
            </button>
          </div>

          {/* Action Button */}
          <button
            onClick={handleVote}
            disabled={choice === null || !isConnected || status === 'proving' || status === 'submitting'}
            className="btn btn-primary btn-lg w-full"
          >
            {status === 'proving' ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Generating Zero-Knowledge Proof...
              </span>
            ) : status === 'submitting' ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Submitting to Midnight Preprod...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} />
                Cast Confidential Ballot
              </span>
            )}
          </button>
        </div>

        {/* 3. Proving Progress Stepper (Active during proving/submitting) */}
        {(status === 'proving' || status === 'submitting') && (
          <div className="glass-card mb-lg p-5 rounded-xl border-accent/40 bg-accent/5">
            <div className="text-sm font-bold text-white mb-sm flex items-center gap-2">
              <Loader2 size={16} className="text-accent animate-spin" />
              <span>Cryptographic Proving Pipeline in Progress</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className={`p-2 rounded border ${provingStep >= 1 ? 'border-accent bg-accent/10 text-accent' : 'border-white/5 text-muted'}`}>
                1. Witness Synthesis
              </div>
              <div className={`p-2 rounded border ${provingStep >= 2 ? 'border-accent bg-accent/10 text-accent' : 'border-white/5 text-muted'}`}>
                2. Constraint Prover
              </div>
              <div className={`p-2 rounded border ${provingStep >= 3 ? 'border-accent bg-accent/10 text-accent' : 'border-white/5 text-muted'}`}>
                3. Preprod Relayer
              </div>
            </div>
          </div>
        )}

        {/* 4. Error Message Banner */}
        {status === 'error' && errorMsg && (
          <div className="glass-card mb-lg p-5 rounded-xl border-rose-500/40 bg-rose-500/10 text-rose-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white mb-1">Transaction Failed</h4>
                <p className="text-xs leading-relaxed break-words">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Success & Cryptographic Receipt Card */}
        {status === 'success' && receipt && (
          <div className="receipt-card mb-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-sm">
              <CheckCircle2 size={20} />
              <span>Ballot Cast Successfully!</span>
            </div>
            <p className="text-xs text-secondary mb-md">
              Your vote has been committed to the Midnight blockchain. Retain this cryptographic receipt to verify your ballot inclusion on-chain.
            </p>

            <div className="space-y-2 text-xs mb-lg">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-muted">Contract:</span>
                <span className="text-white font-mono">{receipt.contractAddress.slice(0, 14)}...</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-muted">Nullifier Hash:</span>
                <span className="text-accent font-mono">{receipt.nullifierHash}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-muted">Network:</span>
                <span className="text-cyan-400 uppercase">{receipt.network}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-muted">Receipt Checksum:</span>
                <span className="text-emerald-400 font-mono font-bold">{receipt.checksum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Timestamp:</span>
                <span className="text-white font-mono">{receipt.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={copyReceiptJson} className="btn btn-secondary btn-sm flex-1">
                {copiedReceipt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedReceipt ? 'Copied JSON' : 'Copy Receipt'}</span>
              </button>
              <button onClick={downloadReceipt} className="btn btn-accent-ghost btn-sm flex-1">
                <Download size={14} />
                <span>Download Proof</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
