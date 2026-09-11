"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { FeaturedGene } from "@/types";

interface FeaturedGenesProps {
  genes: FeaturedGene[];
  selectedGeneId: string | null;
  onSelectGene: (gene: FeaturedGene) => void;
}

export const FeaturedGenes: React.FC<FeaturedGenesProps> = ({
  genes,
  selectedGeneId,
  onSelectGene
}) => {
  if (!genes || genes.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles size={18} color="#00f2fe" />
          <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Featured Research Genes</h2>
          <span className="badge badge-cyan" style={{ fontSize: "0.65rem" }}>1-Click Exploration</span>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Pre-indexed RefSeq Coding Sequences with benchmark mutations
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "0.75rem"
      }}>
        {genes.map((g) => {
          const isSelected = selectedGeneId === g.gene_id;
          return (
            <div
              key={g.gene_id}
              onClick={() => onSelectGene(g)}
              style={{
                background: isSelected ? "rgba(0, 242, 254, 0.12)" : "rgba(255, 255, 255, 0.03)",
                border: isSelected ? "1px solid #00f2fe" : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.85rem 1rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                }
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "1.05rem", color: isSelected ? "#00f2fe" : "var(--text-main)" }}>
                    {g.symbol}
                  </span>
                  <span className="badge badge-purple" style={{ fontSize: "0.6rem" }}>
                    Chr {g.chromosome}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  {g.name}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                  {g.organism}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.75rem", color: "#00f2fe", fontWeight: 600 }}>
                  {isSelected ? "Active" : "Explore"}
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
