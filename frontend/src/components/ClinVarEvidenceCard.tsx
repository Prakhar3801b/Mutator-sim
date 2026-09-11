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
      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Database size={18} color="var(--c-flow)" />
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>ClinVar & dbSNP Evidence</h3>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Querying NCBI ClinVar database...
        </div>
      </div>
    );
  }

  if (!evidence) return null;

  const isExact = evidence.status === "exact_match";
  const hasMatches = evidence.exact_matches.length > 0;

  return (
    <div className="glass-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Database size={18} color="var(--c-flow)" />
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>ClinVar Evidence</h3>
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
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.85rem 1rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>
                  {m.title}
                </span>
                <span className="badge badge-red" style={{ fontSize: "0.65rem", whiteSpace: "nowrap" }}>
                  {m.clinical_significance}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                <div>ClinVar ID: <strong>{m.variation_id}</strong></div>
                {m.rs_id && <div>dbSNP: <strong>{m.rs_id}</strong></div>}
                <div>Condition: <strong>{m.condition || "Hereditary predisposition"}</strong></div>
                {m.review_status && <div>Review: <strong>{m.review_status}</strong></div>}
              </div>

              <div style={{ marginTop: "0.6rem", display: "flex", justifyContent: "flex-end" }}>
                <a
                  href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${m.variation_id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: "0.7rem", padding: "0.25rem 0.6rem" }}
                >
                  View on NCBI ClinVar <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px dashed var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1rem",
          fontSize: "0.8rem",
          color: "var(--text-muted)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--c-consequence)", fontWeight: 600, marginBottom: "0.3rem" }}>
            <AlertCircle size={15} />
            No Curated Entry Found in ClinVar
          </div>
          <p>{evidence.disclaimer}</p>
        </div>
      )}

      {/* Mandatory Scientific Boundary Disclaimer */}
      <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.5rem" }}>
        Note: ClinVar entries represent historical submitter interpretations and clinical submissions.
      </div>
    </div>
  );
};
