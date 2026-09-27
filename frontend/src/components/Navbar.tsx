"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dna, Activity, ShieldCheck, Zap, RotateCcw } from "lucide-react";

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
      style={{
        padding: "0.85rem 1.75rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        borderRadius: "8px",
        background: "#ffffff",
        border: "3px solid #000000",
        boxShadow: "4px 4px 0px #000000"
      }}
    >
      {/* Brand & Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
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
              width: "40px",
              height: "40px",
              borderRadius: "6px",
              background: "#ffe600",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Dna size={22} color="#000000" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  fontFamily: "var(--font-display)"
                }}
              >
                MUTATOR SIM
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#000000",
                  background: "#00f0ff",
                  border: "2px solid #000000",
                  boxShadow: "1.5px 1.5px 0px #000000",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}
              >
                NCBI GENOMICS
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              NCBI Sequence Stream &bull; Codon Translation &bull; ML Pathogenicity Engine
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Switcher (Neo-Brutalist Tabs) */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          background: "#faf7f0",
          padding: "0.3rem",
          borderRadius: "6px",
          border: "2.5px solid #000000",
          boxShadow: "2px 2px 0px #000000",
          gap: "0.35rem"
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.45rem 1.1rem",
            borderRadius: "4px",
            fontSize: "0.82rem",
            fontWeight: 800,
            textDecoration: "none",
            color: "#000000",
            background: isSimulator ? "#ffe600" : "transparent",
            border: isSimulator ? "2px solid #000000" : "2px solid transparent",
            boxShadow: isSimulator ? "2px 2px 0px #000000" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <Dna size={15} />
          Landing & Simulator
        </Link>

        <Link
          href="/anatomy"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.45rem 1.1rem",
            borderRadius: "4px",
            fontSize: "0.82rem",
            fontWeight: 800,
            textDecoration: "none",
            color: "#000000",
            background: isAnatomy ? "#ffe600" : "transparent",
            border: isAnatomy ? "2px solid #000000" : "2px solid transparent",
            boxShadow: isAnatomy ? "2px 2px 0px #000000" : "none",
            transition: "all 0.15s ease"
          }}
        >
          <Activity size={15} />
          Anatomy Explorer
          <span
            style={{
              background: "#00e599",
              color: "#000000",
              border: "1.5px solid #000000",
              padding: "0.1rem 0.4rem",
              borderRadius: "3px",
              fontSize: "0.62rem",
              fontWeight: 800
            }}
          >
            AI
          </span>
        </Link>
      </nav>

      {/* Right Controls & Telemetry */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
        {activeGeneSymbol && (
          <div className="badge badge-yellow" style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}>
            Gene: {activeGeneSymbol}
          </div>
        )}

        <div className="badge badge-green" title="Strict separation of in-silico prediction from wet-lab claims">
          <ShieldCheck size={12} />
          In-Silico Research
        </div>

        {onToggleReducedMotion && (
          <button
            onClick={onToggleReducedMotion}
            className={`btn ${reducedMotion ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.8rem" }}
            title="Toggle animation effects"
          >
            {reducedMotion ? "Motion: Off" : "Motion: On"}
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="btn btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.8rem" }}
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
