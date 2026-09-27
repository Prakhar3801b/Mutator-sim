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
    <header
      className="neo-card"
      style={{
        padding: "1rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        background: "#ffffff",
        border: "3px solid #000000",
        boxShadow: "4px 4px 0px #000000"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "6px",
            background: "#ffe600",
            border: "2.5px solid #000000",
            boxShadow: "2px 2px 0px #000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Dna size={26} color="#000000" />
        </div>
        <div>
          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-display)",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem"
            }}
          >
            Genetic Mutation Simulator
            <span className="badge badge-yellow" style={{ fontSize: "0.68rem" }}>
              v1.1 Research
            </span>
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            In-Silico DNA &rarr; Codon &rarr; Protein Variant Impact Simulation & Evidence Explorer
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div className="badge badge-cyan" title="Entrez API Key configured for 10 req/s">
          <Zap size={13} />
          NCBI API Active
        </div>
        <div className="badge badge-green" title="Strict separation of in-silico prediction from clinical claims">
          <ShieldCheck size={13} />
          In-Silico Mode
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
