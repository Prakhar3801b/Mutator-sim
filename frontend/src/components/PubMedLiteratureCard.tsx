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
      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookOpen size={18} color="var(--c-flow)" />
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Biomedical Literature (PubMed)</h3>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Querying PubMed citations & publication trends...
        </div>
      </div>
    );
  }

  if (!literature || literature.articles.length === 0) return null;

  const trendEntries = Object.entries(literature.publication_trend || {});
  const maxCount = Math.max(...trendEntries.map(([, cnt]) => cnt), 1);

  return (
    <div className="glass-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookOpen size={18} color="var(--c-flow)" />
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
            PubMed Literature ({literature.gene_symbol})
          </h3>
        </div>
        <span className="badge badge-cyan">{literature.total_results} Citations</span>
      </div>

      {/* Publication Timeline Trend Bar */}
      {trendEntries.length > 0 && (
        <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            <TrendingUp size={14} color="var(--c-flow)" />
            Recent Publication Activity Trend:
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: "45px", paddingTop: "5px" }}>
            {trendEntries.map(([year, cnt]) => {
              const heightPct = Math.round((cnt / maxCount) * 100);
              return (
                <div key={year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${heightPct}%`,
                      minHeight: "4px",
                      background: "linear-gradient(180deg, #00f2fe, #0072ff)",
                      borderRadius: "2px",
                      transition: "height 0.3s ease"
                    }}
                    title={`${year}: ${cnt} papers`}
                  />
                  <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>{year.slice(-2)}&apos;</span>
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
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem"
            }}
          >
            <a
              href={art.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#f1f5f9",
                textDecoration: "none",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.5rem"
              }}
            >
              <span>{art.title}</span>
              <ExternalLink size={13} style={{ flexShrink: 0, marginTop: "2px", color: "var(--c-flow)" }} />
            </a>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              <span>{art.authors}</span> • <em>{art.journal}</em> ({art.year})
            </div>

            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>
              PMID: {art.pmid}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
