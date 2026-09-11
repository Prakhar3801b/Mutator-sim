# Standard IUPAC Genetic Code Dictionary
CODON_TABLE = {
    'ATA':'I', 'ATC':'I', 'ATT':'I', 'ATG':'M',
    'ACA':'T', 'ACC':'T', 'ACG':'T', 'ACT':'T',
    'AAC':'N', 'AAT':'N', 'AAA':'K', 'AAG':'K',
    'AGC':'S', 'AGT':'S', 'AGA':'R', 'AGG':'R',
    'CTA':'L', 'CTC':'L', 'CTG':'L', 'CTT':'L',
    'CCA':'P', 'CCC':'P', 'CCG':'P', 'CCT':'P',
    'CAC':'H', 'CAT':'H', 'CAA':'Q', 'CAG':'Q',
    'CGA':'R', 'CGC':'R', 'CGG':'R', 'CGT':'R',
    'GTA':'V', 'GTC':'V', 'GTG':'V', 'GTT':'V',
    'GCA':'A', 'GCC':'A', 'GCG':'A', 'GCT':'A',
    'GAC':'D', 'GAT':'D', 'GAA':'E', 'GAG':'E',
    'GGA':'G', 'GGC':'G', 'GGG':'G', 'GGT':'G',
    'TCA':'S', 'TCC':'S', 'TCG':'S', 'TCT':'S',
    'TTC':'F', 'TTT':'F', 'TTA':'L', 'TTG':'L',
    'TAC':'Y', 'TAT':'Y', 'TAA':'*', 'TAG':'*',
    'TGC':'C', 'TGT':'C', 'TGA':'*', 'TGG':'W',
}

AMINO_ACID_NAMES = {
    'A': ('Ala', 'Alanine'),
    'C': ('Cys', 'Cysteine'),
    'D': ('Asp', 'Aspartic Acid'),
    'E': ('Glu', 'Glutamic Acid'),
    'F': ('Phe', 'Phenylalanine'),
    'G': ('Gly', 'Glycine'),
    'H': ('His', 'Histidine'),
    'I': ('Ile', 'Isoleucine'),
    'K': ('Lys', 'Lysine'),
    'L': ('Leu', 'Leucine'),
    'M': ('Met', 'Methionine'),
    'N': ('Asn', 'Asparagine'),
    'P': ('Pro', 'Proline'),
    'Q': ('Gln', 'Glutamine'),
    'R': ('Arg', 'Arginine'),
    'S': ('Ser', 'Serine'),
    'T': ('Thr', 'Threonine'),
    'V': ('Val', 'Valine'),
    'W': ('Trp', 'Tryptophan'),
    'Y': ('Tyr', 'Tyrosine'),
    '*': ('Ter', 'Stop Codon'),
    'X': ('Unk', 'Unknown')
}

def get_codon_info(sequence: str, position: int):
    """
    Given a 1-based coordinate in a coding sequence, determine:
    - codon_index (1-based codon number)
    - position_in_codon (1, 2, or 3)
    - codon string (3 nucleotides)
    - codon start and end index (0-based)
    """
    zero_idx = position - 1
    codon_idx = (zero_idx // 3) + 1
    pos_in_codon = (zero_idx % 3) + 1
    
    start_pos = (zero_idx // 3) * 3
    end_pos = start_pos + 3
    
    codon_seq = sequence[start_pos:end_pos].upper()
    
    return {
        "codon_index": codon_idx,
        "position_in_codon": pos_in_codon,
        "start_pos": start_pos,
        "end_pos": end_pos,
        "codon": codon_seq
    }

def translate_codon(codon: str) -> str:
    """Translate a single 3-nt codon to 1-letter amino acid code."""
    codon = codon.upper().replace('U', 'T')
    return CODON_TABLE.get(codon, 'X')

def get_amino_acid_name(single_letter: str) -> tuple[str, str]:
    """Return (3-letter abbreviation, full name) for a 1-letter code."""
    return AMINO_ACID_NAMES.get(single_letter.upper(), ('Unk', 'Unknown'))
