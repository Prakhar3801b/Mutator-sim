export interface TranscriptInfo {
  accession: string;
  description?: string;
  cds_length?: number;
  protein_accession?: string;
}

export interface BenchmarkMutation {
  label: string;
  position: number;
  ref: string;
  alt: string;
  hgvs: string;
  description: string;
}

export interface FeaturedGene {
  gene_id: string;
  symbol: string;
  name: string;
  organism: string;
  chromosome: string;
  summary: string;
  primary_accession?: string;
  benchmark_mutations?: BenchmarkMutation[];
}

export interface GeneSearchItem {
  gene_id: string;
  symbol: string;
  name: string;
  organism: string;
  chromosome: string;
  summary: string;
  aliases: string[];
}

export interface GeneSearchResponse {
  query: string;
  organism: string;
  total_count: number;
  page: number;
  page_size: number;
  results: GeneSearchItem[];
}

export interface GeneDetail {
  gene_id: string;
  symbol: string;
  name: string;
  organism: string;
  chromosome: string;
  summary: string;
  transcripts: TranscriptInfo[];
  primary_cds_accession?: string;
  benchmark_mutations?: BenchmarkMutation[];
  sample_cds?: string;
}

export interface SequenceRecord {
  accession: string;
  sequence: string;
  sequence_type: string;
  length: number;
  gc_content: number;
  description?: string;
}

export interface CodonDetail {
  codon_index: number;
  position_in_codon: number;
  original_codon: string;
  modified_codon: string;
  is_changed: boolean;
}

export interface AminoAcidDetail {
  residue_index: number;
  original_aa_code: string;
  original_aa_name: string;
  modified_aa_code: string;
  modified_aa_name: string;
  is_changed: boolean;
  is_premature_stop: boolean;
  is_stop_loss: boolean;
}

export interface LocalContextWindow {
  start_pos: number;
  end_pos: number;
  original_window: string;
  modified_window: string;
  highlight_offset: number;
}

export interface MutationSimulateResponse {
  original_sequence: string;
  modified_sequence: string;
  mutation_type: string;
  position: number;
  original_base: string;
  new_base: string;
  sequence_length: number;
  codon: CodonDetail;
  amino_acid: AminoAcidDetail;
  original_protein: string;
  modified_protein: string;
  protein_length: number;
  classification: string;
  classification_description: string;
  local_window: LocalContextWindow;
  transition_transversion: string;
  original_gc_content: float;
  modified_gc_content: float;
}

type float = number;

export interface ClinVarVariation {
  variation_id: string;
  title: string;
  clinical_significance: string;
  review_status?: string;
  last_evaluated?: string;
  allele_id?: string;
  rs_id?: string;
  hgvs_c?: string;
  hgvs_p?: string;
  condition?: string;
}

export interface ClinVarEvidenceResponse {
  gene_symbol: string;
  query_term: string;
  status: "exact_match" | "related_variant" | "no_record_found";
  status_label: string;
  disclaimer: string;
  exact_matches: ClinVarVariation[];
  related_variants: ClinVarVariation[];
  total_found: number;
}

export interface FeatureContribution {
  feature_name: string;
  feature_label: string;
  value: number;
  contribution: number;
  interpretation: string;
}

export interface PredictionResponse {
  model_name: string;
  pathogenic_probability: number;
  risk_tier: string;
  risk_color: string;
  confidence_level: string;
  feature_contributions: FeatureContribution[];
  raw_features: Record<string, number>;
  scientific_disclaimer: string;
}

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi?: string;
  url: string;
  abstract?: string;
}

export interface LiteratureResponse {
  query: string;
  gene_symbol: string;
  total_results: number;
  articles: PubMedArticle[];
  publication_trend: Record<string, number>;
}
