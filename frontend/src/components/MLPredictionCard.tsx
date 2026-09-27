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
            <Cpu size={18} color="#000000" />
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
            ML Variant Impact Predictor
          </h3>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "#000000", fontWeight: 700, fontSize: "0.85rem" }}>
          Extracting physicochemical features & running Random Forest inference...
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const probPct = Math.round(prediction.pathogenic_probability * 100);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
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
              <Cpu size={18} color="#000000" />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Machine Learning Impact Prediction
            </h3>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.15rem" }}>
            {prediction.model_name} (Resource-Efficient In-Silico Classifier)
          </p>
        </div>

        <span
          className="badge"
          style={{
            backgroundColor: "#ffe600",
            color: "#000000",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0px #000000"
          }}
        >
          {prediction.risk_tier}
        </span>
      </div>

      {/* Pathogenicity Probability Meter */}
      <div
        style={{
          background: "#faf7f0",
          border: "2.5px solid #000000",
          boxShadow: "3px 3px 0px #000000",
          borderRadius: "6px",
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "#000000", fontWeight: 700, textTransform: "uppercase" }}>
            Deleterious / Pathogenicity Probability Score:
          </span>
          <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#000000", fontFamily: "var(--font-mono)" }}>
            {prediction.pathogenic_probability.toFixed(3)} ({probPct}%)
          </span>
        </div>

        {/* Meter Bar */}
        <div
          style={{
            width: "100%",
            height: "14px",
            background: "#ffffff",
            border: "2px solid #000000",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <div
            style={{
              width: `${probPct}%`,
              height: "100%",
              background: `linear-gradient(90deg, #00e599, #ffe600 50%, #ff4d00 100%)`,
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#555555", fontWeight: 700, marginTop: "0.45rem", fontFamily: "var(--font-mono)" }}>
          <span>0.0 (Benign / Tolerated)</span>
          <span>0.5 (Uncertain / VUS)</span>
          <span>1.0 (Highly Damaging)</span>
        </div>
      </div>

      {/* Explainable Feature Breakdown */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 800, color: "#000000", textTransform: "uppercase", marginBottom: "0.6rem" }}>
          <HelpCircle size={15} color="#000000" />
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
                  background: "#faf7f0",
                  borderRadius: "4px",
                  padding: "0.6rem 0.85rem",
                  border: "2px solid #000000",
                  boxShadow: "2px 2px 0px #000000"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", marginBottom: "0.35rem" }}>
                  <span style={{ fontWeight: 800, color: "#000000" }}>{feat.feature_label}</span>
                  <span style={{ color: isPositive ? "#ff4d00" : "#00a86b", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {feat.interpretation}
                  </span>
                </div>

                {/* Magnitude bar */}
                <div style={{ width: "100%", height: "6px", background: "#ffffff", border: "1.5px solid #000000", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: "100%",
                      background: isPositive ? "#ff4d00" : "#00e599"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Disclaimer */}
      <div
        style={{
          background: "#fff2e8",
          border: "2px solid #000000",
          boxShadow: "2px 2px 0px #000000",
          borderRadius: "6px",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.6rem",
          fontSize: "0.78rem",
          color: "#000000",
          fontWeight: 600
        }}
      >
        <AlertTriangle size={16} color="#ff4d00" style={{ flexShrink: 0, marginTop: "2px" }} />
        <span>{prediction.scientific_disclaimer}</span>
      </div>
    </div>
  );
};
