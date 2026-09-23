import {
  FeaturedGene,
  GeneSearchResponse,
  GeneDetail,
  SequenceRecord,
  MutationSimulateResponse,
  ClinVarEvidenceResponse,
  PredictionResponse,
  LiteratureResponse
} from "@/types";

const API_BASE = "/api";

export async function fetchFeaturedGenes(): Promise<FeaturedGene[]> {
  const res = await fetch(`${API_BASE}/genes/featured`);
  if (!res.ok) throw new Error("Failed to fetch featured genes");
  return res.json();
}

export async function searchNCBIGenes(
  query: string,
  organism: string = "Homo sapiens",
  page: number = 1
): Promise<GeneSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    organism: organism,
    page: page.toString(),
    page_size: "10"
  });
  const res = await fetch(`${API_BASE}/genes/search?${params}`);
  if (!res.ok) throw new Error("NCBI gene search request failed");
  return res.json();
}

export async function fetchGeneDetails(geneId: string): Promise<GeneDetail> {
  const res = await fetch(`${API_BASE}/genes/${geneId}`);
  if (!res.ok) throw new Error(`Failed to fetch details for Gene ID ${geneId}`);
  return res.json();
}

export async function fetchSequence(accession: string): Promise<SequenceRecord> {
  const res = await fetch(`${API_BASE}/sequences/${accession}`);
  if (!res.ok) throw new Error(`Failed to fetch sequence for accession ${accession}`);
  return res.json();
}

export async function simulateMutation(payload: {
  sequence: string;
  position: number;
  original_base: string;
  new_base: string;
  mutation_type?: string;
  gene_symbol?: string;
  accession?: string;
}): Promise<MutationSimulateResponse> {
  const res = await fetch(`${API_BASE}/mutations/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mutation_type: "substitution",
      ...payload
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Simulation failed" }));
    throw new Error(err.detail || "Mutation simulation failed");
  }
  return res.json();
}

export async function fetchClinVarEvidence(
  gene: string,
  position: number,
  ref: string,
  alt: string,
  protein: string = ""
): Promise<ClinVarEvidenceResponse> {
  const params = new URLSearchParams({
    gene,
    position: position.toString(),
    ref,
    alt,
    protein
  });
  const res = await fetch(`${API_BASE}/variants/evidence?${params}`);
  if (!res.ok) throw new Error("ClinVar evidence retrieval failed");
  return res.json();
}

export async function predictImpact(payload: {
  original_aa: string;
  modified_aa: string;
  codon_position?: number;
  original_codon: string;
  modified_codon: string;
  relative_position?: number;
  local_gc_content?: number;
  is_transition?: boolean;
}): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/predictions/impact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codon_position: 1,
      relative_position: 0.5,
      local_gc_content: 50.0,
      is_transition: true,
      ...payload
    })
  });
  if (!res.ok) throw new Error("ML Impact prediction failed");
  return res.json();
}

export async function fetchLiterature(gene: string, mutation: string = ""): Promise<LiteratureResponse> {
  const params = new URLSearchParams({ gene, mutation });
  const res = await fetch(`${API_BASE}/literature/search?${params}`);
  if (!res.ok) throw new Error("PubMed literature retrieval failed");
  return res.json();
}

export async function generateMarkdownReport(payload: Record<string, unknown>): Promise<{ format: string; content: string }> {
  const res = await fetch(`${API_BASE}/reports/generate-markdown`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Report generation failed");
  return res.json();
}

export async function fetchAnatomyImpact(payload: {
  gene_symbol: string;
  mutation_hgvs?: string;
  amino_acid_change?: string;
  consequence_type?: string;
  clinical_significance?: string;
}): Promise<import("@/types").AnatomyImpactResponse> {
  const res = await fetch(`${API_BASE}/anatomy/impact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Anatomy impact retrieval failed");
  return res.json();
}

