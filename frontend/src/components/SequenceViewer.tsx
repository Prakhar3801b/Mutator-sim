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
      {/* Header & Stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                background: "#00f0ff",
                border: "2px solid #000000",
                boxShadow: "1.5px 1.5px 0px #000000",
                padding: "0.25rem",
                borderRadius: "4px"
              }}
            >
              <Dna size={18} color="#000000" />
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              {geneSymbol} Coding Sequence (CDS)
            </h2>
            <span className="badge badge-cyan">{sequenceRecord.sequence_type}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.25rem" }}>
            {sequenceRecord.description || `NCBI RefSeq Record: ${currentAccession}`}
          </div>
        </div>

        {/* Transcript Selector */}
        {transcripts.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={16} color="#000000" />
            <select
              className="input-control"
              style={{ width: "auto", fontSize: "0.8rem", padding: "0.4rem 0.8rem", fontWeight: 700 }}
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
      <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "#faf7f0",
            padding: "0.45rem 0.85rem",
            borderRadius: "4px",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0px #000000"
          }}
        >
          <Hash size={14} color="#000000" />
          <span style={{ fontSize: "0.78rem", color: "#555555", fontWeight: 700 }}>Length:</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
            {seqLength} bp ({Math.floor(seqLength / 3)} codons)
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "#faf7f0",
            padding: "0.45rem 0.85rem",
            borderRadius: "4px",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0px #000000"
          }}
        >
          <Percent size={14} color="#000000" />
          <span style={{ fontSize: "0.78rem", color: "#555555", fontWeight: 700 }}>GC Content:</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
            {sequenceRecord.gc_content}%
          </span>
        </div>

        {/* Jump-to coordinate tool */}
        <form onSubmit={handleJump} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
          <span style={{ fontSize: "0.78rem", color: "#000000", fontWeight: 700 }}>Jump to bp:</span>
          <input
            type="number"
            min={1}
            max={seqLength}
            placeholder={`1 - ${seqLength}`}
            className="input-control"
            style={{ width: "115px", padding: "0.35rem 0.6rem", fontSize: "0.8rem", fontWeight: 700 }}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem" }}>
            GO
          </button>
        </form>
      </div>

      {/* Interactive Nucleotide Ribbon */}
      <div
        style={{
          background: "#faf7f0",
          border: "2.5px solid #000000",
          boxShadow: "3px 3px 0px #000000",
          borderRadius: "6px",
          padding: "1rem",
          overflowX: "auto",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center"
        }}
      >
        {codons.map((codon) => {
          return (
            <div
              key={codon.codonIndex}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#ffffff",
                padding: "0.5rem 0.45rem",
                borderRadius: "4px",
                border: "2px solid #000000",
                boxShadow: "1.5px 1.5px 0px #000000",
                minWidth: "115px"
              }}
            >
              <span style={{ fontSize: "0.68rem", color: "#000000", fontWeight: 800, fontFamily: "var(--font-mono)", marginBottom: "0.35rem" }}>
                CODON #{codon.codonIndex}
              </span>

              <div style={{ display: "flex", gap: "0.3rem" }}>
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

              <span style={{ fontSize: "0.68rem", color: "#555555", fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: "0.35rem" }}>
                bp {codon.startPos}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: "0.78rem", color: "#222222", fontWeight: 700, marginTop: "0.65rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span className="badge badge-yellow" style={{ fontSize: "0.65rem" }}>TIP</span>
        Click any nucleotide above to set it as the mutation position in the simulator.
      </div>
    </div>
  );
};
