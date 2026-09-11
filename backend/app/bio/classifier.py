def classify_mutation(
    mutation_type: str,
    orig_aa: str,
    mod_aa: str,
    orig_seq_len: int,
    mod_seq_len: int
) -> tuple[str, str]:
    """
    Deterministically classify the consequence of a mutation at sequence/translation level.
    Returns (classification_slug, scientific_description).
    """
    if mutation_type in ["insertion", "deletion"]:
        delta = abs(mod_seq_len - orig_seq_len)
        if delta % 3 != 0:
            return (
                "frameshift",
                f"Reading frame disruption ({'+' if mod_seq_len > orig_seq_len else '-'}{delta} bp). Alters all downstream codons until a termination signal is reached."
            )
        else:
            return (
                "inframe_indel",
                f"In-frame insertion/deletion ({delta // 3} amino acids added/removed) preserving downstream reading frame."
            )

    # For substitutions:
    if orig_aa == mod_aa:
        return (
            "synonymous",
            "Synonymous (silent) mutation. The nucleotide change does not alter the encoded amino acid residue."
        )
    elif mod_aa == '*':
        return (
            "nonsense",
            "Nonsense mutation. The change creates a premature stop codon (termination signal), resulting in a truncated protein."
        )
    elif orig_aa == '*':
        return (
            "readthrough",
            "Non-stop / readthrough mutation. The natural stop codon is replaced by an amino acid, causing extended translation."
        )
    else:
        return (
            "missense",
            f"Missense mutation. Codon alteration replaces amino acid {orig_aa} with {mod_aa}."
        )
