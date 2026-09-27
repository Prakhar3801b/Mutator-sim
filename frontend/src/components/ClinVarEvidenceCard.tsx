"use client";

import React from "react";
import { Database, CheckCircle, HelpCircle, AlertCircle, ExternalLink } from "lucide-react";
import { ClinVarEvidenceResponse } from "@/types";

interface ClinVarEvidenceCardProps {
  evidence: ClinVarEvidenceResponse | null;
  isLoading: boolean;
}

export const ClinVarEvidenceCard: React.FC<ClinVarEvidenceCardProps> = ({
  evidence,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div
        className="neo-card"
        style={{
          padding: "1.5rem",
          background: "#ffffff",
          border: "3px solid #000000",
          boxShadow: "5px 5px 0px #000000",
          borderRadius: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              background: "#00f0ff",
              border: "2px solid #000000",
              boxShadow: "1.5px 1.5px 0px #000000",
              padding: "0.25rem",
              borderRadius: "4px"
            }}
          >
            <Database size={18} color="#000000" />
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
            ClinVar & dbSNP Evidence
          </h3>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "#000000", fontWeight: 700, fontSize: "0.85rem" }}>
          Querying NCBI ClinVar database...
        </div>
      </div>
    );
  }

  if (!evidence) return null;

  const isExact = evidence.status === "exact_match";
  const hasMatches = evidence.exact_matches.length > 0;

  return (
    <div
      className="neo-card"
      style={{
        background: "#ffffff",
        border: "3px solid #000000",
        boxShadow: "5px 5px 0px #000000",
        borderRadius: "8px",
        padding: "1.5rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              background: "#00f0ff",
              border: "2px solid #000000",
              boxShadow: "1.5px 1.5px 0px #000000",
              padding: "0.25rem",
              borderRadius: "4px"
            }}
          >
            <Database size={18} color="#000000" />
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
            ClinVar Evidence
          </h3>
        </div>
        <span className={`badge ${isExact ? "badge-red" : "badge-amber"}`}>
          {isExact ? <CheckCircle size={12} /> : <HelpCircle size={12} />}
          {evidence.status_label}
        </span>
      </div>

      {hasMatches ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {evidence.exact_matches.map((m) => (
            <div
              key={m.variation_id}
              style={{
                background: "#faf7f0",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                borderRadius: "6px",
                padding: "0.85rem 1rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#000000" }}>
                  {m.title}
                </span>
                <span className="badge badge-red" style={{ fontSize: "0.65rem", whiteSpace: "nowrap" }}>
                  {m.clinical_significance}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem", fontSize: "0.75rem", color: "#333333", marginTop: "0.5rem" }}>
                <div>ClinVar ID: <strong style={{ color: "#000" }}>{m.variation_id}</strong></div>
                {m.rs_id && <div>dbSNP: <strong style={{ color: "#000" }}>{m.rs_id}</strong></div>}
                <div>Condition: <strong style={{ color: "#000" }}>{m.condition || "Hereditary predisposition"}</strong></div>
                {m.review_status && <div>Review: <strong style={{ color: "#000" }}>{m.review_status}</strong></div>}
              </div>

              <div style={{ marginTop: "0.65rem", display: "flex", justifyContent: "flex-end" }}>
                <a
                  href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${m.variation_id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: "0.72rem", padding: "0.25rem 0.65rem" }}
                >
                  View on NCBI ClinVar <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "#fff9eb",
            border: "2px dashed #000000",
            borderRadius: "6px",
            padding: "1rem",
            fontSize: "0.82rem",
            color: "#000000"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#d97706", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.3rem" }}>
            <AlertCircle size={16} />
            No Curated Entry Found in ClinVar
          </div>
          <p style={{ fontWeight: 500 }}>{evidence.disclaimer}</p>
        </div>
      )}

      {/* Mandatory Scientific Boundary Disclaimer */}
      <div style={{ fontSize: "0.72rem", color: "#555555", fontWeight: 600, marginTop: "0.75rem", borderTop: "1.5px solid #000000", paddingTop: "0.5rem" }}>
        Note: ClinVar entries represent historical submitter interpretations and clinical submissions.
      </div>
    </div>
  );
};
