import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';
import { Vote, BarChart3, Info, ShieldCheck, Wallet, CheckCircle2, Sun, Moon } from 'lucide-react';

/**
 * NavBar component - auto-documented
 */
export default function NavBar() {
  const location = useLocation();
  const { isConnected, isConnecting, address, connect, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  // Format address (0x1234...5678)
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    const clean = addr.replace(/^0x/, '');
    return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
  };

  return (
    <header className="floating-nav-wrapper transition-all duration-300 ease-in-out">
      <nav className="floating-navbar">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center">
          <Logo size={32} variant="full" />
        </Link>

        {/* Center Route Links */}
        <div className="nav-links-cluster">
          <Link
            to="/"
            className={`nav-link-pill ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/vote"
            className={`nav-link-pill ${isActive('/vote') ? 'active' : ''}`}
          >
            <Vote size={15} />
            Vote
          </Link>
          <Link
            to="/results"
            className={`nav-link-pill ${isActive('/results') ? 'active' : ''}`}
          >
            <BarChart3 size={15} />
            Results
          </Link>
          <Link
            to="/admin"
            className={`nav-link-pill ${isActive('/admin') ? 'active' : ''}`}
          >
            <ShieldCheck size={15} />
            Admin
          </Link>
          <Link
            to="/about"
            className={`nav-link-pill ${isActive('/about') ? 'active' : ''}`}
          >
            <Info size={15} />
            About
          </Link>
        </div>

        {/* Right Status, Theme Toggle & Wallet Chip */}
        <div className="flex items-center gap-3">
          {/* Day / Night Theme Toggle */}
          <button type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-amber-300 transition-transform duration-300 hover:rotate-45 focus:outline-none focus:ring-2 focus:ring-primary/50 antialiased tracking-tight" />
            ) : (
              <Moon size={16} className="text-violet-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Live Network Status Pill */}
          <div className="nav-status-pill hidden md:inline-flex" title="Connected to Midnight Preprod">
            <span className="nav-status-dot" />
            <span>Preprod</span>
          </div>

          {/* Wallet Action Button */}
          {isConnected && address ? (
            <div className="inline-flex items-center gap-2">
              <button
                onClick={disconnect}
                className="btn btn-secondary btn-sm font-mono text-xs flex items-center gap-1.5"
                title="Click to disconnect"
              >
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>{formatAddress(address)}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <Wallet size={14} />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
