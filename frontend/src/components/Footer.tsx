"use client";

import React from "react";
import { AlertCircle, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel" style={{ padding: "1.5rem", marginTop: "1rem" }}>
      <div style={{
        background: "rgba(239, 68, 68, 0.05)",
        border: "1px solid rgba(239, 68, 68, 0.15)",
        borderRadius: "var(--radius-md)",
        padding: "1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        marginBottom: "1rem"
      }}>
        <AlertCircle size={20} color="var(--c-mutated)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "#f87171" }}>Mandatory Scientific & Regulatory Notice:</strong> This platform is designed solely for computational biology research, educational exploration, and in-silico simulation. It does <strong>not</strong> perform physical wet-lab testing, does <strong>not</strong> provide medical diagnoses, and does <strong>not</strong> recommend therapies. Biological systems exhibit complex non-linear dynamics beyond single-sequence models.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.75rem", color: "var(--text-dim)" }}>
        <div>
          Powered by <strong>NCBI Entrez</strong>, <strong>ClinVar</strong>, <strong>PubMed</strong>, <strong>Biopython</strong> & <strong>Scikit-learn</strong>.
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <a href="https://www.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            NCBI Home <ExternalLink size={11} />
          </a>
          <a href="https://www.ncbi.nlm.nih.gov/clinvar/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            ClinVar <ExternalLink size={11} />
          </a>
          <a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            PubMed <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </footer>
  );
};
