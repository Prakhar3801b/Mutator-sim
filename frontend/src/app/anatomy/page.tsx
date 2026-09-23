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
    <div className={`main-container ${reducedMotion ? "reduced-motion" : ""}`} style={{ gap: "1.25rem" }}>
      {/* 1. Global Navigation Bar */}
      <Navbar
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        activeGeneSymbol={anatomyData?.gene_symbol || selectedPreset.symbol}
      />

      {/* 2. Top Variant Selector & Medical Diagnostic Bar (matching Reference 1 & 3 header) */}
      <div className="glass-panel" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Activity size={20} color="#06b6d4" />
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Human Body Anatomical Phenotype Explorer
              </h1>
              <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>
                AI External Inference
              </span>
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Multi-organ physiological mapping of DNA sequence mutations powered by external AI APIs & clinical pathology databases
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Engine Provider:</span>
            <span className="badge badge-cyan" style={{ fontSize: "0.7rem" }}>
              {anatomyData?.ai_provider || "AI Clinical Engine"}
            </span>
          </div>
        </div>

        {/* Preset Mutation Selector Pills */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
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
                  background: isSelected ? "linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25))" : "rgba(255, 255, 255, 0.04)",
                  border: isSelected ? "1px solid #06b6d4" : "1px solid var(--border-subtle)",
                  color: isSelected ? "#38bdf8" : "var(--text-muted)",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  transition: "all 0.2s ease"
                }}
              >
                <span>{preset.symbol}</span>
                <span style={{ opacity: 0.7, fontSize: "0.7rem" }}>({preset.hgvs})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main 3-Column Diagnostic Layout matching Reference 3 */}
      {isLoading ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem" }}>
          <Loader2 size={36} className="anim-spin" style={{ color: "#06b6d4", margin: "0 auto 1rem" }} />
          <div style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            Analyzing Whole-Body Anatomical Impact via AI Clinical API...
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Querying physiological consequences, organ vulnerability, and cellular pathways
          </div>
        </div>
      ) : anatomyData ? (
        <div className="anatomy-container">
          {/* Column 1: Diagnostic Results & Clinical Screening Alerts (Reference 3 Left Sidebar) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Condition Banner */}
            <div className="clinical-card" style={{ borderLeft: "4px solid #06b6d4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#38bdf8", fontWeight: 700 }}>
                  Primary Clinical Manifestation
                </span>
                <span className="badge badge-purple" style={{ fontSize: "0.6rem" }}>
                  {anatomyData.gene_symbol}
                </span>
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                {anatomyData.primary_condition}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem", lineHeight: 1.5 }}>
                {anatomyData.overview_summary}
              </div>
            </div>

            {/* Affected Organ Target List */}
            <div className="glass-panel" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Layers size={16} color="#38bdf8" />
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
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: isSelected ? "#38bdf8" : "var(--text-main)" }}>
                          {organ.name}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                          {organ.system}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className={`badge ${severityBadge}`} style={{ fontSize: "0.62rem" }}>
                          {organ.severity}
                        </span>
                        <ChevronRight size={14} color={isSelected ? "#38bdf8" : "var(--text-dim)"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Custom Gene Input */}
            <form onSubmit={handleCustomSubmit} className="glass-panel" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Sparkles size={16} color="#c084fc" />
                Query Any Gene / Mutation
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <input
                  type="text"
                  placeholder="Gene Symbol (e.g. EGFR, BRAF, APOE)"
                  value={customGene}
                  onChange={(e) => setCustomGene(e.target.value)}
                  className="input-control"
                  style={{ fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
                />
                <input
                  type="text"
                  placeholder="Variant HGVS (e.g. c.2573T>G)"
                  value={customVariant}
                  onChange={(e) => setCustomVariant(e.target.value)}
                  className="input-control"
                  style={{ fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: "0.8rem", padding: "0.5rem" }}
                >
                  Run External AI Organ Deduction
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Vector Anatomical Human Body Silhouette (Reference 3 Centerpiece) */}
          <HumanBodyCanvas
            affectedOrgans={anatomyData.affected_organs}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={(id) => setSelectedOrganId(id)}
          />

          {/* Column 3: Organ Deep Dive & Cellular Pathways (Reference 3 Right Sidebar) */}
          {selectedOrgan ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Active Organ Detail Card */}
              <div className="glass-panel" style={{ padding: "1.5rem", borderTop: "3px solid #f43f5e" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--c-flow)", fontWeight: 700 }}>
                      Selected Anatomical Target
                    </span>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.2rem" }}>
                      {selectedOrgan.name}
                    </h2>
                  </div>
                  <span className={`badge ${selectedOrgan.severity === "high" ? "badge-red" : "badge-amber"}`}>
                    {selectedOrgan.risk_level}
                  </span>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
                  {selectedOrgan.description}
                </div>

                {/* Symptoms / Clinical Presentation */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Thermometer size={14} color="#f59e0b" />
                    Clinical Presentation & Symptoms
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {selectedOrgan.symptoms.map((sym, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-main)",
                          background: "rgba(255, 255, 255, 0.04)",
                          padding: "0.4rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          borderLeft: "3px solid #f59e0b"
                        }}
                      >
                        {sym}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Biochemical Mechanism */}
                <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Dna size={14} />
                    Biochemical & Cellular Mechanism
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {selectedOrgan.biochemical_mechanism}
                  </div>
                </div>
              </div>

              {/* Cellular Pathway Architecture */}
              <div className="clinical-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.5rem" }}>
                  <Stethoscope size={16} color="#10b981" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Cellular Pathway Architecture
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {anatomyData.cellular_pathway}
                </div>
              </div>

              {/* Research Protocol Notice */}
              <div className="clinical-card" style={{ background: "rgba(59, 130, 246, 0.08)", borderColor: "rgba(59, 130, 246, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.4rem" }}>
                  <ShieldCheck size={16} color="#60a5fa" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#93c5fd" }}>
                    Clinical Research Boundary
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", lineHeight: 1.4 }}>
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
