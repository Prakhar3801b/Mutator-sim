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

// Organ hotspots positioned over anatomical human silhouette
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
      const key = o.id.toLowerCase();
      map.set(key, o);
    });
    return map;
  }, [affectedOrgans]);

  return (
    <div
      className="neo-card"
      style={{
        position: "relative",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        border: "3px solid #000000",
        boxShadow: "5px 5px 0px #000000",
        borderRadius: "8px",
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
          gap: "0.2rem"
        }}
      >
        <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#000000", fontWeight: 800 }}>
          Interactive Anatomy Telemetry
        </span>
        <span style={{ fontSize: "0.82rem", color: "#333333", fontWeight: 700 }}>
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
          gap: "0.45rem"
        }}
      >
        <span className="badge badge-red" style={{ fontSize: "0.62rem" }}>
          High Impact
        </span>
        <span className="badge badge-amber" style={{ fontSize: "0.62rem" }}>
          Moderate
        </span>
        <span className="badge badge-cyan" style={{ fontSize: "0.62rem" }}>
          Target Node
        </span>
      </div>

      {/* Vector Medical Body Canvas */}
      <svg
        viewBox="0 0 400 620"
        style={{ width: "100%", maxWidth: "460px", height: "auto" }}
      >
        <defs>
          <linearGradient id="bodyLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="highlightThigh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe600" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffe600" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Anatomical Human Body Silhouette Lines */}
        <g stroke="url(#bodyLineGrad)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Head & Neck */}
          <path d="M 182 45 C 182 30, 218 30, 218 45 C 224 55, 222 75, 212 90 L 210 115" />
          <path d="M 182 45 C 176 55, 178 75, 188 90 L 190 115" />
          {/* Facial feature guides */}
          <path d="M 194 62 L 206 62" strokeWidth="1.2" strokeOpacity="0.4" />
          <path d="M 196 74 L 204 74" strokeWidth="1.2" strokeOpacity="0.4" />
          <path d="M 198 67 L 202 70" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Shoulders & Clavicle */}
          <path d="M 190 115 C 160 118, 140 135, 125 155" />
          <path d="M 210 115 C 240 118, 260 135, 275 155" />
          <path d="M 175 125 C 190 132, 210 132, 225 125" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Chest & Ribcage */}
          <path d="M 155 155 C 165 175, 168 210, 162 245" />
          <path d="M 245 155 C 235 175, 232 210, 238 245" />
          {/* Pectoral contours */}
          <path d="M 170 175 C 185 190, 198 185, 200 185" strokeWidth="1.4" strokeOpacity="0.5" />
          <path d="M 230 175 C 215 190, 202 185, 200 185" strokeWidth="1.4" strokeOpacity="0.5" />
          {/* Sternum */}
          <line x1="200" y1="140" x2="200" y2="215" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="3 3" />

          {/* Abdomen & Waist */}
          <path d="M 162 245 C 158 275, 162 305, 170 330" />
          <path d="M 238 245 C 242 275, 238 305, 230 330" />
          {/* Abdominal muscle contours */}
          <path d="M 186 230 C 194 235, 206 235, 214 230" strokeWidth="1.2" strokeOpacity="0.3" />
          <path d="M 186 260 C 194 265, 206 265, 214 260" strokeWidth="1.2" strokeOpacity="0.3" />
          <path d="M 188 290 C 195 295, 205 295, 212 290" strokeWidth="1.2" strokeOpacity="0.3" />

          {/* Arms (Left & Right) */}
          <path d="M 125 155 C 115 195, 110 240, 105 290 L 98 335" />
          <path d="M 142 175 C 132 215, 128 255, 122 295 L 115 335" />
          <path d="M 275 155 C 285 195, 290 240, 295 290 L 302 335" />
          <path d="M 258 175 C 268 215, 272 255, 278 295 L 285 335" />

          {/* Pelvis */}
          <path d="M 170 330 C 185 348, 200 350, 200 350" />
          <path d="M 230 330 C 215 348, 200 350, 200 350" />

          {/* Legs & Knees */}
          {/* Right Leg Highlight Zone */}
          <path
            d="M 170 330 C 160 380, 155 425, 160 470 C 165 510, 168 555, 170 590 L 188 590 C 188 555, 185 510, 185 470 C 188 425, 195 380, 200 350 Z"
            fill="url(#highlightThigh)"
            stroke="#000000"
            strokeWidth="1.5"
          />

          {/* Left Leg */}
          <path d="M 200 350 C 205 380, 212 425, 215 470 C 215 510, 212 555, 212 590 L 230 590 C 232 555, 235 510, 240 470 C 245 425, 240 380, 230 330" />
          {/* Knee joints */}
          <ellipse cx="172.5" cy="470" rx="9" ry="6" stroke="#000000" strokeWidth="1.5" />
          <ellipse cx="227.5" cy="470" rx="9" ry="6" stroke="#000000" strokeWidth="1.5" />
        </g>

        {/* Anatomical Pointer Callout Lines & Interactive Hotspot Nodes */}
        {ORGAN_COORDINATES.map((org) => {
          const impact = affectedMap.get(org.id);
          const isAffected = !!impact;
          const isSelected = selectedOrganId === org.id;
          const isHovered = hoveredOrganId === org.id;

          const severityColor =
            impact?.severity === "high"
              ? "#ff3344"
              : impact?.severity === "moderate"
              ? "#ff9100"
              : "#00f0ff";

          return (
            <g
              key={org.id}
              className={`hotspot-node ${isSelected ? "active" : ""}`}
              onClick={() => onSelectOrgan(org.id)}
              onMouseEnter={() => setHoveredOrganId(org.id)}
              onMouseLeave={() => setHoveredOrganId(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Connector line from node to label */}
              {isAffected && (
                <line
                  x1={org.cx}
                  y1={org.cy}
                  x2={org.labelX}
                  y2={org.labelY}
                  stroke="#000000"
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  strokeDasharray={isSelected ? "none" : "3 3"}
                  opacity={isSelected || isHovered ? 1 : 0.7}
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
                r={isSelected ? 8.5 : isAffected ? 6.5 : 4}
                fill={isAffected ? severityColor : "#faf7f0"}
                stroke="#000000"
                strokeWidth={isSelected ? 3 : 2}
              />

              {/* Label text if affected or hovered */}
              {isAffected && (
                <g>
                  <rect
                    x={org.anchor === "end" ? org.labelX - 95 : org.labelX - 5}
                    y={org.labelY - 12}
                    width="100"
                    height="20"
                    fill={isSelected ? "#ffe600" : "#ffffff"}
                    stroke="#000000"
                    strokeWidth="1.5"
                    rx="3"
                  />
                  <text
                    x={org.anchor === "end" ? org.labelX - 45 : org.labelX + 45}
                    y={org.labelY + 2}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="800"
                    fontFamily="var(--font-sans)"
                    fill="#000000"
                  >
                    {org.name.split(" / ")[0]}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
