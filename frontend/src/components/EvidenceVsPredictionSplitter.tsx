"use client";

import React from "react";
import { ShieldAlert, Database, Cpu } from "lucide-react";

export const EvidenceVsPredictionSplitter: React.FC = () => {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "3px solid #000000",
        boxShadow: "4px 4px 0px #000000",
        borderRadius: "8px",
        padding: "1.1rem 1.4rem",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: "1.5rem",
        alignItems: "center"
      }}
    >
      {/* Left: Retrieved Biological Evidence */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div
          style={{
            padding: "0.5rem",
            borderRadius: "6px",
            background: "#00f0ff",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0px #000000",
            color: "#000000",
            flexShrink: 0
          }}
        >
          <Database size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#000000", fontFamily: "var(--font-display)" }}>
              Retrieved Biological Evidence
            </span>
            <span className="badge badge-cyan" style={{ fontSize: "0.62rem" }}>Authoritative</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.2rem" }}>
            Retrieved from NCBI Entrez, ClinVar, and PubMed databases. Reflects published clinical variants and peer-reviewed biomedical literature.
          </p>
        </div>
      </div>

      {/* Center Divider */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
          color: "#000000",
          fontSize: "0.72rem",
          fontWeight: 800,
          fontFamily: "var(--font-mono)",
          background: "#ffe600",
          border: "2px solid #000000",
          boxShadow: "1.5px 1.5px 0px #000000",
          padding: "0.35rem 0.5rem",
          borderRadius: "4px"
        }}
      >
        <ShieldAlert size={16} color="#000000" />
        <span>VS</span>
      </div>

      {/* Right: In-Silico Computational Results */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div
          style={{
            padding: "0.5rem",
            borderRadius: "6px",
            background: "#ffe600",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0px #000000",
            color: "#000000",
            flexShrink: 0
          }}
        >
          <Cpu size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#000000", fontFamily: "var(--font-display)" }}>
              In-Silico ML Predictions
            </span>
            <span className="badge badge-yellow" style={{ fontSize: "0.62rem" }}>Mathematical</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.2rem" }}>
            Deterministic Biopython sequence translation, Grantham chemical distances, and Random Forest feature inference. Not a medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};
