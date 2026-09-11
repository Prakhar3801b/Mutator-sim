"use client";

import React from "react";
import { Dna, ShieldCheck, Zap, RotateCcw } from "lucide-react";

interface HeaderProps {
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  reducedMotion,
  onToggleReducedMotion,
  onReset
}) => {
  return (
    <header className="glass-panel" style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #00f2fe, #4facfe)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 15px rgba(0, 242, 254, 0.4)"
        }}>
          <Dna size={26} color="#070a14" />
        </div>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Genetic Mutation Simulator
            <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>v1.1 Research</span>
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            In-Silico DNA → Codon → Protein Variant Impact Simulation & Evidence Explorer
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div className="badge badge-cyan" title="Entrez API Key configured for 10 req/s">
          <Zap size={13} />
          NCBI API Key Active
        </div>
        <div className="badge badge-green" title="Strict separation of in-silico prediction from clinical claims">
          <ShieldCheck size={13} />
          In-Silico Research Mode
        </div>

        <button
          onClick={onToggleReducedMotion}
          className={`btn ${reducedMotion ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
          title="Toggle animation effects for accessibility"
        >
          {reducedMotion ? "Motion: Reduced" : "Motion: Animated"}
        </button>

        <button
          onClick={onReset}
          className="btn btn-secondary"
          style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
          title="Reset to default view"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
    </header>
  );
};
