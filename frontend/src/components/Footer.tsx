"use client";

import React from "react";
import { AlertCircle, ExternalLink, Dna, ShieldAlert } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer
      className="neo-card"
      style={{
        padding: "2rem",
        marginTop: "3rem",
        marginBottom: "2.5rem",
        background: "#ffffff",
        border: "3px solid #000000",
        boxShadow: "6px 6px 0px #000000",
        borderRadius: "8px"
      }}
    >
      {/* Regulatory & Research Warning Box */}
      <div
        style={{
          background: "#fff2e8",
          border: "2.5px solid #000000",
          boxShadow: "3px 3px 0px #000000",
          borderRadius: "6px",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.85rem",
          marginBottom: "1.75rem"
        }}
      >
        <ShieldAlert size={22} color="#ff4d00" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.82rem", color: "#000000", lineHeight: 1.6, fontWeight: 500 }}>
          <strong style={{ color: "#ff4d00", fontWeight: 800 }}>MANDATORY SCIENTIFIC & REGULATORY NOTICE:</strong> Mutator Sim is designed solely for computational biology research, academic training, and in-silico genetic simulation. It does <strong>not</strong> perform physical wet-lab testing, does <strong>not</strong> produce diagnostic determinations, and does <strong>not</strong> replace professional clinical genetic counseling.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          fontSize: "0.8rem",
          color: "var(--text-main)",
          borderTop: "2.5px solid #000000",
          paddingTop: "1.25rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              background: "#ffe600",
              border: "1.5px solid #000000",
              boxShadow: "1.5px 1.5px 0px #000000",
              padding: "0.15rem 0.45rem",
              borderRadius: "3px"
            }}
          >
            MUTATOR SIM
          </span>
          <span>&bull;</span>
          <span style={{ fontWeight: 600 }}>
            Powered by <strong>NCBI Entrez</strong>, <strong>ClinVar</strong>, <strong>PubMed</strong>, <strong>Biopython</strong> & <strong>Scikit-learn</strong>.
          </span>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          {[
            { label: "NCBI Home", url: "https://www.ncbi.nlm.nih.gov/" },
            { label: "ClinVar", url: "https://www.ncbi.nlm.nih.gov/clinvar/" },
            { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/" }
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#000000",
                textDecoration: "none",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                background: "#faf7f0",
                border: "1.5px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                padding: "0.25rem 0.6rem",
                borderRadius: "3px",
                fontSize: "0.75rem",
                transition: "all 0.12s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ffe600";
                e.currentTarget.style.transform = "translate(-1px, -1px)";
                e.currentTarget.style.boxShadow = "3px 3px 0px #000000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#faf7f0";
                e.currentTarget.style.transform = "translate(0, 0)";
                e.currentTarget.style.boxShadow = "2px 2px 0px #000000";
              }}
            >
              {link.label} <ExternalLink size={11} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
