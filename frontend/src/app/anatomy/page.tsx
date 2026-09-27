"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HumanBodyCanvas } from "@/components/HumanBodyCanvas";
import { Footer } from "@/components/Footer";
import { fetchAnatomyImpact } from "@/lib/api";
import { AnatomyImpactResponse, OrganImpact } from "@/types";
import {
  Activity,
  AlertTriangle,
  Stethoscope,
  Dna,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers,
  Thermometer,
  FileText,
  Loader2,
  Clock
} from "lucide-react";

interface VariantPreset {
  symbol: string;
  hgvs: string;
  protein: string;
  consequence: string;
  name: string;
}

const PRESET_MUTATIONS: VariantPreset[] = [
  {
    symbol: "BRCA1",
    hgvs: "c.5095C>T",
    protein: "p.Arg1699Trp",
    consequence: "missense",
    name: "BRCA1 c.5095C>T (Breast / Ovarian Cancer Syndrome)"
  },
  {
    symbol: "TP53",
    hgvs: "c.743G>A",
    protein: "p.Arg248Gln",
    consequence: "missense",
    name: "TP53 c.743G>A (Li-Fraumeni Multi-Organ Neoplasm)"
  },
  {
    symbol: "CFTR",
    hgvs: "c.1521_1523delCTT",
    protein: "p.Phe508del",
    consequence: "inframe_indel",
    name: "CFTR deltaF508 (Cystic Fibrosis Pulmonary/Pancreatic)"
  },
  {
    symbol: "HBB",
    hgvs: "c.20A>T",
    protein: "p.Glu7Val",
    consequence: "missense",
    name: "HBB c.20A>T (Sickle Cell Vaso-Occlusive Hemoglobinopathy)"
  }
];

