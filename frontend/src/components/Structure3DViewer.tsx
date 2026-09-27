"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Eye, RotateCw, Sparkles, Check } from "lucide-react";

interface Structure3DViewerProps {
  geneSymbol: string;
  residueIndex: number;
  originalAa: string;
  modifiedAa: string;
}

export const Structure3DViewer: React.FC<Structure3DViewerProps> = ({
  geneSymbol,
  residueIndex,
  originalAa,
  modifiedAa
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [rotation, setRotation] = useState({ x: 15, y: 35 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // WebGL support detection
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Simple, ultra-smooth lightweight Canvas 3D rendering of alpha-helix ribbon and mutated residue
  useEffect(() => {
    if (!isLoaded || viewMode !== "3d") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let autoAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 90;

      // Draw technical grid inside canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render stylized 3D protein helix ribbon
      const totalPoints = 60;
      const rotY = (rotation.y + autoAngle) * (Math.PI / 180);
      const rotX = rotation.x * (Math.PI / 180);

      // Black outline for ribbon
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#000000";
      ctx.beginPath();

      let mutX = cx;
      let mutY = cy;

      for (let i = 0; i < totalPoints; i++) {
        const theta = (i / totalPoints) * Math.PI * 4;
        const x3 = Math.cos(theta) * (r * 0.7);
        const y3 = ((i - totalPoints / 2) / (totalPoints / 2)) * (r * 1.3);
        const z3 = Math.sin(theta) * (r * 0.7);

        // 3D rotation
        const xRot = x3 * Math.cos(rotY) + z3 * Math.sin(rotY);
        const zRot = -x3 * Math.sin(rotY) + z3 * Math.cos(rotY);
        const yRot = y3 * Math.cos(rotX) - zRot * Math.sin(rotX);

        const scale = 300 / (300 + zRot);
        const px = cx + xRot * scale;
        const py = cy + yRot * scale;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }

        if (i === Math.floor(totalPoints / 2)) {
          mutX = px;
          mutY = py;
        }
      }
      ctx.stroke();

      // Core ribbon color: Electric Cyan
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#00f0ff";
      ctx.stroke();

      // Render mutated residue sphere with Neo-Brutalist thick black border
      ctx.save();
      ctx.beginPath();
      ctx.arc(mutX, mutY, 15, 0, Math.PI * 2);
      ctx.fillStyle = "#ff4d00";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(modifiedAa || "Mut", mutX, mutY);
      ctx.restore();

      autoAngle += 0.45;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isLoaded, viewMode, rotation, modifiedAa]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation((prev) => ({
      x: prev.x - dy * 0.5,
      y: prev.y + dx * 0.5
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                background: "#ffe600",
                border: "2px solid #000000",
                boxShadow: "1.5px 1.5px 0px #000000",
                padding: "0.25rem",
                borderRadius: "4px"
              }}
            >
              <Box size={18} color="#000000" />
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Protein Structure Viewer ({geneSymbol})
            </h3>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.15rem" }}>
            On-demand structure visualization with residue highlight (Residue #{residueIndex || 1})
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
            className="btn btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
          >
            {viewMode === "3d" ? "Switch to 2D Map" : "Switch to 3D View"}
          </button>
        </div>
      </div>

      {!isLoaded ? (
        <div
          style={{
            padding: "2.5rem 1.5rem",
            textAlign: "center",
            background: "#faf7f0",
            borderRadius: "6px",
            border: "2px dashed #000000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem"
          }}
        >
          <div
            style={{
              background: "#00f0ff",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              padding: "0.5rem",
              borderRadius: "6px"
            }}
          >
            <Sparkles size={24} color="#000000" />
          </div>
          <div style={{ maxWidth: "420px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#000000" }}>
              On-Demand Molecular Structure
            </h4>
            <p style={{ fontSize: "0.78rem", color: "#444444", fontWeight: 600, marginTop: "0.25rem" }}>
              To ensure smooth performance across all mobile and low-power devices, 3D rendering is loaded only on request.
            </p>
          </div>

          <button
            onClick={() => setIsLoaded(true)}
            className="btn btn-primary"
            style={{ marginTop: "0.5rem", fontSize: "0.85rem", padding: "0.6rem 1.4rem" }}
          >
            <Eye size={15} /> Load Structure Viewer
          </button>

          <div style={{ fontSize: "0.72rem", color: "#555555", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Check size={13} color="#00e599" />
            WebGL Compatible & Fallback Protected
          </div>
        </div>
      ) : (
        <div>
          {viewMode === "3d" && hasWebGL !== false ? (
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                position: "relative",
                background: "#ffffff",
                borderRadius: "6px",
                border: "2.5px solid #000000",
                boxShadow: "3px 3px 0px #000000",
                height: "260px",
                overflow: "hidden",
                cursor: isDragging ? "grabbing" : "grab"
              }}
            >
              <canvas
                ref={canvasRef}
                width={500}
                height={260}
                style={{ width: "100%", height: "100%", display: "block" }}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: "0.75rem",
                  left: "0.75rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#000000",
                  background: "#ffffff",
                  border: "1.5px solid #000000",
                  boxShadow: "1.5px 1.5px 0px #000000",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "3px"
                }}
              >
                🔴 Signal Coral: Mutated residue #{residueIndex} ({originalAa} &rarr; {modifiedAa}) &bull; Drag to rotate
              </div>

              <button
                onClick={() => setRotation({ x: 15, y: 35 })}
                className="btn btn-secondary"
                style={{ position: "absolute", top: "0.75rem", right: "0.75rem", fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}
                title="Reset angle"
              >
                <RotateCw size={12} /> Reset
              </button>
            </div>
          ) : (
            /* 2D Topological Residue Map Fallback */
            <div
              style={{
                background: "#faf7f0",
                borderRadius: "6px",
                border: "2.5px solid #000000",
                boxShadow: "3px 3px 0px #000000",
                padding: "1.25rem"
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#000000", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                2D Domain & Residue Linear Topology
              </div>
              <div
                style={{
                  position: "relative",
                  height: "46px",
                  background: "#ffffff",
                  border: "2px solid #000000",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#ff4d00",
                    color: "#ffffff",
                    border: "2px solid #000000",
                    boxShadow: "2px 2px 0px #000000",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.78rem",
                    fontWeight: 800
                  }}
                >
                  Residue #{residueIndex}: {originalAa} &rarr; {modifiedAa}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#444444", fontWeight: 700, marginTop: "0.6rem" }}>
                <span>N-Terminus (1)</span>
                <span>Active Catalytic Domain Region</span>
                <span>C-Terminus</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
