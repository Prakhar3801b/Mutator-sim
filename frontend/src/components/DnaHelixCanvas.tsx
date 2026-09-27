"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCw, Sparkles, Layers, Sliders, Info, Eye } from "lucide-react";

interface DnaHelixCanvasProps {
  reducedMotion?: boolean;
  className?: string;
  highlightPosition?: number;
}

type ViewMode = "full-rungs" | "ribbon-nodes" | "cyber-stream";

interface BasePair {
  y: number; // along vertical axis (-220 to 220)
  angle: number; // base rotation angle
  base1: "A" | "T" | "G" | "C";
  base2: "A" | "T" | "G" | "C";
  index: number;
}

export const DnaHelixCanvas: React.FC<DnaHelixCanvasProps> = ({
  reducedMotion = false,
  className = "",
  highlightPosition = 8
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interactive controls
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1); // 0.5, 1, 2
  const [viewMode, setViewMode] = useState<ViewMode>("full-rungs");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [liveAngleDisplay, setLiveAngleDisplay] = useState(0);

  // References for render loop
  const rotAngleRef = useRef(0);
  const tiltXRef = useRef(0.16); // slight forward tilt for perspective
  const tiltYRef = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });
  const isInteractingRef = useRef(false);

  // Generate canonical base pair rungs along the double helix
  const basePairsRef = useRef<BasePair[]>([]);
  if (basePairsRef.current.length === 0) {
    const pairs: ("AT" | "TA" | "GC" | "CG")[] = [
      "AT", "CG", "TA", "GC", "AT", "AT", "CG", "TA",
      "GC", "CG", "AT", "TA", "GC", "AT", "CG", "TA",
      "AT", "GC", "CG", "TA", "AT", "CG", "GC", "TA",
      "CG", "AT", "TA", "GC", "AT", "CG", "TA", "GC"
    ];
    const totalRungs = pairs.length;
    const heightSpan = 420;
    const numTurns = 3.2; // ~10.5 base pairs per helical turn (standard B-DNA)

    basePairsRef.current = pairs.map((pairType, idx) => {
      const frac = idx / (totalRungs - 1);
      const y = (frac - 0.5) * heightSpan;
      const angle = frac * (numTurns * Math.PI * 2);
      return {
        y,
        angle,
        base1: pairType[0] as "A" | "T" | "G" | "C",
        base2: pairType[1] as "A" | "T" | "G" | "C",
        index: idx + 1
      };
    });
  }

  // Base colors in Neo-Brutalist Palette (Zero Violet!)
  const getBaseColor = (base: string) => {
    switch (base) {
      case "A": return { bg: "#00f0ff", stroke: "#000000", name: "Adenine", text: "#000000" };
      case "T": return { bg: "#ff3366", stroke: "#000000", name: "Thymine", text: "#ffffff" };
      case "G": return { bg: "#ffe600", stroke: "#000000", name: "Guanine", text: "#000000" };
      case "C": return { bg: "#00e599", stroke: "#000000", name: "Cytosine", text: "#000000" };
      default: return { bg: "#ffffff", stroke: "#000000", name: "Base", text: "#000000" };
    }
  };

  // Mouse Drag to Rotate 3D Helix
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    isInteractingRef.current = true;
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    rotAngleRef.current += dx * 0.012;
    tiltXRef.current = Math.max(-0.6, Math.min(0.6, tiltXRef.current + dy * 0.008));
    velocityRef.current = { x: dx * 0.002, y: dy * 0.001 };
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      isInteractingRef.current = false;
    }, 200);
  };

  // Main 3D Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let displayAngleTimer = 0;

    const helixRadius = 88;
    const fov = 420;

    // HiDPI Scaling
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Handle auto-rotation
      if (isPlaying && !isDragging) {
        rotAngleRef.current += dt * 0.85 * rotationSpeed;
      }

      // Inertia drag coasting
      if (!isDragging && (Math.abs(velocityRef.current.x) > 0.0001 || Math.abs(velocityRef.current.y) > 0.0001)) {
        rotAngleRef.current += velocityRef.current.x;
        tiltXRef.current = Math.max(-0.6, Math.min(0.6, tiltXRef.current + velocityRef.current.y));
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
      }

      // Update angle telemetry for HUD every ~100ms
      displayAngleTimer += dt;
      if (displayAngleTimer > 0.1) {
        displayAngleTimer = 0;
        const deg = Math.floor(((rotAngleRef.current * 180) / Math.PI) % 360);
        setLiveAngleDisplay(deg < 0 ? deg + 360 : deg);
      }

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Neo-Brutalist Technical Grid & Backdrop inside DNA Viewport
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);

      // Technical crosshair marks & coordinate lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
      ctx.lineWidth = 1;
      const gridSpacing = 32;
      for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center vertical axis guide line
      const cx = w * 0.5;
      const cy = h * 0.5;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, 15);
      ctx.lineTo(cx, h - 15);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const rot = rotAngleRef.current;
      const tiltX = tiltXRef.current;
      const cosTilt = Math.cos(tiltX);
      const sinTilt = Math.sin(tiltX);

      // 3D Projection helper
      const project = (x3: number, y3: number, z3: number) => {
        // Rotate around Y
        const rx = x3 * Math.cos(rot) - z3 * Math.sin(rot);
        const rz = x3 * Math.sin(rot) + z3 * Math.cos(rot);

        // Tilt around X
        const ry = y3 * cosTilt - rz * sinTilt;
        const rzFinal = y3 * sinTilt + rz * cosTilt;

        const dist = fov + rzFinal;
        const scale = fov / Math.max(20, dist);
        const sx = cx + rx * scale;
        const sy = cy + ry * scale;

        return { sx, sy, sz: rzFinal, scale };
      };

      // Collect elements to render and depth-sort back-to-front
      interface RenderItem {
        type: "backbone-segment" | "rung" | "mutation-ring" | "particle";
        sz: number;
        draw: (ctx: CanvasRenderingContext2D) => void;
      }
      const renderQueue: RenderItem[] = [];

      // 1. Generate Helical Backbone Curves (Strand A & Strand B)
      const numSteps = 120;
      const heightSpan = 420;
      const numTurns = 3.2;

      for (let i = 0; i < numSteps - 1; i++) {
        const frac1 = i / numSteps;
        const frac2 = (i + 1) / numSteps;

        const y1 = (frac1 - 0.5) * heightSpan;
        const y2 = (frac2 - 0.5) * heightSpan;

        const a1 = frac1 * (numTurns * Math.PI * 2);
        const a2 = frac2 * (numTurns * Math.PI * 2);

        // Strand 1 (Leading: Electric Cyan)
        const p1_s1 = project(Math.cos(a1) * helixRadius, y1, Math.sin(a1) * helixRadius);
        const p2_s1 = project(Math.cos(a2) * helixRadius, y2, Math.sin(a2) * helixRadius);
        const avgZ_s1 = (p1_s1.sz + p2_s1.sz) / 2;

        renderQueue.push({
          type: "backbone-segment",
          sz: avgZ_s1,
          draw: (c) => {
            const width = Math.max(3, 5 * ((p1_s1.scale + p2_s1.scale) / 2));
            // Black outline
            c.strokeStyle = "#000000";
            c.lineWidth = width + 3;
            c.lineCap = "round";
            c.beginPath();
            c.moveTo(p1_s1.sx, p1_s1.sy);
            c.lineTo(p2_s1.sx, p2_s1.sy);
            c.stroke();

            // Core fill: Electric Cyan
            c.strokeStyle = "#00f0ff";
            c.lineWidth = width;
            c.beginPath();
            c.moveTo(p1_s1.sx, p1_s1.sy);
            c.lineTo(p2_s1.sx, p2_s1.sy);
            c.stroke();
          }
        });

        // Strand 2 (Lagging: Cyber Yellow, 180° opposite)
        const p1_s2 = project(Math.cos(a1 + Math.PI) * helixRadius, y1, Math.sin(a1 + Math.PI) * helixRadius);
        const p2_s2 = project(Math.cos(a2 + Math.PI) * helixRadius, y2, Math.sin(a2 + Math.PI) * helixRadius);
        const avgZ_s2 = (p1_s2.sz + p2_s2.sz) / 2;

        renderQueue.push({
          type: "backbone-segment",
          sz: avgZ_s2,
          draw: (c) => {
            const width = Math.max(3, 5 * ((p1_s2.scale + p2_s2.scale) / 2));
            // Black outline
            c.strokeStyle = "#000000";
            c.lineWidth = width + 3;
            c.lineCap = "round";
            c.beginPath();
            c.moveTo(p1_s2.sx, p1_s2.sy);
            c.lineTo(p2_s2.sx, p2_s2.sy);
            c.stroke();

            // Core fill: Cyber Yellow
            c.strokeStyle = "#ffe600";
            c.lineWidth = width;
            c.beginPath();
            c.moveTo(p1_s2.sx, p1_s2.sy);
            c.lineTo(p2_s2.sx, p2_s2.sy);
            c.stroke();
          }
        });
      }

      // 2. Generate Base-Pair Rungs connecting the two strands
      basePairsRef.current.forEach((bp) => {
        const xA = Math.cos(bp.angle) * helixRadius;
        const zA = Math.sin(bp.angle) * helixRadius;
        const xB = Math.cos(bp.angle + Math.PI) * helixRadius;
        const zB = Math.sin(bp.angle + Math.PI) * helixRadius;

        const pA = project(xA, bp.y, zA);
        const pB = project(xB, bp.y, zB);

        // Center junction point (hydrogen bonds)
        const pMid = project(0, bp.y, 0);
        const avgZ = (pA.sz + pB.sz) / 2;

        const isHighlighted = bp.index === highlightPosition;
        const col1 = getBaseColor(bp.base1);
        const col2 = getBaseColor(bp.base2);

        renderQueue.push({
          type: "rung",
          sz: avgZ,
          draw: (c) => {
            const rungThick = Math.max(2.5, 4 * pMid.scale);

            if (viewMode === "full-rungs" || viewMode === "ribbon-nodes") {
              // Rung half 1 (Strand 1 to Midpoint)
              c.save();
              c.lineWidth = rungThick + 2.5;
              c.strokeStyle = "#000000";
              c.beginPath();
              c.moveTo(pA.sx, pA.sy);
              c.lineTo(pMid.sx, pMid.sy);
              c.stroke();

              c.lineWidth = rungThick;
              c.strokeStyle = col1.bg;
              c.beginPath();
              c.moveTo(pA.sx, pA.sy);
              c.lineTo(pMid.sx, pMid.sy);
              c.stroke();
              c.restore();

              // Rung half 2 (Midpoint to Strand 2)
              c.save();
              c.lineWidth = rungThick + 2.5;
              c.strokeStyle = "#000000";
              c.beginPath();
              c.moveTo(pMid.sx, pMid.sy);
              c.lineTo(pB.sx, pB.sy);
              c.stroke();

              c.lineWidth = rungThick;
              c.strokeStyle = col2.bg;
              c.beginPath();
              c.moveTo(pMid.sx, pMid.sy);
              c.lineTo(pB.sx, pB.sy);
              c.stroke();
              c.restore();

              // Hydrogen Bond Link (Center dot / break)
              c.fillStyle = "#000000";
              c.beginPath();
              c.arc(pMid.sx, pMid.sy, Math.max(2, 3 * pMid.scale), 0, Math.PI * 2);
              c.fill();
            }

            // Strand Terminal Base Spheres / Cubes (Neo-Brutalist nodes)
            const nodeRadiusA = Math.max(5, 8.5 * pA.scale);
            const nodeRadiusB = Math.max(5, 8.5 * pB.scale);

            // Node A
            c.save();
            c.fillStyle = col1.bg;
            c.strokeStyle = "#000000";
            c.lineWidth = 2.5;
            c.beginPath();
            c.arc(pA.sx, pA.sy, nodeRadiusA, 0, Math.PI * 2);
            c.fill();
            c.stroke();

            // Label on Node A if facing foreground
            if (pA.sz < 40 && pA.scale > 0.85) {
              c.fillStyle = col1.text;
              c.font = `800 ${Math.floor(8 * pA.scale)}px 'JetBrains Mono', monospace`;
              c.textAlign = "center";
              c.textBaseline = "middle";
              c.fillText(bp.base1, pA.sx, pA.sy);
            }
            c.restore();

            // Node B
            c.save();
            c.fillStyle = col2.bg;
            c.strokeStyle = "#000000";
            c.lineWidth = 2.5;
            c.beginPath();
            c.arc(pB.sx, pB.sy, nodeRadiusB, 0, Math.PI * 2);
            c.fill();
            c.stroke();

            // Label on Node B if facing foreground
            if (pB.sz < 40 && pB.scale > 0.85) {
              c.fillStyle = col2.text;
              c.font = `800 ${Math.floor(8 * pB.scale)}px 'JetBrains Mono', monospace`;
              c.textAlign = "center";
              c.textBaseline = "middle";
              c.fillText(bp.base2, pB.sx, pB.sy);
            }
            c.restore();

            // Highlighted Locus (Target mutation site spotlight)
            if (isHighlighted) {
              c.save();
              const pulse = (Math.sin(time * 0.006) + 1) * 0.5;
              const ringR = Math.max(16, 24 * pMid.scale + pulse * 6);

              c.strokeStyle = "#ff4d00";
              c.lineWidth = 3;
              c.beginPath();
              c.arc(pMid.sx, pMid.sy, ringR, 0, Math.PI * 2);
              c.stroke();

              // Crosshair brackets
              c.strokeStyle = "#000000";
              c.lineWidth = 2;
              c.strokeRect(pMid.sx - ringR - 2, pMid.sy - ringR - 2, (ringR + 2) * 2, (ringR + 2) * 2);

              // Locus Tag Box
              c.fillStyle = "#ffe600";
              c.strokeStyle = "#000000";
              c.lineWidth = 2;
              const tagW = 88;
              const tagH = 22;
              const tagX = pMid.sx + ringR + 8;
              const tagY = pMid.sy - 11;
              c.fillRect(tagX, tagY, tagW, tagH);
              c.strokeRect(tagX, tagY, tagW, tagH);

              // Hard shadow for tag
              c.fillStyle = "#000000";
              c.font = "800 9px 'JetBrains Mono', monospace";
              c.textAlign = "center";
              c.textBaseline = "middle";
              c.fillText(`LOCUS #${bp.index} [MUT]`, tagX + tagW / 2, tagY + tagH / 2);
              c.restore();
            }
          }
        });
      });

      // 3. Cyber Stream Particles (if in cyber-stream mode or ambient background)
      if (viewMode === "cyber-stream") {
        for (let p = 0; p < 45; p++) {
          const t = ((time * 0.0008 + p * 0.07) % 1) * heightSpan - heightSpan / 2;
          const a = (t / heightSpan) * (numTurns * Math.PI * 2) * 1.5;
          const pt = project(Math.cos(a) * (helixRadius + 18), t, Math.sin(a) * (helixRadius + 18));
          renderQueue.push({
            type: "particle",
            sz: pt.sz,
            draw: (c) => {
              c.fillStyle = p % 2 === 0 ? "#00f0ff" : "#ffe600";
              c.strokeStyle = "#000000";
              c.lineWidth = 1.5;
              c.beginPath();
              c.arc(pt.sx, pt.sy, Math.max(2, 4 * pt.scale), 0, Math.PI * 2);
              c.fill();
              c.stroke();
            }
          });
        }
      }

      // Sort back-to-front by sz (greater sz = farther away from camera in our camera coordinate)
      renderQueue.sort((a, b) => b.sz - a.sz);

      // Execute draws
      for (let i = 0; i < renderQueue.length; i++) {
        renderQueue[i].draw(ctx);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isPlaying, rotationSpeed, viewMode, isDragging, highlightPosition]);

  return (
    <div
      ref={containerRef}
      className={`neo-card flex flex-col justify-between overflow-hidden ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "560px",
        background: "#ffffff",
        border: "3px solid #000000",
        boxShadow: "6px 6px 0px #000000",
        borderRadius: "8px",
        padding: "0"
      }}
    >
      {/* 1. Top Neo-Brutal HUD Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem 1.25rem",
          background: "#faf7f0",
          borderBottom: "2.5px solid #000000"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              background: isPlaying ? "#00e599" : "#ff3344",
              border: "2px solid #000000",
              boxShadow: "1px 1px 0px #000000"
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: "0.78rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase"
            }}
          >
            B-DNA DOUBLE HELIX // 34Å PITCH
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            className="badge badge-yellow"
            style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem" }}
          >
            ROT: {liveAngleDisplay}°
          </span>
          <span
            className="badge badge-cyan"
            style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem" }}
          >
            32 BP CODING
          </span>
        </div>
      </div>

      {/* 2. Interactive Canvas Container */}
      <div
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          minHeight: "420px",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block"
          }}
          title="Drag mouse to rotate 3D Double Helix in real time"
        />

        {/* Floating Interaction Hint */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "#ffffff",
            border: "2px solid #000000",
            boxShadow: "2px 2px 0px #000000",
            padding: "0.25rem 0.6rem",
            fontSize: "0.68rem",
            fontWeight: 800,
            fontFamily: "var(--font-mono)",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            pointerEvents: "none"
          }}
        >
          <RotateCw size={11} />
          DRAG TO ROTATE 3D
        </div>

        {/* Strand Direction Badges */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            pointerEvents: "none"
          }}
        >
          <div
            style={{
              background: "#00f0ff",
              border: "1.5px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "0.15rem 0.45rem",
              fontFamily: "var(--font-mono)"
            }}
          >
            STRAND A: 5&apos; &rarr; 3&apos; (LEADING)
          </div>
          <div
            style={{
              background: "#ffe600",
              border: "1.5px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "0.15rem 0.45rem",
              fontFamily: "var(--font-mono)"
            }}
          >
            STRAND B: 3&apos; &rarr; 5&apos; (LAGGING)
          </div>
        </div>
      </div>

      {/* 3. Bottom Control Dock (Speed, View Mode, Legend) */}
      <div
        style={{
          borderTop: "2.5px solid #000000",
          background: "#faf7f0",
          padding: "0.75rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}
      >
        {/* Play/Pause & Speed Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-secondary"
            style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
            title={isPlaying ? "Pause rotation" : "Resume auto-rotation"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
          </button>

          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                setRotationSpeed(spd);
                if (!isPlaying) setIsPlaying(true);
              }}
              style={{
                padding: "0.35rem 0.55rem",
                fontSize: "0.72rem",
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                background: rotationSpeed === spd && isPlaying ? "#ffe600" : "#ffffff",
                border: "2px solid #000000",
                boxShadow: rotationSpeed === spd && isPlaying ? "2px 2px 0px #000000" : "1px 1px 0px #000000",
                cursor: "pointer",
                borderRadius: "3px"
              }}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {(["full-rungs", "ribbon-nodes", "cyber-stream"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: "0.35rem 0.65rem",
                fontSize: "0.7rem",
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                background: viewMode === mode ? "#00f0ff" : "#ffffff",
                color: "#000000",
                border: "2px solid #000000",
                boxShadow: viewMode === mode ? "2px 2px 0px #000000" : "1px 1px 0px #000000",
                cursor: "pointer",
                borderRadius: "3px"
              }}
            >
              {mode === "full-rungs" ? "Base Pairs" : mode === "ribbon-nodes" ? "Ribbon" : "Vortex"}
            </button>
          ))}
        </div>

        {/* Nucleotide Color Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          {[
            { base: "A", name: "Ade", bg: "#00f0ff" },
            { base: "T", name: "Thy", bg: "#ff3366" },
            { base: "G", name: "Gua", bg: "#ffe600" },
            { base: "C", name: "Cyt", bg: "#00e599" }
          ].map((item) => (
            <span
              key={item.base}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                background: item.bg,
                color: item.base === "T" ? "#ffffff" : "#000000",
                border: "1.5px solid #000000",
                padding: "0.15rem 0.4rem",
                boxShadow: "1px 1px 0px #000000"
              }}
            >
              <strong>{item.base}</strong> {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
