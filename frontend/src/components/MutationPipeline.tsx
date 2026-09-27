"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { MutationSimulateResponse } from "@/types";

interface MutationPipelineProps {
  simulation: MutationSimulateResponse | null;
  reducedMotion: boolean;
  onStageChange?: (stage: number) => void;
}

const STAGES = [
  { id: 1, title: "1. Original Sequence", desc: "Reference coding sequence loaded from NCBI" },
  { id: 2, title: "2. Coordinate Spotlight", desc: "Identifying target nucleotide position" },
  { id: 3, title: "3. Nucleotide Mutation", desc: "Single-base substitution applied" },
  { id: 4, title: "4. Codon Triplet Pulse", desc: "Affected reading frame & triplet bound" },
  { id: 5, title: "5. Information Flow", desc: "Biological propagation towards ribosome" },
  { id: 6, title: "6. Residue Translation", desc: "Evaluating codon-to-amino-acid shift" },
  { id: 7, title: "7. Protein Alteration", desc: "Mapping mutation onto peptide chain" },
  { id: 8, title: "8. Analysis Ready", desc: "Evidence & ML prediction models activated" }
];

export const MutationPipeline: React.FC<MutationPipelineProps> = ({
  simulation,
  reducedMotion,
  onStageChange
}) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1); // 0.5, 1, 2

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When a new simulation arrives, reset and start playback
  useEffect(() => {
    if (simulation) {
      setCurrentStage(reducedMotion ? 8 : 1);
      setIsPlaying(!reducedMotion);
    }
  }, [simulation, reducedMotion]);

  useEffect(() => {
    if (onStageChange) {
      onStageChange(currentStage);
    }
  }, [currentStage, onStageChange]);

  useEffect(() => {
    if (reducedMotion) {
      setIsPlaying(false);
      return;
    }

    if (isPlaying && currentStage < 8) {
      const duration = 1200 / speed;
      timerRef.current = setTimeout(() => {
        setCurrentStage((prev) => Math.min(8, prev + 1));
      }, duration);
    } else if (currentStage >= 8) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStage, speed, reducedMotion]);

  if (!simulation) return null;

  const {
    position,
    original_base,
    new_base,
    codon,
    amino_acid,
    local_window,
    classification,
    classification_description,
    transition_transversion
  } = simulation;

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
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="badge badge-cyan">Visual Propagation Centerpiece</span>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Molecular Transformation Pipeline
            </h2>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.2rem" }}>
            Watch the computational consequences ripple from DNA to Codon to Protein
          </p>
        </div>

        {/* Playback Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setCurrentStage((prev) => Math.max(1, prev - 1))}
            disabled={currentStage <= 1}
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.65rem" }}
            title="Step Back"
          >
            <SkipBack size={15} />
          </button>

          <button
            onClick={() => {
              if (currentStage >= 8) {
                setCurrentStage(1);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            className="btn btn-primary"
            style={{ padding: "0.4rem 0.9rem", minWidth: "95px" }}
          >
            {currentStage >= 8 ? (
              <>
                <RefreshCw size={14} /> Replay
              </>
            ) : isPlaying ? (
              <>
                <Pause size={14} /> Pause
              </>
            ) : (
              <>
                <Play size={14} /> Play
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentStage((prev) => Math.min(8, prev + 1))}
            disabled={currentStage >= 8}
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.65rem" }}
            title="Step Forward"
          >
            <SkipForward size={15} />
          </button>

          {/* Speed selector */}
          <select
            className="input-control"
            style={{ width: "auto", padding: "0.35rem 0.65rem", fontSize: "0.78rem", fontWeight: 700 }}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x</option>
            <option value={2}>2.0x</option>
          </select>
        </div>
      </div>

      {/* 8-Stage Progress Stepper Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "0.45rem", marginBottom: "1.5rem" }}>
        {STAGES.map((s) => {
          const isDone = currentStage >= s.id;
          const isCurrent = currentStage === s.id;
          return (
            <div
              key={s.id}
              onClick={() => {
                setCurrentStage(s.id);
                setIsPlaying(false);
              }}
              style={{
                background: isCurrent
                  ? "#ffe600"
                  : isDone
                  ? "#00e599"
                  : "#faf7f0",
                border: "2px solid #000000",
                boxShadow: isCurrent ? "3px 3px 0px #000000" : isDone ? "2px 2px 0px #000000" : "1px 1px 0px #000000",
                transform: isCurrent ? "translate(-2px, -2px)" : "none",
                padding: "0.5rem 0.35rem",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.12s ease"
              }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#000000", fontFamily: "var(--font-mono)" }}>
                Stage {s.id}
              </div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#222222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.title.split(". ")[1]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Visual Transformation Canvas */}
      <div
        style={{
          background: "#faf7f0",
          border: "2.5px solid #000000",
          boxShadow: "3px 3px 0px #000000",
          borderRadius: "6px",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
        }}
      >
        {/* Row 1: DNA Level Transformation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <span style={{ fontSize: "0.78rem", color: "#000000", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
              DNA Level (Local Window &plusmn;10 bp, Position {position}):
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", overflowX: "auto", padding: "0.5rem 0" }}>
              {local_window.original_window.split("").map((nt, idx) => {
                const isTarget = idx === local_window.highlight_offset;
                const showMutated = currentStage >= 3 && isTarget;
                const displayNt = showMutated ? new_base : nt;

                return (
                  <div
                    key={idx}
                    className={`nt-chip nt-${displayNt.toLowerCase()} ${
                      isTarget && currentStage >= 3
                        ? "nt-highlight-mut"
                        : isTarget && currentStage >= 2
                        ? "nt-highlight-orig"
                        : ""
                    }`}
                  >
                    {displayNt}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DNA Change Summary Chip */}
          <div
            style={{
              background: "#ffffff",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              borderRadius: "6px",
              padding: "0.75rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem"
            }}
          >
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.68rem", color: "#000000", fontWeight: 800, textTransform: "uppercase", display: "block" }}>Ref</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#00a86b", fontFamily: "var(--font-mono)" }}>{original_base}</span>
            </div>

            <ArrowRight size={22} color={currentStage >= 3 ? "#ff4d00" : "#888888"} />

            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.68rem", color: currentStage >= 3 ? "#ff4d00" : "#888888", fontWeight: 800, textTransform: "uppercase", display: "block" }}>Mut</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 800, color: currentStage >= 3 ? "#ff4d00" : "#888888", fontFamily: "var(--font-mono)" }}>
                {currentStage >= 3 ? new_base : "?"}
              </span>
            </div>

            <div style={{ borderLeft: "2px solid #000000", paddingLeft: "0.85rem", fontSize: "0.75rem", color: "#222222", fontWeight: 600 }}>
              <div>Pos: <strong>{position}</strong></div>
              <div>Type: <strong>{transition_transversion}</strong></div>
            </div>
          </div>
        </div>

        {/* Transmission Flow Beam (Stage 4 & 5) */}
        <div
          style={{
            height: "28px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: "100%",
              height: "3px",
              background: currentStage >= 5 ? "#00f0ff" : "#e0e0e0",
              border: "1px solid #000000",
              transition: "all 0.4s ease"
            }}
          />
          {currentStage >= 5 && (
            <span
              className="badge badge-cyan"
              style={{
                position: "absolute",
                fontSize: "0.68rem",
                padding: "0.2rem 0.6rem"
              }}
            >
              Information Flowing to Ribosomal Translation
            </span>
          )}
        </div>

        {/* Row 2: Codon & Amino Acid Translation (Stages 4, 6, 7) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* Codon Analysis Panel */}
          <div
            style={{
              background: currentStage >= 4 ? "#fff5e6" : "#ffffff",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              borderRadius: "6px",
              padding: "1rem",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#000000", textTransform: "uppercase" }}>
                Codon #{codon.codon_index} Triplet
              </span>
              <span className="badge badge-yellow" style={{ fontSize: "0.62rem" }}>
                Pos {codon.position_in_codon} of 3
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", margin: "0.65rem 0" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#555555", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Original</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.35rem", fontWeight: 800, color: "#00a86b" }}>
                  {codon.original_codon}
                </span>
              </div>

              <ArrowRight size={20} color={currentStage >= 4 ? "#ff4d00" : "#888888"} />

              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.68rem", color: currentStage >= 4 ? "#ff4d00" : "#888888", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Modified</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.35rem", fontWeight: 800, color: currentStage >= 4 ? "#ff4d00" : "#888888" }}>
                  {currentStage >= 4 ? codon.modified_codon : "---"}
                </span>
              </div>
            </div>
          </div>

          {/* Amino Acid Residue Translation Panel */}
          <div
            style={{
              background: currentStage >= 6 ? "#fef9c3" : "#ffffff",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              borderRadius: "6px",
              padding: "1rem",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#000000", textTransform: "uppercase" }}>
                Peptide Residue #{amino_acid.residue_index}
              </span>
              <span
                className={`badge ${
                  classification === "synonymous" ? "badge-green" : classification === "missense" ? "badge-amber" : "badge-red"
                }`}
                style={{ fontSize: "0.62rem" }}
              >
                {classification}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", margin: "0.65rem 0" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#555555", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Ref Residue</span>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#00a86b" }}>
                  {amino_acid.original_aa_name}
                </span>
              </div>

              <ArrowRight size={20} color={currentStage >= 6 ? "#ff4d00" : "#888888"} />

              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.68rem", color: currentStage >= 6 ? "#ff4d00" : "#888888", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Mut Residue</span>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: currentStage >= 6 ? "#ff4d00" : "#888888" }}>
                  {currentStage >= 6 ? amino_acid.modified_aa_name : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Consequence Banner (Stage 8) */}
        {currentStage >= 8 && (
          <div
            style={{
              background: "#ffffff",
              border: "2px solid #000000",
              boxShadow: "2.5px 2.5px 0px #000000",
              borderRadius: "6px",
              padding: "0.85rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <CheckCircle2 size={20} color="#00e599" />
              <div>
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#000000", textTransform: "uppercase" }}>
                  Pipeline Completed: {classification.toUpperCase()} CONSEQUENCE
                </span>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.15rem" }}>
                  {classification_description}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span className="badge badge-yellow">ML Inferred</span>
              <span className="badge badge-cyan">Evidence Linked</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
