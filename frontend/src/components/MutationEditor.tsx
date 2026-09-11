"use client";

import React from "react";
import { Zap, AlertCircle, Bookmark } from "lucide-react";
import { BenchmarkMutation } from "@/types";

interface MutationEditorProps {
  sequence: string;
  position: number;
  originalBase: string;
  newBase: string;
  onPositionChange: (pos: number) => void;
  onNewBaseChange: (base: string) => void;
  onSimulate: () => void;
  isSimulating: boolean;
  benchmarkMutations?: BenchmarkMutation[];
  onApplyBenchmark?: (bm: BenchmarkMutation) => void;
}

export const MutationEditor: React.FC<MutationEditorProps> = ({
  sequence,
  position,
  originalBase,
  newBase,
  onPositionChange,
  onNewBaseChange,
  onSimulate,
  isSimulating,
  benchmarkMutations,
  onApplyBenchmark
}) => {
  const bases = ["A", "C", "G", "T"];
  const isValid = originalBase && newBase && originalBase !== newBase && position >= 1 && position <= sequence.length;

  return (
    <div className="glass-panel panel-glow-cyan">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={20} color="var(--c-mutated)" />
            Hypothetical Mutation Simulator
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Introduce single-nucleotide substitutions into the coding sequence
          </p>
        </div>
        <span className="badge badge-amber">Single-Nucleotide Substitution (MVP)</span>
      </div>

      {/* Benchmark Presets if available */}
      {benchmarkMutations && benchmarkMutations.length > 0 && onApplyBenchmark && (
        <div style={{ marginBottom: "1.25rem", padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--c-flow)", marginBottom: "0.5rem" }}>
            <Bookmark size={14} />
            Quick Benchmark Presets:
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {benchmarkMutations.map((bm, i) => (
              <button
                key={i}
                onClick={() => onApplyBenchmark(bm)}
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
              >
                {bm.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr auto", gap: "1rem", alignItems: "flex-end" }}>
        {/* Position Input */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            CDS Position (1 - {sequence.length || 1})
          </label>
          <input
            type="number"
            min={1}
            max={sequence.length || 1}
            value={position || ""}
            onChange={(e) => onPositionChange(parseInt(e.target.value, 10) || 1)}
            className="input-control"
          />
        </div>

        {/* Original Base Display */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Original Nucleotide
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className={`nt-chip nt-${originalBase.toLowerCase()} nt-highlight-orig`}>
              {originalBase || "?"}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Reference
            </span>
          </div>
        </div>

        {/* New Base Selection */}
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Mutate Target To:
          </label>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {bases.map((b) => {
              const isSelected = newBase === b;
              const isSame = originalBase === b;
              return (
                <button
                  key={b}
                  type="button"
                  disabled={isSame}
                  onClick={() => onNewBaseChange(b)}
                  className={`nt-chip nt-${b.toLowerCase()} ${isSelected ? "nt-highlight-mut" : ""}`}
                  style={{
                    opacity: isSame ? 0.3 : 1,
                    cursor: isSame ? "not-allowed" : "pointer",
                    border: isSelected ? "2px solid #fff" : undefined
                  }}
                  title={isSame ? "Cannot mutate to identical base" : `Mutate to ${b}`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulate Action Button */}
        <div>
          <button
            onClick={onSimulate}
            disabled={!isValid || isSimulating}
            className="btn btn-simulate"
            style={{ opacity: !isValid || isSimulating ? 0.5 : 1, cursor: !isValid || isSimulating ? "not-allowed" : "pointer" }}
          >
            {isSimulating ? "Simulating..." : "Simulate Mutation"}
          </button>
        </div>
      </div>

      {/* Validation warning */}
      {originalBase === newBase && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", color: "var(--c-consequence)", fontSize: "0.8rem" }}>
          <AlertCircle size={15} />
          Please select a mutated base different from the reference nucleotide ({originalBase}).
        </div>
      )}
    </div>
  );
};
