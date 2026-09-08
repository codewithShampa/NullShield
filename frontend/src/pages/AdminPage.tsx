import React, { useState, useCallback } from 'react';
import { createUnprovenDeployTx, submitTxAsync, createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { BrowserCompiledVotingContract } from '../contract';
import { useWallet } from '../contexts/WalletContext';
import { 
  Settings, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  Check, 
  Terminal, 
  Rocket, 
  Database,
  Cpu
} from 'lucide-react';
import { config } from '../config';
import { validateMidnightAddress } from '../lib/validation';

// Deterministic admin secret for hackathon demo
const ADMIN_SECRET = '0000000000000000000000000000000000000000000000000000000000000099';

function deriveAdminKey(seedHex: string): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(seedHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * AdminPage component - auto-documented
 */
export default function AdminPage() {
  const { session, isConnected, isConnecting, connect } = useWallet();
  const [status, setStatus] = useState<'idle' | 'deploying' | 'closing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(
    localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') || config.contractAddress || null
  );
  const [copied, setCopied] = useState(false);

  const handleDeploy = useCallback(async () => {
    if (!session || !isConnected) return;
    setStatus('deploying');
    setErrorMsg(null);

    try {
      const adminKeyBytes = deriveAdminKey(ADMIN_SECRET);
      
      const deployTxData = await createUnprovenDeployTx(session.providers as any, {
        compiledContract: BrowserCompiledVotingContract,
        args: [adminKeyBytes],
        privateStateId: 'DeployerState',
        initialPrivateState: {
          adminSecret: adminKeyBytes,
        },
        signingKey: sampleSigningKey(),
      });

      const contractAddress = deployTxData.public.contractAddress;
      
      await submitTxAsync(session.providers as any, {
        unprovenTx: deployTxData.private.unprovenTx,
      });

      setDeployedAddress(contractAddress);
      localStorage.setItem('DEPLOYED_CONTRACT_ADDRESS', contractAddress);
      setStatus('success');
      
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, isConnected]);

  const copyAddress = () => {
    if (!deployedAddress) return;
    navigator.clipboard.writeText(deployedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClosePoll = useCallback(async () => {
    if (!session || !isConnected || !deployedAddress) return;

    const validation = validateMidnightAddress(deployedAddress);
    if (!validation.valid) {
      setStatus('error');
      setErrorMsg(validation.error || 'Invalid target contract address.');
      return;
    }

    setStatus('closing');
    setErrorMsg(null);

    try {
      const adminKeyBytes = deriveAdminKey(ADMIN_SECRET);

      const txData = await createUnprovenCallTx(session.providers as any, {
        compiledContract: BrowserCompiledVotingContract,
        contractAddress: deployedAddress,
        circuitId: 'close_poll',
        args: [],
        privateStateId: 'AdminState_' + ADMIN_SECRET.slice(-6),
        initialPrivateState: { adminSecret: adminKeyBytes },
        signingKey: sampleSigningKey(),
      });

      await submitTxAsync(session.providers as any, {
        unprovenTx: txData.private.unprovenTx,
      });

      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, isConnected, deployedAddress]);

  return (
    <div className="page-container transition-all duration-300 ease-in-out">
      <div className="max-w-3xl mx-auto">
        {/* Title Header */}
        <div className="text-center mb-xl antialiased tracking-tight">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium mb-sm">
            <Settings size={13} />
            OBSIDIAN CONTROL PLANE
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-xs">
            Governance Administration
          </h1>
          <p className="text-secondary text-sm">
            Smart contract deployment, admin authorization, and poll lifecycle management on Midnight Preprod.
          </p>
        </div>

        {/* 1. Wallet Status Warning */}
        {!isConnected && (
          <div className="glass-card mb-lg border-amber-500/30 bg-amber-500/5 text-center p-6 rounded-xl">
            <AlertCircle size={28} className="text-amber-400 mx-auto mb-xs" />
            <h3 className="font-bold text-white mb-1">Admin Wallet Connection Required</h3>
            <p className="text-secondary text-sm mb-md">
              Connect your authorized 1AM or Lace wallet to execute administrative circuits.
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

        {/* 2. Deployed Contract Telemetry Card */}
        <div className="glass-card p-6 rounded-2xl mb-lg">
          <div className="flex items-center justify-between mb-md pb-md border-b border-white/5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-accent" />
              <h2 className="text-lg font-bold text-white">Active Contract Status</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
              Midnight Preprod
            </span>
          </div>

          <div className="space-y-3 text-xs mb-md">
            <div>
              <span className="text-muted block mb-1">Contract Address:</span>
              <div className="flex items-center gap-2 p-2.5 bg-black/40 rounded-lg border border-white/5 font-mono text-white text-[11px] break-all">
                <span>{deployedAddress || 'No active deployment registered'}</span>
                {deployedAddress && (
                  <button onClick={copyAddress} className="text-muted hover:text-accent ml-auto flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>

            {deployedAddress && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Explorer Link:</span>
                <a
                  href={`https://explorer.1am.xyz/contract/${deployedAddress}?network=preprod`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1 font-mono"
                >
                  View on 1AM Explorer <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 3. Action Grid: Deploy New & Finalize Poll */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-lg">
          {/* Card: Deploy Fresh Contract */}
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold mb-xs">
                <Rocket size={18} className="text-cyan-400" />
                <span>Deploy New Contract</span>
              </div>
              <p className="text-secondary text-xs mb-md">
                Deploy a fresh instance of the Compact voting contract initializing public tallies to 0.
              </p>
            </div>
            <button
              onClick={handleDeploy}
              disabled={!isConnected || status === 'deploying' || status === 'closing'}
              className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2"
            >
              {status === 'deploying' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deploying on Preprod...</span>
                </>
              ) : (
                <>
                  <Rocket size={14} />
                  <span>Deploy Voting Contract</span>
                </>
              )}
            </button>
          </div>

          {/* Card: Close Poll Circuit */}
          <div className="glass-card p-5 rounded-xl border-rose-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold mb-xs">
                <Lock size={18} className="text-rose-400" />
                <span>Finalize Poll (Close)</span>
              </div>
              <p className="text-secondary text-xs mb-md">
                Executes the close_poll ZK circuit authenticated by the admin secret witness key.
              </p>
            </div>
            <button
              onClick={handleClosePoll}
              disabled={!isConnected || !deployedAddress || status === 'deploying' || status === 'closing'}
              className="btn btn-accent-ghost btn-sm w-full flex items-center justify-center gap-2 border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
            >
              {status === 'closing' ? (
                <>
                  <Loader2 size={14} className="animate-spin text-rose-400" />
                  <span>Submitting Close Proof...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Execute close_poll</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Status Notification */}
        {status === 'success' && (
          <div className="glass-card p-4 rounded-xl border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Administrative transaction submitted and confirmed on Midnight Preprod!</span>
          </div>
        )}

        {status === 'error' && errorMsg && (
          <div className="glass-card p-4 rounded-xl border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="break-words">{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Code cleanup 58
