"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Globe, Check } from "lucide-react";
import { GeneSearchItem } from "@/types";
import { searchNCBIGenes } from "@/lib/api";

interface GeneSearchProps {
  onSelectGene: (geneId: string, symbol: string) => void;
  selectedGeneId: string | null;
}

export const GeneSearch: React.FC<GeneSearchProps> = ({
  onSelectGene,
  selectedGeneId
}) => {
  const [query, setQuery] = useState("");
  const [organism, setOrganism] = useState("Homo sapiens");
  const [results, setResults] = useState<GeneSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (searchQuery: string, org: string, targetPage: number) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await searchNCBIGenes(searchQuery.trim(), org, targetPage);
      setResults(data.results);
      setTotalCount(data.total_count);
    } catch (err) {
      console.error("Gene search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (query.trim().length > 1) {
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        performSearch(query, organism, 1);
      }, 350);
    } else {
      setResults([]);
      setHasSearched(false);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, organism]);

  return (
    <div className="glass-panel">
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Search NCBI by gene symbol, name, or Gene ID (e.g. BRCA1, 672, TP53)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <Loader2 size={18} className="anim-spin" style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--c-flow)" }} />
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Globe size={16} color="var(--text-muted)" />
          <select
            className="input-control"
            style={{ width: "auto", minWidth: "170px" }}
            value={organism}
            onChange={(e) => setOrganism(e.target.value)}
          >
            <option value="Homo sapiens">Homo sapiens (Human)</option>
            <option value="Mus musculus">Mus musculus (Mouse)</option>
            <option value="Drosophila melanogaster">Drosophila (Fruit fly)</option>
            <option value="Danio rerio">Danio rerio (Zebrafish)</option>
            <option value="all">All Organisms</option>
          </select>
        </div>
      </div>

      {/* Results Dropdown / Grid */}
      {hasSearched && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto", paddingRight: "0.25rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Found {totalCount} matching gene records in NCBI:
          </div>
          {results.map((r) => {
            const isSelected = selectedGeneId === r.gene_id;
            return (
              <div
                key={r.gene_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  background: isSelected ? "rgba(0, 242, 254, 0.12)" : "rgba(255, 255, 255, 0.02)",
                  border: isSelected ? "1px solid #00f2fe" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  transition: "all 0.15s ease"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, color: "#fff" }}>{r.symbol}</span>
                    <span className="badge badge-purple" style={{ fontSize: "0.6rem" }}>ID: {r.gene_id}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Chr {r.chromosome}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {r.name}
                  </div>
                </div>

                <button
                  onClick={() => onSelectGene(r.gene_id, r.symbol)}
                  className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                >
                  {isSelected ? (
                    <>
                      <Check size={14} /> Selected
                    </>
                  ) : (
                    "Select Gene"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {hasSearched && !isLoading && results.length === 0 && (
        <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          No genes found for &quot;{query}&quot; in {organism}. Try checking spelling or selecting another organism.
        </div>
      )}
    </div>
  );
};
