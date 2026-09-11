"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
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

import { FileDown, Loader2 } from "lucide-react";

export default function Home() {
  // App state
  const [featuredGenes, setFeaturedGenes] = useState<FeaturedGene[]>([]);
  const [selectedGeneId, setSelectedGeneId] = useState<string | null>("672"); // Default BRCA1
  const [geneDetail, setGeneDetail] = useState<GeneDetail | null>(null);
  const [currentAccession, setCurrentAccession] = useState<string>("NM_007294.4");
  const [sequenceRecord, setSequenceRecord] = useState<SequenceRecord | null>(null);

  // Mutation editor state
  const [position, setPosition] = useState<number>(8); // Default to 8 (in BRCA1 sample CDS, GAA -> GTA)
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

  // Modals & settings
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

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

      // Auto-set initial mutation coordinates based on sequence
      if (seq.sequence.length >= 8) {
        const defaultPos = 8;
        setPosition(defaultPos);
        const ref = seq.sequence[defaultPos - 1];
        setOriginalBase(ref);
        const alt = ref === "T" ? "A" : "T";
        setNewBase(alt);

        // Run initial simulation so user immediately sees populated interactive pipeline!
        runSimulation(seq.sequence, defaultPos, ref, alt, detail.symbol, acc);
      }
    } catch (err) {
      console.error("Gene load error:", err);
    } finally {
      setIsLoadingGene(false);
    }
  };

  // Switch transcript within currently selected gene
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

  // Update position and detect reference base
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
    // Cap position within current sample sequence
    const clampedPos = Math.min(bm.position, sequenceRecord.sequence.length);
    setPosition(clampedPos);
    const ref = sequenceRecord.sequence[clampedPos - 1] || bm.ref;
    setOriginalBase(ref);
    setNewBase(bm.alt);
  };

  // Core simulation orchestrator
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
    try {
      // 1. Run deterministic bioinformatics mutation simulation
      const simRes = await simulateMutation({
        sequence: seq,
        position: pos,
        original_base: origB,
        new_base: newB,
        gene_symbol: sym,
        accession: acc
      });
      setSimulation(simRes);

      // 2. Concurrently fetch ML impact prediction, ClinVar evidence, and PubMed literature
      const proteinChange = `p.${simRes.amino_acid.original_aa_code}${simRes.amino_acid.residue_index}${simRes.amino_acid.modified_aa_code}`;

      const [predRes, clinvarRes, litRes] = await Promise.allSettled([
        predictImpact({
          original_aa: simRes.amino_acid.original_aa_code,
          modified_aa: simRes.amino_acid.modified_aa_code,
          codon_position: simRes.codon.position_in_codon,
          original_codon: simRes.codon.original_codon,
          modified_codon: simRes.codon.modified_codon,
          relative_position: simRes.position / simRes.sequence_length,
          local_gc_content: simRes.original_gc_content,
          is_transition: simRes.transition_transversion === "Transition"
        }),
        fetchClinVarEvidence(sym, pos, origB, newB, proteinChange),
        fetchLiterature(sym, proteinChange)
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

  return (
    <div className={`main-container ${reducedMotion ? "reduced-motion" : ""}`}>
      {/* 1. App Header */}
      <Header
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        onReset={handleReset}
      />

      {/* 2. Featured Genes Carousel for 1-Click Exploration */}
      <FeaturedGenes
        genes={featuredGenes}
        selectedGeneId={selectedGeneId}
        onSelectGene={(g) => loadGene(g.gene_id)}
      />

      {/* 3. NCBI Gene Search with Debounce & Organism Filter */}
      <GeneSearch
        onSelectGene={(geneId) => loadGene(geneId)}
        selectedGeneId={selectedGeneId}
      />

      {/* Loading indicator if fetching gene/sequence */}
      {isLoadingGene && (
        <div className="glass-panel" style={{ textAlign: "center", padding: "2rem" }}>
          <Loader2 size={30} className="anim-spin" style={{ color: "var(--c-flow)", margin: "0 auto 0.5rem" }} />
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Retrieving RefSeq coding sequence and annotations from NCBI...
          </div>
        </div>
      )}

      {/* 4. Sequence Viewer (Interactive Codon Ribbon) */}
      {sequenceRecord && geneDetail && (
        <SequenceViewer
          geneSymbol={geneDetail.symbol}
          transcripts={geneDetail.transcripts}
          currentAccession={currentAccession}
          sequenceRecord={sequenceRecord}
          selectedPosition={position}
          onSelectPosition={handleSelectPosition}
          onSelectTranscript={handleSelectTranscript}
        />
      )}

      {/* 5. Hypothetical Mutation Editor */}
      {sequenceRecord && (
        <MutationEditor
          sequence={sequenceRecord.sequence}
          position={position}
          originalBase={originalBase}
          newBase={newBase}
          onPositionChange={handleSelectPosition}
          onNewBaseChange={(b) => setNewBase(b)}
          onSimulate={handleManualSimulate}
          isSimulating={isSimulating}
          benchmarkMutations={geneDetail?.benchmark_mutations}
          onApplyBenchmark={handleApplyBenchmark}
        />
      )}

      {/* 6. CENTERPIECE: 8-Stage Motion-Based Mutation Pipeline */}
      {simulation && (
        <MutationPipeline
          simulation={simulation}
          reducedMotion={reducedMotion}
        />
      )}

      {/* 7. Evidence vs. Prediction Scientific Boundary Banner */}
      {simulation && <EvidenceVsPredictionSplitter />}

      {/* 8. Dual Results Grid: Retrieved Evidence vs. In-Silico Computational Results */}
      {simulation && (
        <div className="two-col-grid">
          {/* Column A: Retrieved Biological Evidence */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <ClinVarEvidenceCard
              evidence={clinvarEvidence}
              isLoading={isLoadingEvidence}
            />
            <PubMedLiteratureCard
              literature={literature}
              isLoading={isLoadingEvidence}
            />
          </div>

          {/* Column B: Computational ML Prediction & On-Demand 3D Structure */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <MLPredictionCard
              prediction={prediction}
              isLoading={isLoadingEvidence}
            />
            <Structure3DViewer
              geneSymbol={geneDetail?.symbol || "Gene"}
              residueIndex={simulation.amino_acid.residue_index}
              originalAa={simulation.amino_acid.original_aa_code}
              modifiedAa={simulation.amino_acid.modified_aa_code}
            />
          </div>
        </div>
      )}

      {/* Export Report Action Floating Bar */}
      {simulation && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <button
            onClick={() => setIsExportOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: "0.95rem", padding: "0.75rem 1.75rem" }}
          >
            <FileDown size={18} />
            Export Complete Analysis Report (Markdown / JSON)
          </button>
        </div>
      )}

      {/* Export Report Modal */}
      {geneDetail && (
        <ExportReportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          geneSymbol={geneDetail.symbol}
          accession={currentAccession}
          simulation={simulation}
          prediction={prediction}
          clinvar={clinvarEvidence}
        />
      )}

      {/* Footer with Regulatory Notices */}
      <Footer />
    </div>
  );
}
