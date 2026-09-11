def calculate_gc_content(sequence: str) -> float:
    """Calculate GC percentage of a nucleotide sequence."""
    if not sequence:
        return 0.0
    seq = sequence.upper()
    gc_count = seq.count('G') + seq.count('C')
    total = len(seq)
    return round((gc_count / total) * 100.0, 2)

def determine_transition_transversion(ref_base: str, alt_base: str) -> str:
    """
    Determine if single nucleotide substitution is a Transition (purine<->purine, pyrimidine<->pyrimidine)
    or Transversion (purine<->pyrimidine).
    """
    ref = ref_base.upper()
    alt = alt_base.upper()
    
    purines = {'A', 'G'}
    pyrimidines = {'C', 'T'}
    
    if (ref in purines and alt in purines) or (ref in pyrimidines and alt in pyrimidines):
        return "Transition"
    elif (ref in purines and alt in pyrimidines) or (ref in pyrimidines and alt in purines):
        return "Transversion"
    else:
        return "N/A"

def extract_local_window(sequence: str, position: int, window_radius: int = 10):
    """
    Extract a localized window surrounding position (1-based), e.g. 10 bp upstream and downstream.
    """
    zero_idx = position - 1
    start = max(0, zero_idx - window_radius)
    end = min(len(sequence), zero_idx + window_radius + 1)
    
    window_seq = sequence[start:end].upper()
    offset_in_window = zero_idx - start
    
    return {
        "start_pos": start + 1,  # 1-based
        "end_pos": end,          # 1-based
        "window_seq": window_seq,
        "highlight_offset": offset_in_window
    }
