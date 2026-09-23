"use client";

import React, { useState } from "react";
import { OrganImpact } from "@/types";

interface HumanBodyCanvasProps {
  affectedOrgans: OrganImpact[];
  selectedOrganId: string | null;
  onSelectOrgan: (organId: string) => void;
}

interface OrganCoordinate {
  id: string;
  name: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  anchor: "start" | "end" | "middle";
  system: string;
}

// Organ hotspots positioned over anatomical human silhouette (Reference 3)
const ORGAN_COORDINATES: OrganCoordinate[] = [
  { id: "brain", name: "Brain / CNS", cx: 200, cy: 68, labelX: 95, labelY: 65, anchor: "end", system: "Nervous" },
  { id: "thyroid", name: "Thyroid & Neck", cx: 200, cy: 118, labelX: 95, labelY: 118, anchor: "end", system: "Endocrine" },
  { id: "lungs", name: "Lungs & Bronchi", cx: 178, cy: 185, labelX: 85, labelY: 175, anchor: "end", system: "Respiratory" },
  { id: "breasts", name: "Breasts / Mammary", cx: 224, cy: 195, labelX: 310, labelY: 195, anchor: "start", system: "Reproductive" },
  { id: "heart", name: "Heart & Aorta", cx: 204, cy: 200, labelX: 95, labelY: 215, anchor: "end", system: "Circulatory" },
  { id: "liver", name: "Liver / Biliary", cx: 182, cy: 250, labelX: 85, labelY: 255, anchor: "end", system: "Digestive" },
  { id: "pancreas", name: "Pancreas", cx: 212, cy: 260, labelX: 310, labelY: 255, anchor: "start", system: "Endocrine" },
  { id: "spleen", name: "Spleen", cx: 225, cy: 245, labelX: 310, labelY: 235, anchor: "start", system: "Immune" },
  { id: "kidneys", name: "Kidneys & Adrenals", cx: 190, cy: 280, labelX: 85, labelY: 295, anchor: "end", system: "Urinary" },
  { id: "ovaries", name: "Ovaries / Uterus", cx: 200, cy: 330, labelX: 95, labelY: 335, anchor: "end", system: "Reproductive" },
  { id: "prostate", name: "Prostate / Testes", cx: 200, cy: 345, labelX: 310, labelY: 345, anchor: "start", system: "Reproductive" },
  { id: "bones", name: "Skeletal / Femur", cx: 172, cy: 430, labelX: 75, labelY: 430, anchor: "end", system: "Musculoskeletal" },
  { id: "blood", name: "Bone Marrow / Blood", cx: 200, cy: 220, labelX: 310, labelY: 155, anchor: "start", system: "Hematopoietic" },
  { id: "skin", name: "Skin & Sweat Glands", cx: 260, cy: 280, labelX: 315, labelY: 285, anchor: "start", system: "Integumentary" }
];