export default function AnatomyPage() {
  const [selectedPreset, setSelectedPreset] = useState<VariantPreset>(PRESET_MUTATIONS[0]);
  const [customGene, setCustomGene] = useState<string>("BRCA1");
  const [customVariant, setCustomVariant] = useState<string>("c.5095C>T");
  const [anatomyData, setAnatomyData] = useState<AnatomyImpactResponse | null>(null);
  const [selectedOrganId, setSelectedOrganId] = useState<string | null>("breasts");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Load anatomical impact whenever selected preset changes
  useEffect(() => {
    loadAnatomy(selectedPreset.symbol, selectedPreset.hgvs, selectedPreset.protein, selectedPreset.consequence);
  }, [selectedPreset]);

  const loadAnatomy = async (sym: string, hgvs: string, protein: string, cons: string) => {
    setIsLoading(true);
    try {
      const data = await fetchAnatomyImpact({
        gene_symbol: sym,
        mutation_hgvs: hgvs,
        amino_acid_change: protein,
        consequence_type: cons
      });
      setAnatomyData(data);
      if (data.affected_organs.length > 0) {
        setSelectedOrganId(data.affected_organs[0].id);
      }
    } catch (err) {
      console.error("Anatomy fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGene.trim()) return;
    loadAnatomy(customGene.toUpperCase().trim(), customVariant.trim(), "", "missense");
  };

  const selectedOrgan = anatomyData?.affected_organs.find(
    (o) => o.id.toLowerCase() === selectedOrganId?.toLowerCase()
  ) || anatomyData?.affected_organs[0];

  return (
    <div className={`main-container ${reducedMotion ? "reduced-motion" : ""}`} style={{ gap: "1.5rem", padding: "1.75rem 2.5rem" }}>
      {/* 1. Global Navigation Bar */}
      <Navbar
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        activeGeneSymbol={anatomyData?.gene_symbol || selectedPreset.symbol}
      />

      {/* 2. Top Variant Selector & Medical Diagnostic Bar */}
      <div
        className="neo-card"
        style={{
          padding: "1.5rem 1.75rem",
          background: "#ffffff",
          border: "3px solid #000000",
          boxShadow: "5px 5px 0px #000000",
          borderRadius: "8px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  background: "#ffe600",
                  border: "2px solid #000000",
                  boxShadow: "1.5px 1.5px 0px #000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000000"
                }}
              >
                <Activity size={20} />
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                Human Body Anatomical Phenotype Explorer
              </h1>
              <span className="badge badge-yellow" style={{ fontSize: "0.65rem" }}>
                AI External Inference
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.35rem" }}>
              Multi-organ physiological mapping of DNA sequence mutations powered by external AI APIs & clinical pathology databases
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 700 }}>Engine:</span>
            <span className="badge badge-cyan" style={{ fontSize: "0.72rem" }}>
              {anatomyData?.ai_provider || "AI Clinical Engine"}
            </span>
          </div>
        </div>

        {/* Preset Mutation Selector Pills */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "#000000", fontWeight: 800, textTransform: "uppercase" }}>
            Curated Benchmarks:
          </span>
          {PRESET_MUTATIONS.map((preset) => {
            const isSelected = selectedPreset.symbol === preset.symbol && selectedPreset.hgvs === preset.hgvs;
            return (
              <button
                key={preset.name}
                onClick={() => {
                  setSelectedPreset(preset);
                  setCustomGene(preset.symbol);
                  setCustomVariant(preset.hgvs);
                }}
                style={{
                  background: isSelected ? "#ffe600" : "#ffffff",
                  border: "2px solid #000000",
                  color: "#000000",
                  padding: "0.45rem 1rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  boxShadow: isSelected ? "3px 3px 0px #000000" : "1.5px 1.5px 0px #000000",
                  transform: isSelected ? "translate(-1px, -1px)" : "none",
                  transition: "all 0.12s ease"
                }}
              >
                <span>{preset.symbol}</span>
                <span style={{ opacity: 0.8, fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>({preset.hgvs})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main 3-Column Diagnostic Layout */}
      {isLoading ? (
        <div
          className="neo-card"
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "#ffffff",
            border: "3px solid #000000",
            boxShadow: "5px 5px 0px #000000",
            borderRadius: "8px"
          }}
        >
          <Loader2 size={36} className="anim-spin" style={{ color: "#000000", margin: "0 auto 1rem" }} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800 }}>
            Analyzing Whole-Body Anatomical Impact via AI Clinical API...
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.5rem" }}>
            Querying physiological consequences, organ vulnerability, and cellular pathways
          </div>
        </div>
      ) : anatomyData ? (
        <div className="anatomy-container">
          {/* Column 1: Diagnostic Results & Clinical Screening Alerts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Condition Banner */}
            <div
              className="clinical-card"
              style={{
                borderLeft: "6px solid #ffe600",
                background: "#ffffff",
                border: "2.5px solid #000000",
                boxShadow: "3px 3px 0px #000000"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#000000", fontWeight: 800 }}>
                  Primary Clinical Manifestation
                </span>
                <span className="badge badge-yellow" style={{ fontSize: "0.62rem" }}>
                  {anatomyData.gene_symbol}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "#000000" }}>
                {anatomyData.primary_condition}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.5rem", lineHeight: 1.6, fontWeight: 500 }}>
                {anatomyData.overview_summary}
              </div>
            </div>

            {/* Affected Organ Target List */}
            <div
              className="neo-card"
              style={{
                padding: "1.25rem",
                background: "#ffffff",
                border: "2.5px solid #000000",
                boxShadow: "3px 3px 0px #000000",
                borderRadius: "6px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.4rem", textTransform: "uppercase" }}>
                  <Layers size={16} color="#000000" />
                  Target Organ Systems
                </span>
                <span className="badge badge-cyan" style={{ fontSize: "0.65rem" }}>
                  {anatomyData.affected_organs.length} Identified
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {anatomyData.affected_organs.map((organ) => {
                  const isSelected = selectedOrgan?.id === organ.id;
                  const severityBadge =
                    organ.severity === "high"
                      ? "badge-red"
                      : organ.severity === "moderate"
                      ? "badge-amber"
                      : "badge-cyan";

                  return (
                    <div
                      key={organ.id}
                      onClick={() => setSelectedOrganId(organ.id)}
                      className={`clinical-card ${isSelected ? "clinical-card-active" : ""}`}
                      style={{
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#000000" }}>
                          {organ.name}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#444444", fontWeight: 600 }}>
                          {organ.system}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className={`badge ${severityBadge}`} style={{ fontSize: "0.62rem" }}>
                          {organ.severity}
                        </span>
                        <ChevronRight size={15} color="#000000" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Custom Gene Input */}
            <form
              onSubmit={handleCustomSubmit}
              className="neo-card"
              style={{
                padding: "1.25rem",
                background: "#ffffff",
                border: "2.5px solid #000000",
                boxShadow: "3px 3px 0px #000000",
                borderRadius: "6px"
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem", textTransform: "uppercase" }}>
                <Sparkles size={16} color="#000000" />
                Query Any Gene / Mutation
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                <input
                  type="text"
                  placeholder="Gene Symbol (e.g. EGFR, BRAF, APOE)"
                  value={customGene}
                  onChange={(e) => setCustomGene(e.target.value)}
                  className="input-control"
                  style={{ fontSize: "0.8rem", padding: "0.55rem 0.85rem", fontWeight: 700 }}
                />
                <input
                  type="text"
                  placeholder="Variant HGVS (e.g. c.2573T>G)"
                  value={customVariant}
                  onChange={(e) => setCustomVariant(e.target.value)}
                  className="input-control"
                  style={{ fontSize: "0.8rem", padding: "0.55rem 0.85rem", fontWeight: 700 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: "0.8rem", padding: "0.65rem" }}
                >
                  Run External AI Organ Deduction
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Vector Anatomical Human Body Silhouette */}
          <HumanBodyCanvas
            affectedOrgans={anatomyData.affected_organs}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={(id) => setSelectedOrganId(id)}
          />

          {/* Column 3: Organ Deep Dive & Cellular Pathways */}
          {selectedOrgan ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Active Organ Detail Card */}
              <div
                className="neo-card"
                style={{
                  padding: "1.5rem",
                  background: "#ffffff",
                  border: "3px solid #000000",
                  boxShadow: "4px 4px 0px #000000",
                  borderRadius: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#000000", fontWeight: 800 }}>
                      Selected Anatomical Target
                    </span>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, marginTop: "0.2rem" }}>
                      {selectedOrgan.name}
                    </h2>
                  </div>
                  <span className={`badge ${selectedOrgan.severity === "high" ? "badge-red" : "badge-amber"}`}>
                    {selectedOrgan.risk_level}
                  </span>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem", fontWeight: 500 }}>
                  {selectedOrgan.description}
                </div>

                {/* Symptoms / Clinical Presentation */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#000000", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Thermometer size={14} color="#ff4d00" />
                    Clinical Presentation & Symptoms
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {selectedOrgan.symptoms.map((sym, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: "0.8rem",
                          color: "#000000",
                          fontWeight: 600,
                          background: "#fffbeb",
                          padding: "0.45rem 0.85rem",
                          borderRadius: "4px",
                          border: "1.5px solid #000000",
                          boxShadow: "1.5px 1.5px 0px #000000"
                        }}
                      >
                        {sym}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Biochemical Mechanism */}
                <div
                  style={{
                    background: "#f0fdf4",
                    padding: "1rem",
                    borderRadius: "6px",
                    border: "2px solid #000000",
                    boxShadow: "2px 2px 0px #000000"
                  }}
                >
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#000000", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Dna size={14} />
                    Biochemical & Cellular Mechanism
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#222222", lineHeight: 1.55, fontWeight: 500 }}>
                    {selectedOrgan.biochemical_mechanism}
                  </div>
                </div>
              </div>

              {/* Cellular Pathway Architecture */}
              <div
                className="clinical-card"
                style={{
                  background: "#ffffff",
                  border: "2.5px solid #000000",
                  boxShadow: "3px 3px 0px #000000"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.5rem" }}>
                  <Stethoscope size={16} color="#00a86b" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase" }}>
                    Cellular Pathway Architecture
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.55, fontWeight: 500 }}>
                  {anatomyData.cellular_pathway}
                </div>
              </div>

              {/* Research Protocol Notice */}
              <div
                className="clinical-card"
                style={{
                  background: "#e0f2fe",
                  border: "2.5px solid #000000",
                  boxShadow: "3px 3px 0px #000000"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.4rem" }}>
                  <ShieldCheck size={16} color="#000000" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#000000", textTransform: "uppercase" }}>
                    Clinical Research Boundary
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#333333", lineHeight: 1.45, fontWeight: 600 }}>
                  Inferred organ impacts represent in-silico AI pathophysiological modeling synthesized with biological databases (ClinVar/OMIM). For investigational research use only.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
