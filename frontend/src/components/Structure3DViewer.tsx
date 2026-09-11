"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Eye, AlertTriangle, RotateCw, Sparkles, Check } from "lucide-react";

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

      // Draw background glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
      grad.addColorStop(0, "rgba(0, 242, 254, 0.08)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render stylized 3D protein helix ribbon
      const totalPoints = 60;
      const rotY = (rotation.y + autoAngle) * (Math.PI / 180);
      const rotX = rotation.x * (Math.PI / 180);

      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(79, 172, 254, 0.6)";
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

        // Highlight mutated residue near center
        if (i === Math.floor(totalPoints / 2)) {
          mutX = px;
          mutY = py;
        }
      }
      ctx.stroke();

      // Render mutated residue sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(mutX, mutY, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 18;
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(modifiedAa || "Mut", mutX, mutY);
      ctx.restore();

      autoAngle += 0.4;
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
    <div className="glass-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Box size={18} color="var(--c-flow)" />
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
              Protein Structure Viewer ({geneSymbol})
            </h3>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
            On-demand structure visualization with residue highlight (Residue #{residueIndex || 1})
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
            className="btn btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }}
          >
            {viewMode === "3d" ? "Switch to 2D Map" : "Switch to 3D View"}
          </button>
        </div>
      </div>

      {!isLoaded ? (
        <div style={{
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <Sparkles size={28} color="var(--c-flow)" />
          <div style={{ maxWidth: "420px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff" }}>
              On-Demand Molecular Structure
            </h4>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
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

          <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Check size={12} color="var(--c-original)" />
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
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
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

              <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", fontSize: "0.7rem", color: "var(--text-muted)", background: "rgba(0,0,0,0.6)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                🔴 Red sphere: Mutated residue #{residueIndex} ({originalAa} → {modifiedAa}) • Drag to rotate
              </div>

              <button
                onClick={() => setRotation({ x: 15, y: 35 })}
                className="btn btn-secondary"
                style={{ position: "absolute", top: "0.75rem", right: "0.75rem", fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
                title="Reset angle"
              >
                <RotateCw size={12} /> Reset
              </button>
            </div>
          ) : (
            /* 2D Topological Residue Map Fallback */
            <div style={{
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              padding: "1.25rem"
            }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.5rem" }}>
                2D Domain & Residue Linear Topology
              </div>
              <div style={{
                position: "relative",
                height: "40px",
                background: "linear-gradient(90deg, #1e293b, #334155, #1e293b)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#ef4444",
                  color: "#fff",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  boxShadow: "0 0 12px rgba(239, 68, 68, 0.7)"
                }}>
                  Residue #{residueIndex}: {originalAa} → {modifiedAa}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                <span>N-Terminus (1)</span>
                <span>Active Domain Region</span>
                <span>C-Terminus</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