export const HumanBodyCanvas: React.FC<HumanBodyCanvasProps> = ({
  affectedOrgans,
  selectedOrganId,
  onSelectOrgan
}) => {
  const [hoveredOrganId, setHoveredOrganId] = useState<string | null>(null);

  // Map affected organ severity
  const affectedMap = React.useMemo(() => {
    const map = new Map<string, OrganImpact>();
    affectedOrgans.forEach((o) => {
      // normalize key
      const key = o.id.toLowerCase();
      map.set(key, o);
    });
    return map;
  }, [affectedOrgans]);

  return (
    <div
      className="glass-panel"
      style={{
        position: "relative",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 15, 25, 0.95) 100%)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        minHeight: "680px"
      }}
    >
      {/* Header controls overlay */}
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          left: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem"
        }}
      >
        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-flow)", fontWeight: 700 }}>
          Interactive Anatomy Telemetry
        </span>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {affectedOrgans.length} Systemic Organ Targets Identified
        </span>
      </div>

      {/* Legend Badge */}
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.5rem",
          display: "flex",
          gap: "0.5rem"
        }}
      >
        <span className="badge badge-red" style={{ fontSize: "0.65rem" }}>
          High Impact
        </span>
        <span className="badge badge-amber" style={{ fontSize: "0.65rem" }}>
          Moderate
        </span>
        <span className="badge badge-cyan" style={{ fontSize: "0.65rem" }}>
          Target Node
        </span>
      </div>

      {/* Vector Medical Body Canvas matching Reference 3 */}
      <svg
        viewBox="0 0 400 620"
        style={{ width: "100%", maxWidth: "460px", height: "auto" }}
      >
        <defs>
          {/* Subtle gradient for body outline */}
          <linearGradient id="bodyLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="highlightThigh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.15" />
          </linearGradient>

          <filter id="glowDrop" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Anatomical Human Body Silhouette Lines */}
        <g stroke="url(#bodyLineGrad)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
          {/* Head & Neck */}
          <path d="M 182 45 C 182 30, 218 30, 218 45 C 224 55, 222 75, 212 90 L 210 115" />
          <path d="M 182 45 C 176 55, 178 75, 188 90 L 190 115" />
          {/* Facial feature guides */}
          <path d="M 194 62 L 206 62" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M 196 74 L 204 74" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M 198 67 L 202 70" strokeWidth="1" strokeOpacity="0.4" />

          {/* Shoulders & Clavicle */}
          <path d="M 190 115 C 160 118, 140 135, 125 155" />
          <path d="M 210 115 C 240 118, 260 135, 275 155" />
          <path d="M 175 125 C 190 132, 210 132, 225 125" strokeWidth="1" strokeOpacity="0.5" />

          {/* Chest & Ribcage Cage */}
          <path d="M 155 155 C 165 175, 168 210, 162 245" />
          <path d="M 245 155 C 235 175, 232 210, 238 245" />
          {/* Pectoral contours */}
          <path d="M 170 175 C 185 190, 198 185, 200 185" strokeWidth="1.2" strokeOpacity="0.6" />
          <path d="M 230 175 C 215 190, 202 185, 200 185" strokeWidth="1.2" strokeOpacity="0.6" />
          {/* Sternum */}
          <line x1="200" y1="140" x2="200" y2="215" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 3" />

          {/* Abdomen & Waist */}
          <path d="M 162 245 C 158 275, 162 305, 170 330" />
          <path d="M 238 245 C 242 275, 238 305, 230 330" />
          {/* Abdominal muscle contours (rectus abdominis) */}
          <path d="M 186 230 C 194 235, 206 235, 214 230" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M 186 260 C 194 265, 206 265, 214 260" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M 188 290 C 195 295, 205 295, 212 290" strokeWidth="1" strokeOpacity="0.4" />

          {/* Arms (Left & Right) */}
          <path d="M 125 155 C 115 195, 110 240, 105 290 L 98 335" />
          <path d="M 142 175 C 132 215, 128 255, 122 295 L 115 335" />
          <path d="M 275 155 C 285 195, 290 240, 295 290 L 302 335" />
          <path d="M 258 175 C 268 215, 272 255, 278 295 L 285 335" />

          {/* Pelvis & Inguinal */}
          <path d="M 170 330 C 185 348, 200 350, 200 350" />
          <path d="M 230 330 C 215 348, 200 350, 200 350" />

          {/* Legs & Knees */}
          {/* Right Leg Highlight Zone (Reference 3 styling) */}
          <path
            d="M 170 330 C 160 380, 155 425, 160 470 C 165 510, 168 555, 170 590 L 188 590 C 188 555, 185 510, 185 470 C 188 425, 195 380, 200 350 Z"
            fill="url(#highlightThigh)"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />

          {/* Left Leg */}
          <path d="M 200 350 C 205 380, 212 425, 215 470 C 215 510, 212 555, 212 590 L 230 590 C 232 555, 235 510, 240 470 C 245 425, 240 380, 230 330" />
          {/* Knee joints */}
          <ellipse cx="172.5" cy="470" rx="9" ry="6" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
          <ellipse cx="227.5" cy="470" rx="9" ry="6" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
        </g>

        {/* Anatomical Pointer Callout Lines & Interactive Hotspot Nodes */}
        {ORGAN_COORDINATES.map((org) => {
          const impact = affectedMap.get(org.id);
          const isAffected = !!impact;
          const isSelected = selectedOrganId === org.id;
          const isHovered = hoveredOrganId === org.id;

          const severityColor =
            impact?.severity === "high"
              ? "#f43f5e"
              : impact?.severity === "moderate"
              ? "#f59e0b"
              : "#38bdf8";

          return (
            <g
              key={org.id}
              className={`hotspot-node ${isSelected ? "active" : ""}`}
              onClick={() => onSelectOrgan(org.id)}
              onMouseEnter={() => setHoveredOrganId(org.id)}
              onMouseLeave={() => setHoveredOrganId(null)}
            >
              {/* Connector line from node to label */}
              {isAffected && (
                <line
                  x1={org.cx}
                  y1={org.cy}
                  x2={org.labelX}
                  y2={org.labelY}
                  stroke={isSelected ? severityColor : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth={isSelected ? "1.5" : "1"}
                  strokeDasharray={isSelected ? "none" : "3 3"}
                  opacity={isSelected || isHovered ? 1 : 0.6}
                />
              )}

              {/* Pulsing radar wave when active/affected */}
              {isAffected && (
                <circle
                  cx={org.cx}
                  cy={org.cy}
                  r="12"
                  fill="none"
                  stroke={severityColor}
                  className="radar-ring"
                />
              )}

              {/* Center Hotspot Pin */}
              <circle
                className="hotspot-pin"
                cx={org.cx}
                cy={org.cy}
                r={isSelected ? 8.5 : isAffected ? 6.5 : 4.5}
                fill={isAffected ? severityColor : "rgba(148, 163, 184, 0.4)"}
                stroke={isSelected ? "#ffffff" : isAffected ? "rgba(255,255,255,0.7)" : "rgba(255, 255, 255, 0.2)"}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter={isAffected ? "url(#glowDrop)" : "none"}
              />

              {/* Label text */}
              {isAffected && (
                <text
                  x={org.labelX}
                  y={org.labelY - 4}
                  textAnchor={org.anchor}
                  fill={isSelected ? "#ffffff" : isHovered ? severityColor : "#94a3b8"}
                  fontSize={isSelected ? "12px" : "11px"}
                  fontWeight={isSelected ? "700" : "500"}
                  letterSpacing="0.02em"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)", cursor: "pointer" }}
                >
                  {impact?.name || org.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Magnification Loupe Circle (matching Reference 3 Knee Zoom) */}
        {selectedOrganId === "bones" && (
          <g transform="translate(240, 420)">
            <circle cx="0" cy="0" r="42" fill="rgba(15, 23, 42, 0.9)" stroke="#f59e0b" strokeWidth="2.5" />
            <path
              d="M -15 -25 C 0 -10, 10 10, 15 25"
              stroke="#f43f5e"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M -25 15 C -10 5, 5 -15, 20 -20"
              stroke="#fbbf24"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            <text x="0" y="32" textAnchor="middle" fill="#f8fafc" fontSize="9px" fontWeight="700">
              Vaso-Occlusion Zone
            </text>
          </g>
        )}
      </svg>

      {/* Sub-label */}
      <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-dim)", textAlign: "center" }}>
        Click any organ pin to review deep physiological impact, symptoms, and biochemical pathways
      </div>
    </div>
  );
};
