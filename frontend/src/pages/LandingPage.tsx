import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink, 
  Fingerprint, 
  Sparkles,
  Shield,
  ArrowRight
} from 'lucide-react';
import { config } from '../config';
import ZKTerminal from '../components/ZKTerminal';
import TelemetryHUD from '../components/TelemetryHUD';
import BentoGrid from '../components/BentoGrid';
import ProtocolStepper from '../components/ProtocolStepper';
import VotingSandbox from '../components/VotingSandbox';

// Rotating headline phrases inspired by animated-text-rotate-hero
const ROTATING_PHRASES = [
  { text: 'Vote Anonymously.', highlight: 'Verify Publicly.' },
  { text: 'Prove Confidentially.', highlight: 'Shield Your Voice.' },
  { text: 'Zero-Knowledge Ballots.', highlight: 'Trustless Tallies.' }
];

/**
 * LandingPage component - auto-documented
 */
export default function LandingPage() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [copiedContract, setCopiedContract] = useState(false);

  // Rotating headline effect
  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handleCopyContract = () => {
    if (!config.contractAddress) return;
    navigator.clipboard.writeText(config.contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const contractDisplay = config.contractAddress 
    ? `${config.contractAddress.slice(0, 10)}...${config.contractAddress.slice(-8)}`
    : '39767f26...33332f';

  return (
    <div className="landing-page transition-all duration-300 ease-in-out">
      {/* 1. HERO SECTION (Inspired by helix-vault-h55 & animated-text-rotate-hero) */}
      <section className="hero-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top Pill Badge */}
          <div className="hero-pill-badge">
            <span className="nav-status-dot" />
            <span>MIDNIGHT NETWORK · ZERO-KNOWLEDGE GOVERNANCE</span>
          </div>

          {/* Dynamic Rotating Headline */}
          <h1 className="hero-headline">
            <AnimatePresence mode="wait">
              <motion.div
                key={headlineIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <span>{ROTATING_PHRASES[headlineIndex].text}</span>
                <br />
                <span className="text-gradient antialiased tracking-tight">
                  {ROTATING_PHRASES[headlineIndex].highlight}
                </span>
              </motion.div>
            </AnimatePresence>
          </h1>

          <p className="hero-description">
            Cast confidential ballots with mathematical certainty. Built on Midnight's Compact smart contract framework, ensuring voter privacy while delivering 100% public, auditable on-chain tallies.
          </p>

          {/* Contract Address Chip with Copy & Explorer Links */}
          <div className="contract-chip">
            <Fingerprint size={14} className="text-accent" />
            <span>CONTRACT:</span>
            <span className="text-white font-medium">{contractDisplay}</span>
            <button type="button" 
              onClick={handleCopyContract} 
              className="text-muted hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              title="Copy Contract Address"
            >
              {copiedContract ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
            <a
              href={`https://explorer.1am.xyz/contract/${config.contractAddress || '39767f264df7b2da4ea9ce24b3900f148517c564ec9efbffecad33edcd33332f'}?network=preprod`}
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-accent transition-colors"
              title="View on 1AM Explorer"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/vote" className="btn btn-primary btn-lg">
              Enter Voting Booth
              <ChevronRight size={18} />
            </Link>
            <Link to="/results" className="btn btn-secondary btn-lg">
              View Live Tallies
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. ZK TERMINAL & CONSOLE PREVIEW (Modular Component) */}
      <ZKTerminal />

      {/* 3. TELEMETRY HUD STRIP (Modular Component) */}
      <TelemetryHUD />

      {/* 4. ASYMMETRIC BENTO GRID (Modular Component) */}
      <BentoGrid />

      {/* 5. INTERACTIVE PROTOCOL STEPPER (Modular Component) */}
      <ProtocolStepper />

      {/* 6. LIVE INTERACTIVE VOTING SANDBOX (Modular Component) */}
      <VotingSandbox />

      {/* 7. FINAL CALL TO ACTION */}
      <section className="glass-card text-center py-12 px-6 border-accent/30 bg-gradient-to-b from-[#0D121F] to-[#07090E] rounded-2xl relative overflow-hidden my-16">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-mono font-medium mb-sm border border-accent/20">
            <Shield size={13} />
            <span>CONFIDENTIAL DEMOCRACY</span>
          </div>
          <h2 className="text-3xl font-extrabold mb-sm text-white">Ready to Cast Your Ballot?</h2>
          <p className="text-secondary mb-lg">
            Connect your 1AM or Lace wallet on Midnight Preprod to participate in live decentralized governance with absolute cryptographic privacy.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/vote" className="btn btn-primary btn-lg">
              Launch Voting Booth
              <ChevronRight size={18} />
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg">
              Read Security Specs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
