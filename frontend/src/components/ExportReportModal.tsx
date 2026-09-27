"use client";

import React, { useState } from "react";
import { Download, Copy, Check, X, FileText, Code2, Printer } from "lucide-react";
import { MutationSimulateResponse, PredictionResponse, ClinVarEvidenceResponse } from "@/types";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  geneSymbol: string;
  accession: string;
  simulation: MutationSimulateResponse | null;
  prediction: PredictionResponse | null;
  clinvar: ClinVarEvidenceResponse | null;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  geneSymbol,
  accession,
  simulation,
  prediction,
  clinvar
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"markdown" | "json">("markdown");

  if (!isOpen || !simulation) return null;

  const buildMarkdown = () => {
    return `# Genetic Mutation Simulation Report
**Gene:** ${geneSymbol} | **Transcript:** ${accession}
**Mutation:** Position ${simulation.position} (${simulation.original_base} → ${simulation.new_base}) [${simulation.transition_transversion}]

## 1. Codon & Translation
- **Codon #${simulation.codon.codon_index}:** ${simulation.codon.original_codon} → ${simulation.codon.modified_codon}
- **Residue #${simulation.amino_acid.residue_index}:** ${simulation.amino_acid.original_aa_name} → ${simulation.amino_acid.modified_aa_name}
- **Classification:** ${simulation.classification.toUpperCase()} (${simulation.classification_description})

## 2. Computational ML Impact
- **Model:** ${prediction?.model_name || "Random Forest Variant Predictor"}
- **Pathogenicity Probability:** ${prediction?.pathogenic_probability ?? "N/A"}
- **Risk Tier:** ${prediction?.risk_tier || "N/A"} (${prediction?.confidence_level || "N/A"} confidence)

## 3. ClinVar Evidence
- **Status:** ${clinvar?.status_label || "No record"}
- **Matches:** ${clinvar?.exact_matches?.length || 0} records

---
*Notice: strictly for computational research & education. Not a clinical diagnosis.*`;
  };

  const mdText = buildMarkdown();
  const jsonText = JSON.stringify({
    gene: geneSymbol,
    accession,
    simulation,
    prediction,
    clinvar
  }, null, 2);

  const handleCopy = () => {
    const text = activeTab === "markdown" ? mdText : jsonText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = activeTab === "markdown" ? mdText : jsonText;
    const ext = activeTab === "markdown" ? "md" : "json";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${geneSymbol}_mutation_analysis_${simulation.position}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.65)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem"
      }}
    >
      <div
        className="neo-card"
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          border: "3.5px solid #000000",
          boxShadow: "8px 8px 0px #000000",
          borderRadius: "8px",
          padding: "1.75rem"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "2.5px solid #000000", paddingBottom: "0.85rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Export Computational Report
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>Download or copy structured analysis data</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: "0.35rem 0.55rem" }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            onClick={() => setActiveTab("markdown")}
            className={`btn ${activeTab === "markdown" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
          >
            <FileText size={14} /> Markdown (.md)
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`btn ${activeTab === "json" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
          >
            <Code2 size={14} /> JSON (.json)
          </button>
        </div>

        {/* Content Preview */}
        <pre
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#faf7f0",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0px #000000",
            borderRadius: "6px",
            padding: "1rem",
            fontSize: "0.78rem",
            fontFamily: "var(--font-mono)",
            color: "#000000",
            fontWeight: 600,
            whiteSpace: "pre-wrap"
          }}
        >
          {activeTab === "markdown" ? mdText : jsonText}
        </pre>

        {/* Actions Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "0.85rem", borderTop: "2px solid #000000", flexWrap: "wrap", gap: "0.5rem" }}>
          <button onClick={() => window.print()} className="btn btn-secondary" style={{ fontSize: "0.8rem" }}>
            <Printer size={14} /> Print
          </button>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handleCopy} className="btn btn-secondary" style={{ fontSize: "0.8rem" }}>
              {copied ? <Check size={14} color="#00a86b" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
            <button onClick={handleDownload} className="btn btn-primary" style={{ fontSize: "0.8rem" }}>
              <Download size={14} /> Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
