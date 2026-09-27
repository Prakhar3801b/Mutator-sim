"use client";

import React, { useState, useEffect, useRef } from "react";
import { FeaturedGenes } from "@/components/FeaturedGenes";
import { GeneSearch } from "@/components/GeneSearch";
import { SequenceViewer } from "@/components/SequenceViewer";
import { MutationEditor } from "@/components/MutationEditor";
import { MutationPipeline } from "@/components/MutationPipeline";
import { Structure3DViewer } from "@/components/Structure3DViewer";
import { ClinVarEvidenceCard } from "@/components/ClinVarEvidenceCard";
import { PubMedLiteratureCard } from "@/components/PubMedLiteratureCard";
import { MLPredictionCard } from "@/components/MLPredictionCard";
import { EvidenceVsPredictionSplitter } from "@/components/EvidenceVsPredictionSplitter";
import { ExportReportModal } from "@/components/ExportReportModal";
import { Footer } from "@/components/Footer";
import { DnaHelixCanvas } from "@/components/DnaHelixCanvas";

import {
  FeaturedGene,
  GeneDetail,
  SequenceRecord,
  MutationSimulateResponse,
  PredictionResponse,
  ClinVarEvidenceResponse,
  LiteratureResponse,
  BenchmarkMutation
} from "@/types";

import {
  fetchFeaturedGenes,
  fetchGeneDetails,
  fetchSequence,
  simulateMutation,
  fetchClinVarEvidence,
  predictImpact,
  fetchLiterature
} from "@/lib/api";

import Link from "next/link";
import {
  Search,
  Volume2,
  VolumeX,
  ArrowDown,
  ArrowRight,
  Dna,
  Activity,
  ShieldCheck,
  Zap,
  FileDown,
  RotateCcw,
  Sparkles,
  Database,
  Layers,
  Cpu
} from "lucide-react";

