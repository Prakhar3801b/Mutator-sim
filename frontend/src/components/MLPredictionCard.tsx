"use client";

import React from "react";
import { Cpu, AlertTriangle, HelpCircle } from "lucide-react";
import { PredictionResponse } from "@/types";

interface MLPredictionCardProps {
  prediction: PredictionResponse | null;
  isLoading: boolean;
}

export const MLPredictionCard: React.FC<MLPredictionCardProps> = ({
  prediction,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="glass-panel panel-glow-purple" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Cpu size={18} color="var(--c-ml)" />
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>ML Variant Impact Predictor</h3>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Extracting physicochemical features & running Random Forest inference...
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const probPct = Math.round(prediction.pathogenic_probability * 100);

  return (
    <div className="glass-panel panel-glow-purple">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Cpu size={18} color="var(--c-ml)" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              Machine Learning Impact Prediction
            </h3>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
            {prediction.model_name} (Resource-Efficient In-Silico Classifier)
          </p>
        </div>

        <span
          className="badge"
          style={{
            backgroundColor: `${prediction.risk_color}25`,
            color: prediction.risk_color,
            borderColor: `${prediction.risk_color}50`
          }}
        >
          {prediction.risk_tier}
        </span>
      </div>

      {/* Pathogenicity Probability Meter */}
      <div style={{
        background: "rgba(0,0,0,0.3)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Deleterious / Pathogenicity Probability Score:
          </span>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: prediction.risk_color }}>
            {prediction.pathogenic_probability.toFixed(3)} ({probPct}%)
          </span>
        </div>

        {/* Meter Bar */}
        <div style={{
          width: "100%",
          height: "10px",
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: "5px",
          overflow: "hidden",
          position: "relative"
        }}>
          <div
            style={{
              width: `${probPct}%`,
              height: "100%",
              background: `linear-gradient(90deg, #10b981, #f59e0b 50%, #ef4444 100%)`,
              borderRadius: "5px",
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "0.35rem" }}>
          <span>0.0 (Benign / Tolerated)</span>
          <span>0.5 (Uncertain / VUS)</span>
          <span>1.0 (Highly Damaging)</span>
        </div>
      </div>

      {/* Explainable Feature Breakdown */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.6rem" }}>
          <HelpCircle size={14} color="var(--c-ml)" />
          Key Feature Contribution Breakdown:
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {prediction.feature_contributions.map((feat) => {
            const isPositive = feat.contribution > 0;
            const barWidth = Math.min(100, Math.abs(feat.contribution) * 100);

            return (
              <div
                key={feat.feature_name}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, color: "#fff" }}>{feat.feature_label}</span>
                  <span style={{ color: isPositive ? "var(--c-mutated)" : "var(--c-original)", fontWeight: 700 }}>
                    {feat.interpretation}
                  </span>
                </div>

                {/* Magnitude bar */}
                <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: "100%",
                      background: isPositive ? "var(--c-mutated)" : "var(--c-original)",
                      borderRadius: "2px"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Disclaimer */}
      <div style={{
        background: "rgba(239, 68, 68, 0.08)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "var(--radius-md)",
        padding: "0.75rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.5rem",
        fontSize: "0.75rem",
        color: "#fca5a5"
      }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
        <span>{prediction.scientific_disclaimer}</span>
      </div>
    </div>
  );
};
