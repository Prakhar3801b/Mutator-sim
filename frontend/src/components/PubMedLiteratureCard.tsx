"use client";

import React from "react";
import { BookOpen, ExternalLink, TrendingUp } from "lucide-react";
import { LiteratureResponse } from "@/types";

interface PubMedLiteratureCardProps {
  literature: LiteratureResponse | null;
  isLoading: boolean;
}

export const PubMedLiteratureCard: React.FC<PubMedLiteratureCardProps> = ({
  literature,
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
              background: "#ffe600",
              border: "2px solid #000000",
              boxShadow: "1.5px 1.5px 0px #000000",
              padding: "0.25rem",
              borderRadius: "4px"
            }}
          >
            <BookOpen size={18} color="#000000" />
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
            Biomedical Literature (PubMed)
          </h3>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "#000000", fontWeight: 700, fontSize: "0.85rem" }}>
          Querying PubMed citations & publication trends...
        </div>
      </div>
    );
  }

  if (!literature || literature.articles.length === 0) return null;

  const trendEntries = Object.entries(literature.publication_trend || {});
  const maxCount = Math.max(...trendEntries.map(([, cnt]) => cnt), 1);

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
              background: "#ffe600",
              border: "2px solid #000000",
              boxShadow: "1.5px 1.5px 0px #000000",
              padding: "0.25rem",
              borderRadius: "4px"
            }}
          >
            <BookOpen size={18} color="#000000" />
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
            PubMed Literature ({literature.gene_symbol})
          </h3>
        </div>
        <span className="badge badge-yellow">{literature.total_results} Citations</span>
      </div>

      {/* Publication Timeline Trend Bar */}
      {trendEntries.length > 0 && (
        <div
          style={{
            background: "#faf7f0",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0px #000000",
            marginBottom: "1rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 800, color: "#000000", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            <TrendingUp size={14} color="#000000" />
            Recent Publication Activity Trend:
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: "48px", paddingTop: "5px" }}>
            {trendEntries.map(([year, cnt]) => {
              const heightPct = Math.round((cnt / maxCount) * 100);
              return (
                <div key={year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${heightPct}%`,
                      minHeight: "6px",
                      background: "#00f0ff",
                      border: "1.5px solid #000000",
                      borderRadius: "2px",
                      transition: "height 0.3s ease"
                    }}
                    title={`${year}: ${cnt} papers`}
                  />
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#333333" }}>{year.slice(-2)}&apos;</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.25rem" }}>
        {literature.articles.map((art) => (
          <div
            key={art.pmid}
            style={{
              background: "#faf7f0",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              borderRadius: "4px",
              padding: "0.85rem"
            }}
          >
            <a
              href={art.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#000000",
                textDecoration: "none",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.5rem"
              }}
            >
              <span>{art.title}</span>
              <ExternalLink size={13} style={{ flexShrink: 0, marginTop: "2px", color: "#000000" }} />
            </a>

            <div style={{ fontSize: "0.75rem", color: "#444444", fontWeight: 600, marginTop: "0.35rem" }}>
              <span>{art.authors}</span> &bull; <em>{art.journal}</em> ({art.year})
            </div>

            <div style={{ fontSize: "0.7rem", color: "#666666", fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: "0.25rem" }}>
              PMID: {art.pmid}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
