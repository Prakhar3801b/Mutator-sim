"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dna, Activity, ShieldCheck, Zap, RotateCcw, ArrowRight } from "lucide-react";

interface NavbarProps {
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
  onReset?: () => void;
  activeGeneSymbol?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  reducedMotion = false,
  onToggleReducedMotion,
  onReset,
  activeGeneSymbol
}) => {
  const pathname = usePathname();

  const isSimulator = pathname === "/";
  const isAnatomy = pathname === "/anatomy";

  return (
    <header
      className="glass-panel"
      style={{
        padding: "0.85rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        borderRadius: "var(--radius-lg)"
      }}
    >
      {/* Brand & Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            textDecoration: "none",
            color: "inherit"
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(59, 130, 246, 0.45)"
            }}
          >
            <Dna size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Mutator Sim
              </span>
              <span className="badge badge-purple" style={{ fontSize: "0.6rem" }}>
                Clinical AI
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              DNA Mutation & Multi-Organ Pathophysiology Explorer
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Pills (Minimalist Medical Switcher) */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.6)",
          padding: "0.3rem",
          borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-subtle)",
          gap: "0.25rem"
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.45rem 1rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: 600,
            textDecoration: "none",
            color: isSimulator ? "#fff" : "var(--text-muted)",
            background: isSimulator ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "transparent",
            boxShadow: isSimulator ? "0 2px 10px rgba(59, 130, 246, 0.35)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <Dna size={16} />
          Genetic Simulator
        </Link>

        <Link
          href="/anatomy"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.45rem 1rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: 600,
            textDecoration: "none",
            color: isAnatomy ? "#fff" : "var(--text-muted)",
            background: isAnatomy ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "transparent",
            boxShadow: isAnatomy ? "0 2px 10px rgba(6, 182, 212, 0.35)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <Activity size={16} />
          Human Body Anatomy
          <span
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              padding: "0.1rem 0.4rem",
              borderRadius: "6px",
              fontSize: "0.65rem",
              fontWeight: 700
            }}
          >
            AI
          </span>
        </Link>
      </nav>

      {/* Right Controls & Telemetry */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
        {activeGeneSymbol && (
          <div className="badge badge-blue" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>
            Gene: {activeGeneSymbol}
          </div>
        )}

        <div className="badge badge-green" title="In-silico simulation validated mode">
          <ShieldCheck size={13} />
          Research Validated
        </div>

        {onToggleReducedMotion && (
          <button
            onClick={onToggleReducedMotion}
            className={`btn ${reducedMotion ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
            title="Toggle animation effects"
          >
            {reducedMotion ? "Motion: Off" : "Motion: On"}
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="btn btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
            title="Reset to default view"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}
      </div>
    </header>
  );
};