export default function Home() {
  // App state
  const [featuredGenes, setFeaturedGenes] = useState<FeaturedGene[]>([]);
  const [selectedGeneId, setSelectedGeneId] = useState<string | null>("672"); // Default BRCA1
  const [geneDetail, setGeneDetail] = useState<GeneDetail | null>(null);
  const [currentAccession, setCurrentAccession] = useState<string>("NM_007294.4");
  const [sequenceRecord, setSequenceRecord] = useState<SequenceRecord | null>(null);

  // Mutation editor state
  const [position, setPosition] = useState<number>(8);
  const [originalBase, setOriginalBase] = useState<string>("A");
  const [newBase, setNewBase] = useState<string>("T");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Simulation & Analysis results
  const [simulation, setSimulation] = useState<MutationSimulateResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [clinvarEvidence, setClinVarEvidence] = useState<ClinVarEvidenceResponse | null>(null);
  const [literature, setLiterature] = useState<LiteratureResponse | null>(null);

  // Loading states
  const [isLoadingGene, setIsLoadingGene] = useState<boolean>(false);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState<boolean>(false);

  // Navigation & Interactive states
  const [activeNav, setActiveNav] = useState<string>("intro");
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Sound generator (native web audio synth chime for biotech ambient feedback)
  const playAudioTone = () => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz DNA repair solfeggio tone
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio not supported or blocked
    }
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted === false) {
      setTimeout(() => playAudioTone(), 50);
    }
  };

  // Load featured genes on initial mount
  useEffect(() => {
    fetchFeaturedGenes()
      .then((genes) => {
        setFeaturedGenes(genes);
        if (genes.length > 0) {
          loadGene(genes[0].gene_id);
        }
      })
      .catch((err) => console.error("Featured genes fetch error:", err));
  }, []);

  // Track active scroll section for side nav rail
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["intro", "pipeline", "simulator", "evidence", "services"];
      const scrollPos = window.scrollY + 220;

      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveNav(sec);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load a gene and its primary transcript sequence
  const loadGene = async (geneId: string) => {
    setIsLoadingGene(true);
    setSelectedGeneId(geneId);
    try {
      const detail = await fetchGeneDetails(geneId);
      setGeneDetail(detail);

      const acc = detail.primary_cds_accession || (detail.transcripts[0]?.accession ?? "NM_007294.4");
      setCurrentAccession(acc);

      const seq = await fetchSequence(acc);
      setSequenceRecord(seq);

      if (seq.sequence.length >= 8) {
        const defaultPos = 8;
        setPosition(defaultPos);
        const ref = seq.sequence[defaultPos - 1];
        setOriginalBase(ref);
        const alt = ref === "T" ? "A" : "T";
        setNewBase(alt);

        runSimulation(seq.sequence, defaultPos, ref, alt, detail.symbol, acc);
      }
    } catch (err) {
      console.error("Gene load error:", err);
    } finally {
      setIsLoadingGene(false);
    }
  };

  // Switch transcript
  const handleSelectTranscript = async (acc: string) => {
    setCurrentAccession(acc);
    try {
      const seq = await fetchSequence(acc);
      setSequenceRecord(seq);
      if (seq.sequence.length > 0) {
        setPosition(1);
        setOriginalBase(seq.sequence[0]);
        setNewBase(seq.sequence[0] === "T" ? "A" : "T");
      }
    } catch (err) {
      console.error("Transcript load error:", err);
    }
  };

  // Select nucleotide position
  const handleSelectPosition = (pos: number) => {
    if (!sequenceRecord || pos < 1 || pos > sequenceRecord.sequence.length) return;
    setPosition(pos);
    const ref = sequenceRecord.sequence[pos - 1].toUpperCase();
    setOriginalBase(ref);
    if (newBase === ref) {
      setNewBase(ref === "A" ? "T" : "A");
    }
  };

  // Apply benchmark mutation preset
  const handleApplyBenchmark = (bm: BenchmarkMutation) => {
    if (!sequenceRecord) return;
    const clampedPos = Math.min(bm.position, sequenceRecord.sequence.length);
    setPosition(clampedPos);
    const ref = sequenceRecord.sequence[clampedPos - 1] || bm.ref;
    setOriginalBase(ref);
    setNewBase(bm.alt);
  };

  // Run simulation & fetch AI pathogenicity + ClinVar + PubMed
  const runSimulation = async (
    seq: string,
    pos: number,
    origB: string,
    newB: string,
    sym: string,
    acc: string
  ) => {
    setIsSimulating(true);
    setIsLoadingEvidence(true);
    playAudioTone();

    try {
      const simRes = await simulateMutation({
        sequence: seq,
        position: pos,
        original_base: origB,
        new_base: newB,
        gene_symbol: sym,
        accession: acc
      });
      setSimulation(simRes);

      const proteinChange = `p.${simRes.amino_acid.original_aa_code}${simRes.amino_acid.residue_index}${simRes.amino_acid.modified_aa_code}`;

      const [predRes, clinvarRes, litRes] = await Promise.allSettled([
        predictImpact({
          original_aa: simRes.amino_acid.original_aa_code,
          modified_aa: simRes.amino_acid.modified_aa_code,
          original_codon: simRes.codon.original_codon,
          modified_codon: simRes.codon.modified_codon,
          codon_position: simRes.codon.codon_index,
          relative_position: pos / Math.max(1, seq.length)
        }),
        fetchClinVarEvidence(
          sym,
          pos,
          origB,
          newB,
          proteinChange
        ),
        fetchLiterature(
          sym,
          `${proteinChange} OR ${origB}${pos}${newB}`
        )
      ]);

      if (predRes.status === "fulfilled") setPrediction(predRes.value);
      if (clinvarRes.status === "fulfilled") setClinVarEvidence(clinvarRes.value);
      if (litRes.status === "fulfilled") setLiterature(litRes.value);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
      setIsLoadingEvidence(false);
    }
  };

  const handleManualSimulate = () => {
    if (!sequenceRecord || !geneDetail) return;
    runSimulation(
      sequenceRecord.sequence,
      position,
      originalBase,
      newBase,
      geneDetail.symbol,
      currentAccession
    );
  };

  const handleReset = () => {
    if (featuredGenes.length > 0) {
      loadGene(featuredGenes[0].gene_id);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`min-h-screen ${reducedMotion ? "reduced-motion" : ""}`} style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* 1. High-Contrast Neo-Brutalist Sticky Top Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#ffffff",
          borderBottom: "3px solid #000000",
          boxShadow: "0 4px 0px #000000",
          padding: "1rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {/* Brand Logo with Neo-Brutal typography */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#000000",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            <div
              style={{
                background: "#ffe600",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                width: "36px",
                height: "36px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Dna size={22} color="#000000" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.45rem",
                letterSpacing: "-0.04em",
                color: "#000000"
              }}
            >
              MUTATOR SIM
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#000000",
                background: "#00f0ff",
                border: "2px solid #000000",
                boxShadow: "1.5px 1.5px 0px #000000",
                padding: "0.15rem 0.5rem",
                borderRadius: "4px"
              }}
            >
              NCBI IN-SILICO GENOMICS
            </span>
          </Link>

          {/* Quick Nav Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: "#faf7f0",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.45rem 0.85rem",
              borderRadius: "4px",
              color: "#000000",
              fontSize: "0.82rem",
              fontWeight: 800,
              textTransform: "uppercase"
            }}
            title="Toggle Quick Navigation"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ width: "16px", height: "2.5px", background: "#000000", display: "block" }}></span>
              <span style={{ width: "11px", height: "2.5px", background: "#000000", display: "block" }}></span>
            </div>
            <span>Menu</span>
          </button>
        </div>

        {/* Right Utility Icons: Search, Audio toggle, Anatomy Explorer link */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <Link
            href="/anatomy"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.8rem",
              fontWeight: 800,
              padding: "0.45rem 1rem",
              borderRadius: "4px",
              background: "#ffe600",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              color: "#000000",
              textDecoration: "none"
            }}
          >
            <Activity size={15} color="#000000" />
            Anatomy Explorer
          </Link>

          <button
            onClick={() => scrollToSection("simulator")}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "4px",
              background: "#ffffff",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#000000"
            }}
            title="Search genes & NCBI Entrez"
          >
            <Search size={16} />
          </button>

          <button
            onClick={toggleSound}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "4px",
              background: isMuted ? "#ffffff" : "#00e599",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#000000"
            }}
            title={isMuted ? "Unmute Ambient Biotech Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </header>

      {/* Neo-Brutalist Animated Ticker Bar */}
      <div className="neo-ticker-wrapper">
        <div className="neo-ticker-track">
          <span className="neo-ticker-item">⚡ NCBI ENTREZ GENOME REPOSITORY</span>
          <span className="neo-ticker-item">⚡ 3D REVOLVING DOUBLE HELIX</span>
          <span className="neo-ticker-item">⚡ REFSEQ CODING SEQUENCE STREAM</span>
          <span className="neo-ticker-item">⚡ IN-SILICO CODON TRANSLATION PIPELINE</span>
          <span className="neo-ticker-item">⚡ RANDOM FOREST ML PATHOGENICITY SCORER</span>
          <span className="neo-ticker-item">⚡ CLINVAR VARIANT EVIDENCE MATRIX</span>
          <span className="neo-ticker-item">⚡ WHOLE-BODY ANATOMICAL PHENOTYPES</span>
          {/* Duplicate for seamless infinite loop */}
          <span className="neo-ticker-item">⚡ NCBI ENTREZ GENOME REPOSITORY</span>
          <span className="neo-ticker-item">⚡ 3D REVOLVING DOUBLE HELIX</span>
          <span className="neo-ticker-item">⚡ REFSEQ CODING SEQUENCE STREAM</span>
          <span className="neo-ticker-item">⚡ IN-SILICO CODON TRANSLATION PIPELINE</span>
          <span className="neo-ticker-item">⚡ RANDOM FOREST ML PATHOGENICITY SCORER</span>
          <span className="neo-ticker-item">⚡ CLINVAR VARIANT EVIDENCE MATRIX</span>
          <span className="neo-ticker-item">⚡ WHOLE-BODY ANATOMICAL PHENOTYPES</span>
        </div>
      </div>

      {/* Slide-out Menu Drawer when user clicks Menu */}
      {isMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "2.5rem",
            zIndex: 60,
            background: "#ffffff",
            border: "3px solid #000000",
            borderRadius: "6px",
            padding: "1.25rem 1.75rem",
            boxShadow: "6px 6px 0px #000000",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            minWidth: "280px"
          }}
        >
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#000000", fontWeight: 800 }}>
            Genomic Platform Navigation
          </div>
          {[
            { label: "Overview & Revolving DNA", id: "intro" },
            { label: "NCBI Pipeline Engine", id: "pipeline" },
            { label: "Mutation Simulator Workbench", id: "simulator" },
            { label: "3D Structure & ML Evidence", id: "evidence" },
            { label: "Organ Pathophysiology", id: "services" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                scrollToSection(item.id);
                setIsMenuOpen(false);
              }}
              style={{
                background: "#faf7f0",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                borderRadius: "3px",
                textAlign: "left",
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "#000000",
                cursor: "pointer",
                padding: "0.5rem 0.75rem",
                transition: "all 0.1s ease"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* 2. Hero Section: Genetic Mutation Simulator with Live NCBI Data & Revolving DNA */}
      <section
        id="intro"
        style={{
          position: "relative",
          minHeight: "calc(100vh - 110px)",
          display: "flex",
          alignItems: "center",
          padding: "2.5rem 3.5rem 3rem",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 1.15fr",
            gap: "3rem",
            width: "100%",
            maxWidth: "1540px",
            margin: "0 auto",
            alignItems: "center"
          }}
        >
          {/* A. Left Vertical Navigation Rail */}
          <div className="side-nav-rail" style={{ minWidth: "140px" }}>
            {[
              { id: "intro", label: "Overview" },
              { id: "pipeline", label: "NCBI Pipeline" },
              { id: "simulator", label: "Simulator" },
              { id: "evidence", label: "Evidence & 3D" },
              { id: "services", label: "Anatomy Impact" }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => scrollToSection(nav.id)}
                className={`side-nav-item ${activeNav === nav.id ? "active" : ""}`}
              >
                {nav.label}
              </button>
            ))}
          </div>

          {/* B. Hero Editorial Content */}
          <div style={{ maxWidth: "580px", zIndex: 10 }}>
            {/* Tracked Kicker Badge */}
            <div style={{ marginBottom: "1.25rem" }}>
              <span className="badge badge-yellow" style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}>
                <Zap size={14} />
                NCBI ENTREZ &bull; IN-SILICO GENOMICS
              </span>
            </div>

            {/* Display Headline */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 4.5vw, 3.8rem)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                color: "#000000",
                marginBottom: "1.5rem"
              }}
            >
              Simulate Genetic Mutations with Real NCBI Data
            </h1>

            {/* Subtitle / Core Description */}
            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
                lineHeight: 1.6,
                marginBottom: "2.25rem",
                maxWidth: "500px"
              }}
            >
              Stream verified human RefSeq coding sequences directly from NCBI. Edit nucleotide coordinates, observe revolving 3D helical DNA structures, trace codon-to-amino-acid translation shifts, and evaluate machine-learning variant pathogenicity.
            </p>

            {/* CTA Button Group */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              <button
                onClick={() => scrollToSection("simulator")}
                className="pill-btn-outline"
              >
                START SIMULATION
              </button>

              <button
                onClick={() => scrollToSection("pipeline")}
                style={{
                  background: "#ffffff",
                  border: "2px solid #000000",
                  boxShadow: "3px 3px 0px #000000",
                  borderRadius: "4px",
                  color: "#000000",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  padding: "0.75rem 1.25rem",
                  textTransform: "uppercase"
                }}
              >
                <span>View NCBI Engine</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* C. Right Hero: Dynamic Animated Revolving 3D B-DNA Helix */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "560px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <DnaHelixCanvas
              reducedMotion={reducedMotion}
              highlightPosition={position}
            />

            {/* Floating Black Pill Button: 'Explore Pipeline' */}
            <button
              onClick={() => scrollToSection("pipeline")}
              className="pill-btn-dark"
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                zIndex: 20
              }}
            >
              <ArrowDown size={14} />
              <span>Explore Pipeline</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Section 01: Real-Time Sequence Retrieval & Codon Translation Engine */}
      <section
        id="pipeline"
        style={{
          borderTop: "3.5px solid #000000",
          borderBottom: "3.5px solid #000000",
          padding: "4rem 3.5rem 3.5rem",
          background: "#ffffff"
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "140px 1fr 1.35fr",
            gap: "2.5rem",
            alignItems: "start"
          }}
        >
          {/* Large Clean Numeral '01' with Hard Shadow */}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.8rem, 6vw, 5.5rem)",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: "#000000",
              background: "#ffe600",
              border: "3px solid #000000",
              boxShadow: "4px 4px 0px #000000",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem 1rem",
              borderRadius: "6px"
            }}
          >
            01
          </div>

          {/* Headline & Date */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                fontWeight: 800,
                color: "#000000",
                letterSpacing: "0.06em",
                marginBottom: "0.65rem",
                textTransform: "uppercase"
              }}
            >
              NCBI ENTREZ STREAM &bull; v1.1 RESEARCH
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 2.8vw, 2.25rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
                color: "#000000"
              }}
            >
              In-Silico DNA &bull; Codon &bull; Protein Variant Engine
            </h2>
          </div>

          {/* Core Scientific Narrative */}
          <div>
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
                lineHeight: 1.7,
                marginBottom: "1.25rem"
              }}
            >
              Mutator Sim connects directly to NCBI Entrez E-Utilities, ClinVar, and PubMed to provide instant in-silico simulation. Stream verified RefSeq transcripts, simulate single nucleotide mutations, observe reading frame shifts, compute Grantham physicochemical distances, and evaluate machine-learning pathogenicity risk tiers in real time.
            </p>
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              <span className="badge badge-yellow">NCBI RefSeq Stream</span>
              <span className="badge badge-cyan">ClinVar & dbSNP Data</span>
              <span className="badge badge-green">Biopython Translation</span>
              <span className="badge badge-blue">Scikit-Learn ML</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Simulator - The In-Silico Genomic Workbench */}
      <section
        id="simulator"
        style={{
          padding: "3.5rem 3.5rem 2rem",
          background: "var(--bg-main)"
        }}
      >
        <div className="main-container" style={{ padding: 0 }}>
          {/* Section Subheader */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
            <div>
              <span className="badge badge-yellow" style={{ fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                SECTION 02 &bull; GENOMIC WORKBENCH
              </span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "0.4rem" }}>
                In-Silico DNA Variant Analysis & Impact Engine
              </h2>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <button
                onClick={() => setIsExportOpen(true)}
                className="btn btn-secondary"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
              >
                <FileDown size={14} />
                Export Simulation Report
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </div>

          {/* Neo-Brutalist Medical Metric Hero Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
              marginTop: "0.5rem"
            }}
          >
            {/* Active Gene Card */}
            <div className="metric-card metric-card-cyan">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", fontWeight: 800 }}>
                  Active Gene
                </span>
                <Dna size={18} color="#000000" />
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, margin: "0.4rem 0 0.1rem", fontFamily: "var(--font-mono)", color: "#000000" }}>
                {geneDetail ? geneDetail.symbol : "Loading..."}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#333333", fontWeight: 600 }}>
                Chr {geneDetail?.chromosome || "17"} &bull; {geneDetail?.organism || "Homo sapiens"}
              </div>
            </div>

            {/* Mutation Consequence Card */}
            <div className="metric-card metric-card-rose">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", fontWeight: 800 }}>
                  Mutation Consequence
                </span>
                <span className="badge badge-red" style={{ fontSize: "0.62rem" }}>
                  {simulation ? simulation.classification : "In Silico"}
                </span>
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.4rem 0 0.1rem", fontFamily: "var(--font-mono)", color: "#ff4d00" }}>
                {simulation ? `pos ${simulation.position}: ${simulation.original_base}→${simulation.new_base}` : "Select base"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#333333", fontWeight: 600 }}>
                {simulation ? `${simulation.amino_acid.original_aa_name} → ${simulation.amino_acid.modified_aa_name}` : "Awaiting run"}
              </div>
            </div>

            {/* Pathogenic Probability Card */}
            <div className="metric-card metric-card-yellow">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", fontWeight: 800 }}>
                  Pathogenic Probability
                </span>
                <span className="badge badge-yellow" style={{ fontSize: "0.62rem", background: "#ffffff" }}>
                  ML Scikit-Learn
                </span>
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, margin: "0.4rem 0 0.1rem", fontFamily: "var(--font-mono)", color: "#000000" }}>
                {prediction ? `${(prediction.pathogenic_probability * 100).toFixed(1)}%` : "--"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#333333", fontWeight: 600 }}>
                {prediction?.risk_tier || "Confidence: 0.85"}
              </div>
            </div>

            {/* Human Body Impact Card */}
            <div className="metric-card metric-card-emerald" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", fontWeight: 800 }}>
                    Human Body Impact
                  </span>
                  <Activity size={18} color="#000000" />
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0.4rem 0 0.1rem", fontFamily: "var(--font-display)" }}>
                  Anatomy Pathophysiology
                </div>
                <div style={{ fontSize: "0.75rem", color: "#333333", fontWeight: 600 }}>
                  Map variant phenotypes to whole-body organs
                </div>
              </div>
              <Link
                href="/anatomy"
                className="btn btn-primary"
                style={{
                  marginTop: "0.65rem",
                  padding: "0.45rem 0.95rem",
                  fontSize: "0.78rem",
                  width: "100%",
                  background: "#000000",
                  color: "#ffffff"
                }}
              >
                Launch Body Viewer
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Featured Genes 1-Click Carousel */}
          <FeaturedGenes
            genes={featuredGenes}
            selectedGeneId={selectedGeneId}
            onSelectGene={(gene) => loadGene(gene.gene_id)}
          />

          {/* NCBI Entrez Gene Search */}
          <GeneSearch
            onSelectGene={(geneId) => loadGene(geneId)}
            selectedGeneId={selectedGeneId}
          />

          {/* Interactive Workspace: Sequence Viewer & Mutation Editor */}
          <div className="two-col-grid">
            <SequenceViewer
              geneSymbol={geneDetail?.symbol || "BRCA1"}
              transcripts={geneDetail?.transcripts || []}
              currentAccession={currentAccession}
              sequenceRecord={sequenceRecord}
              selectedPosition={position}
              onSelectPosition={handleSelectPosition}
              onSelectTranscript={handleSelectTranscript}
            />

            <MutationEditor
              sequence={sequenceRecord?.sequence || ""}
              position={position}
              originalBase={originalBase}
              newBase={newBase}
              onPositionChange={handleSelectPosition}
              onNewBaseChange={setNewBase}
              onSimulate={handleManualSimulate}
              isSimulating={isSimulating}
              benchmarkMutations={geneDetail?.benchmark_mutations || []}
              onApplyBenchmark={handleApplyBenchmark}
            />
          </div>

          {/* Step-by-Step Translation Flow Pipeline */}
          <MutationPipeline
            simulation={simulation}
            reducedMotion={reducedMotion}
          />

          {/* 3D Structure Ribbon & Evidence / Prediction Splitter */}
          <div className="two-col-grid" id="evidence">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <Structure3DViewer
                geneSymbol={geneDetail?.symbol || "BRCA1"}
                residueIndex={simulation?.amino_acid.residue_index || 3}
                originalAa={simulation?.amino_acid.original_aa_code || "E"}
                modifiedAa={simulation?.amino_acid.modified_aa_code || "V"}
              />
              <MLPredictionCard
                prediction={prediction}
                isLoading={isSimulating}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <EvidenceVsPredictionSplitter />
              <ClinVarEvidenceCard
                evidence={clinvarEvidence}
                isLoading={isLoadingEvidence}
              />
              <PubMedLiteratureCard
                literature={literature}
                isLoading={isLoadingEvidence}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Services - Whole-Body Anatomy Explorer Callout */}
      <section
        id="services"
        style={{
          borderTop: "3.5px solid #000000",
          padding: "4rem 3.5rem",
          background: "#ffffff"
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "3rem",
            alignItems: "center"
          }}
        >
          <div>
            <span className="badge badge-yellow" style={{ fontSize: "0.75rem", marginBottom: "0.75rem" }}>
              SECTION 03 &bull; CLINICAL ANATOMY
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: "#000000",
                marginBottom: "1.25rem",
                marginTop: "0.5rem"
              }}
            >
              Whole-Body Organ Pathophysiology & Phenotype Mapping
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
                lineHeight: 1.7,
                marginBottom: "2rem"
              }}
            >
              Explore how single nucleotide mutations in genes like BRCA1, TP53, CFTR, and HBB translate across organ systems. Features interactive radar hotspot anatomy, physiological vulnerability indices, and PubMed-indexed clinical manifestations.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/anatomy" className="pill-btn-outline" style={{ background: "#000000", color: "#ffffff" }}>
                <span>Open Anatomy Explorer</span>
                <ArrowRight size={14} />
              </Link>
              <button onClick={() => scrollToSection("simulator")} className="pill-btn-outline">
                Simulate Gene Mutation
              </button>
            </div>
          </div>

          <div
            className="neo-card"
            style={{
              background: "#faf7f0",
              border: "3px solid #000000",
              boxShadow: "6px 6px 0px #000000",
              borderRadius: "8px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#000000", textTransform: "uppercase" }}>Clinical Organ Telemetry</span>
              <span className="badge badge-yellow">4 Preset Syndromes</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div
                style={{
                  background: "#ffffff",
                  padding: "1rem",
                  borderRadius: "6px",
                  border: "2px solid #000000",
                  boxShadow: "2px 2px 0px #000000"
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#555555", fontWeight: 700 }}>Breasts & Ovaries</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "0.2rem" }}>BRCA1 Syndromes</div>
                <div style={{ fontSize: "0.72rem", color: "#00a86b", fontWeight: 700, marginTop: "0.2rem" }}>+82% Pathogenic Risk</div>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  padding: "1rem",
                  borderRadius: "6px",
                  border: "2px solid #000000",
                  boxShadow: "2px 2px 0px #000000"
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#555555", fontWeight: 700 }}>Brain & Multi-Organ</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "0.2rem" }}>TP53 Neoplasms</div>
                <div style={{ fontSize: "0.72rem", color: "#ff4d00", fontWeight: 700, marginTop: "0.2rem" }}>Li-Fraumeni Profile</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 2rem" }}>
        <Footer />
      </div>

      {/* 7. Export Report Modal */}
      {isExportOpen && (
        <ExportReportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          geneSymbol={geneDetail?.symbol || "BRCA1"}
          accession={currentAccession}
          simulation={simulation}
          prediction={prediction}
          clinvar={clinvarEvidence}
        />
      )}
    </div>
  );
}

