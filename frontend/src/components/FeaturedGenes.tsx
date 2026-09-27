"use client";

import React from "react";
import { Sparkles, ArrowRight, Dna } from "lucide-react";
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
    <div
      className="neo-card"
      style={{
        padding: "1.25rem 1.5rem",
        background: "#ffffff",
        border: "3px solid #000000",
        boxShadow: "5px 5px 0px #000000",
        borderRadius: "8px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              background: "#ffe600",
              border: "2px solid #000000",
              boxShadow: "1.5px 1.5px 0px #000000",
              padding: "0.25rem",
              borderRadius: "4px"
            }}
          >
            <Sparkles size={16} color="#000000" />
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
            Featured Research Genes
          </h2>
          <span className="badge badge-yellow" style={{ fontSize: "0.65rem" }}>
            1-Click Exploration
          </span>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
          Pre-indexed RefSeq Coding Sequences with benchmark mutations
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.85rem"
        }}
      >
        {genes.map((g) => {
          const isSelected = selectedGeneId === g.gene_id;
          return (
            <div
              key={g.gene_id}
              onClick={() => onSelectGene(g)}
              style={{
                background: isSelected ? "#ffe600" : "#ffffff",
                border: "2.5px solid #000000",
                boxShadow: isSelected ? "4px 4px 0px #000000" : "2.5px 2.5px 0px #000000",
                transform: isSelected ? "translate(-2px, -2px)" : "none",
                borderRadius: "6px",
                padding: "0.85rem 1rem",
                cursor: "pointer",
                transition: "all 0.12s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "#fffce6";
                  e.currentTarget.style.transform = "translate(-2px, -2px)";
                  e.currentTarget.style.boxShadow = "4px 4px 0px #000000";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "2.5px 2.5px 0px #000000";
                }
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.15rem", fontFamily: "var(--font-mono)", color: "#000000" }}>
                    {g.symbol}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      background: isSelected ? "#ffffff" : "#00f0ff",
                      color: "#000000",
                      border: "1.5px solid #000000",
                      boxShadow: "1px 1px 0px #000000",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "3px"
                    }}
                  >
                    Chr {g.chromosome}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#333333", fontWeight: 600, marginBottom: "0.6rem" }}>
                  {g.name}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.5rem",
                  paddingTop: "0.5rem",
                  borderTop: "1.5px dashed #000000"
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "#555555", fontWeight: 700 }}>
                  {g.organism}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                    fontSize: "0.75rem",
                    color: "#000000",
                    fontWeight: 800,
                    textTransform: "uppercase"
                  }}
                >
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
