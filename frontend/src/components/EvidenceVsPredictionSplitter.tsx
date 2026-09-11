"use client";

import React from "react";
import { ShieldAlert, Database, Cpu } from "lucide-react";

export const EvidenceVsPredictionSplitter: React.FC = () => {
  return (
    <div style={{
      background: "linear-gradient(90deg, rgba(0, 242, 254, 0.05), rgba(168, 85, 247, 0.05))",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "var(--radius-md)",
      padding: "1rem 1.25rem",
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      gap: "1.5rem",
      alignItems: "center"
    }}>
      {/* Left: Retrieved Biological Evidence */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div style={{ padding: "0.5rem", borderRadius: "8px", background: "rgba(0, 242, 254, 0.15)", color: "#00f2fe" }}>
          <Database size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#00f2fe" }}>
              Retrieved Biological Evidence
            </span>
            <span className="badge badge-cyan" style={{ fontSize: "0.6rem" }}>Authoritative</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Retrieved from NCBI Entrez, ClinVar, and PubMed databases. Reflects published clinical variants and peer-reviewed biomedical literature.
          </p>
        </div>
      </div>

      {/* Center Divider */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", color: "var(--text-dim)", fontSize: "0.7rem", fontWeight: 700 }}>
        <ShieldAlert size={16} color="var(--c-consequence)" />
        <span>VS</span>
      </div>

      {/* Right: In-Silico Computational Results */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div style={{ padding: "0.5rem", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
          <Cpu size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#c084fc" }}>
              Computational In-Silico Predictions
            </span>
            <span className="badge badge-purple" style={{ fontSize: "0.6rem" }}>Mathematical</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Deterministic Biopython sequence translation, Grantham chemical distances, and Random Forest feature inference. Not a medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};
