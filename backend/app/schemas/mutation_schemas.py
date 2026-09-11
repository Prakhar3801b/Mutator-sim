from pydantic import BaseModel, Field
from typing import Optional, List

class MutationSimulateRequest(BaseModel):
    sequence: str = Field(..., description="Original DNA/CDS sequence string")
    position: int = Field(..., ge=1, description="1-based mutation position coordinate")
    original_base: str = Field(..., max_length=1, description="Expected original single nucleotide (A, C, G, T)")
    new_base: str = Field(..., max_length=1, description="Target mutated single nucleotide (A, C, G, T)")
    mutation_type: str = Field(default="substitution", description="Type of mutation: substitution, insertion, deletion")
    gene_symbol: Optional[str] = None
    accession: Optional[str] = None

class CodonDetail(BaseModel):
    codon_index: int  # 1-based codon number
    position_in_codon: int  # 1, 2, or 3
    original_codon: str
    modified_codon: str
    is_changed: bool

class AminoAcidDetail(BaseModel):
    residue_index: int  # 1-based amino acid position
    original_aa_code: str  # e.g. E
    original_aa_name: str  # e.g. Glu / Glutamic Acid
    modified_aa_code: str  # e.g. V
    modified_aa_name: str  # e.g. Val / Valine
    is_changed: bool
    is_premature_stop: bool
    is_stop_loss: bool

class LocalContextWindow(BaseModel):
    start_pos: int
    end_pos: int
    original_window: str
    modified_window: str
    highlight_offset: int  # 0-indexed offset within window

class MutationSimulateResponse(BaseModel):
    original_sequence: str
    modified_sequence: str
    mutation_type: str
    position: int
    original_base: str
    new_base: str
    sequence_length: int
    
    # Codon level
    codon: CodonDetail
    
    # Translation & Protein level
    amino_acid: AminoAcidDetail
    original_protein: str
    modified_protein: str
    protein_length: int
    
    # Classification
    classification: str  # synonymous, missense, nonsense, frameshift
    classification_description: str
    
    # Local context & properties
    local_window: LocalContextWindow
    transition_transversion: str  # Transition or Transversion
    original_gc_content: float
    modified_gc_content: float
