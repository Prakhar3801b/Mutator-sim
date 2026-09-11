"use client";

import React, { useState } from "react";
import { SequenceRecord, TranscriptInfo } from "@/types";
import { Dna, Hash, Percent, Layers } from "lucide-react";

interface SequenceViewerProps {
  geneSymbol: string;
  transcripts: TranscriptInfo[];
  currentAccession: string;
  sequenceRecord: SequenceRecord | null;
  selectedPosition: number;
  onSelectPosition: (pos: number) => void;
  onSelectTranscript: (acc: string) => void;
}

export const SequenceViewer: React.FC<SequenceViewerProps> = ({
  geneSymbol,
  transcripts,
  currentAccession,
  sequenceRecord,
  selectedPosition,
  onSelectPosition,
  onSelectTranscript
}) => {
  const [jumpInput, setJumpInput] = useState("");

  if (!sequenceRecord) return null;

  const seq = sequenceRecord.sequence;
  const seqLength = seq.length;

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const pos = parseInt(jumpInput, 10);
    if (!isNaN(pos) && pos >= 1 && pos <= seqLength) {
      onSelectPosition(pos);
      setJumpInput("");
    }
  };

  // Group sequence into 3-nucleotide codons
  const codons = [];
  for (let i = 0; i < seqLength; i += 3) {
    codons.push({
      codonIndex: Math.floor(i / 3) + 1,
      startPos: i + 1,
      triplet: seq.slice(i, i + 3)
    });
  }

  const getNtClass = (nt: string) => {
    switch (nt.toUpperCase()) {
      case "A": return "nt-a";
      case "C": return "nt-c";
      case "G": return "nt-g";
      case "T": return "nt-t";
      default: return "";
    }
  };

  return (
    <div className="glass-panel">
      {/* Header & Stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Dna size={20} color="var(--c-flow)" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {geneSymbol} Coding Sequence (CDS)
            </h2>
            <span className="badge badge-cyan">{sequenceRecord.sequence_type}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {sequenceRecord.description || `NCBI RefSeq Record: ${currentAccession}`}
          </div>
        </div>

        {/* Transcript Selector */}
        {transcripts.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={15} color="var(--text-muted)" />
            <select
              className="input-control"
              style={{ width: "auto", fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
              value={currentAccession}
              onChange={(e) => onSelectTranscript(e.target.value)}
            >
              {transcripts.map((t) => (
                <option key={t.accession} value={t.accession}>
                  {t.accession} ({t.cds_length || sequenceRecord.length} bp)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.03)", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
          <Hash size={14} color="var(--text-muted)" />
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Length:</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{seqLength} bp ({Math.floor(seqLength / 3)} codons)</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.03)", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
          <Percent size={14} color="var(--text-muted)" />
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>GC Content:</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{sequenceRecord.gc_content}%</span>
        </div>

        {/* Jump-to coordinate tool */}
        <form onSubmit={handleJump} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Jump to bp:</span>
          <input
            type="number"
            min={1}
            max={seqLength}
            placeholder={`1 - ${seqLength}`}
            className="input-control"
            style={{ width: "110px", padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}>
            Go
          </button>
        </form>
      </div>

      {/* Interactive Nucleotide Ribbon */}
      <div style={{
        background: "rgba(0,0,0,0.3)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "1rem",
        overflowX: "auto",
        display: "flex",
        gap: "0.75rem",
        alignItems: "center"
      }}>
        {codons.map((codon) => {
          return (
            <div
              key={codon.codonIndex}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.02)",
                padding: "0.4rem 0.35rem",
                borderRadius: "var(--radius-sm)",
                border: "1px dashed rgba(255,255,255,0.1)",
                minWidth: "110px"
              }}
            >
              <span style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginBottom: "0.3rem" }}>
                Codon #{codon.codonIndex}
              </span>

              <div style={{ display: "flex", gap: "0.2rem" }}>
                {codon.triplet.split("").map((nt, offset) => {
                  const currentPos = codon.startPos + offset;
                  const isSelected = selectedPosition === currentPos;
                  return (
                    <div
                      key={currentPos}
                      onClick={() => onSelectPosition(currentPos)}
                      title={`Position ${currentPos}: ${nt} (Click to set mutation)`}
                      className={`nt-chip ${getNtClass(nt)} ${isSelected ? "nt-highlight-orig" : ""}`}
                      style={{ cursor: "pointer" }}
                    >
                      {nt}
                    </div>
                  );
                })}
              </div>

              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                bp {codon.startPos}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
        💡 Click on any nucleotide above to set it as the mutation position.
      </div>
    </div>
  );
};
