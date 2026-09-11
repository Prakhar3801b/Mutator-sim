from app.bio.codon_engine import translate_codon, get_amino_acid_name

def translate_sequence(dna_seq: str, stop_at_first_stop: bool = False) -> str:
    """
    Translate a coding DNA sequence into an amino acid sequence (1-letter codes).
    Trims trailing incomplete codons (mod 3).
    """
    dna_seq = dna_seq.upper().replace('U', 'T').strip()
    clean_seq = "".join([c for c in dna_seq if c in "ACGT"])
    
    protein = []
    num_codons = len(clean_seq) // 3
    
    for i in range(num_codons):
        triplet = clean_seq[i*3 : (i+1)*3]
        aa = translate_codon(triplet)
        protein.append(aa)
        if stop_at_first_stop and aa == '*':
            break
            
    return "".join(protein)

def compare_proteins(orig_protein: str, mod_protein: str, residue_pos: int):
    """
    Compare original vs modified protein at residue_pos (1-based).
    Returns detailed amino acid change structure.
    """
    orig_aa = orig_protein[residue_pos - 1] if residue_pos <= len(orig_protein) else 'X'
    mod_aa = mod_protein[residue_pos - 1] if residue_pos <= len(mod_protein) else 'X'
    
    orig_3l, orig_full = get_amino_acid_name(orig_aa)
    mod_3l, mod_full = get_amino_acid_name(mod_aa)
    
    is_changed = (orig_aa != mod_aa)
    is_premature_stop = (mod_aa == '*' and orig_aa != '*')
    is_stop_loss = (orig_aa == '*' and mod_aa != '*')
    
    return {
        "residue_index": residue_pos,
        "original_aa_code": orig_aa,
        "original_aa_name": f"{orig_3l} ({orig_full})",
        "modified_aa_code": mod_aa,
        "modified_aa_name": f"{mod_3l} ({mod_full})",
        "is_changed": is_changed,
        "is_premature_stop": is_premature_stop,
        "is_stop_loss": is_stop_loss
    }
