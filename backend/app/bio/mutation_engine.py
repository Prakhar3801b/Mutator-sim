from app.bio.codon_engine import get_codon_info
from app.bio.translation import translate_sequence, compare_proteins
from app.bio.classifier import classify_mutation
from app.bio.sequence_analysis import (
    calculate_gc_content,
    determine_transition_transversion,
    extract_local_window
)

class MutationValidationError(Exception):
    pass

def simulate_mutation(
    sequence: str,
    position: int,
    original_base: str,
    new_base: str,
    mutation_type: str = "substitution"
) -> dict:
    """
    Simulate a mutation on a coding DNA sequence, validate inputs,
    and compute full downstream effects through Codon -> Amino Acid -> Protein.
    """
    seq = sequence.upper().replace('U', 'T').strip()
    orig_base = original_base.upper().strip()
    mod_base = new_base.upper().strip()
    
    # 1. Validation
    if not seq:
        raise MutationValidationError("Sequence cannot be empty.")
    
    valid_bases = {'A', 'C', 'G', 'T'}
    invalid_chars = set(seq) - valid_bases
    if invalid_chars:
        raise MutationValidationError(f"Sequence contains invalid nucleotide characters: {invalid_chars}")
        
    seq_len = len(seq)
    if position < 1 or position > seq_len:
        raise MutationValidationError(
            f"Position {position} is out of bounds for sequence of length {seq_len}. (1-based coordinate expected)"
        )
        
    actual_base = seq[position - 1]
    if actual_base != orig_base:
        raise MutationValidationError(
            f"Nucleotide mismatch at position {position}: expected '{orig_base}', but found '{actual_base}' in sequence."
        )
        
    if mod_base not in valid_bases:
        raise MutationValidationError(f"Target nucleotide '{mod_base}' is invalid. Allowed: A, C, G, T.")
        
    if orig_base == mod_base and mutation_type == "substitution":
        raise MutationValidationError(
            f"Original base '{orig_base}' and new base '{mod_base}' are identical. Mutation must alter the nucleotide."
        )
        
    # 2. Apply mutation
    if mutation_type == "substitution":
        mod_seq = seq[:position - 1] + mod_base + seq[position:]
    elif mutation_type == "insertion":
        mod_seq = seq[:position - 1] + mod_base + seq[position - 1:]
    elif mutation_type == "deletion":
        mod_seq = seq[:position - 1] + seq[position:]
    else:
        raise MutationValidationError(f"Unsupported mutation type: {mutation_type}")

    # 3. Codon Analysis (for coding sequences)
    codon_info_orig = get_codon_info(seq, position)
    codon_info_mod = get_codon_info(mod_seq, position)
    
    orig_codon = codon_info_orig["codon"]
    mod_codon = codon_info_mod["codon"]
    codon_idx = codon_info_orig["codon_index"]
    pos_in_codon = codon_info_orig["position_in_codon"]

    # 4. Translation & Protein Analysis
    orig_protein = translate_sequence(seq)
    mod_protein = translate_sequence(mod_seq)
    
    residue_pos = codon_idx
    aa_comparison = compare_proteins(orig_protein, mod_protein, residue_pos)
    
    # 5. Classification
    classification_slug, classification_desc = classify_mutation(
        mutation_type=mutation_type,
        orig_aa=aa_comparison["original_aa_code"],
        mod_aa=aa_comparison["modified_aa_code"],
        orig_seq_len=len(seq),
        mod_seq_len=len(mod_seq)
    )

    # 6. Local sequence context & metrics
    local_window_orig = extract_local_window(seq, position, window_radius=10)
    local_window_mod = extract_local_window(mod_seq, position, window_radius=10)
    
    ti_tv = determine_transition_transversion(orig_base, mod_base) if mutation_type == "substitution" else "N/A"
    orig_gc = calculate_gc_content(seq)
    mod_gc = calculate_gc_content(mod_seq)

    return {
        "original_sequence": seq,
        "modified_sequence": mod_seq,
        "mutation_type": mutation_type,
        "position": position,
        "original_base": orig_base,
        "new_base": mod_base,
        "sequence_length": len(seq),
        "codon": {
            "codon_index": codon_idx,
            "position_in_codon": pos_in_codon,
            "original_codon": orig_codon,
            "modified_codon": mod_codon,
            "is_changed": orig_codon != mod_codon
        },
        "amino_acid": aa_comparison,
        "original_protein": orig_protein,
        "modified_protein": mod_protein,
        "protein_length": len(orig_protein),
        "classification": classification_slug,
        "classification_description": classification_desc,
        "local_window": {
            "start_pos": local_window_orig["start_pos"],
            "end_pos": local_window_orig["end_pos"],
            "original_window": local_window_orig["window_seq"],
            "modified_window": local_window_mod["window_seq"],
            "highlight_offset": local_window_orig["highlight_offset"]
        },
        "transition_transversion": ti_tv,
        "original_gc_content": orig_gc,
        "modified_gc_content": mod_gc
    }
