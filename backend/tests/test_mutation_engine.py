import pytest
from app.bio.mutation_engine import simulate_mutation, MutationValidationError

def test_synonymous_mutation():
    # ATG (Met) CCA (Pro) GAA (Glu)
    seq = "ATGCCAGAA"
    # Codon GAA -> GAG is synonymous (both Glutamic Acid)
    res = simulate_mutation(seq, position=9, original_base="A", new_base="G")
    assert res["original_sequence"] == "ATGCCAGAA"
    assert res["modified_sequence"] == "ATGCCAGAG"
    assert res["codon"]["original_codon"] == "GAA"
    assert res["codon"]["modified_codon"] == "GAG"
    assert res["amino_acid"]["original_aa_code"] == "E"
    assert res["amino_acid"]["modified_aa_code"] == "E"
    assert res["classification"] == "synonymous"

def test_missense_mutation():
    seq = "ATGCCAGAA"
    # Codon GAA (Glu) -> GTA (Val) is missense
    res = simulate_mutation(seq, position=8, original_base="A", new_base="T")
    assert res["modified_sequence"] == "ATGCCAGTA"
    assert res["codon"]["original_codon"] == "GAA"
    assert res["codon"]["modified_codon"] == "GTA"
    assert res["amino_acid"]["original_aa_code"] == "E"
    assert res["amino_acid"]["modified_aa_code"] == "V"
    assert res["classification"] == "missense"

def test_nonsense_mutation():
    seq = "ATGCCAGAA"
    # Codon GAA -> TAA introduces a stop codon (*)
    res = simulate_mutation(seq, position=7, original_base="G", new_base="T")
    assert res["modified_sequence"] == "ATGCCATAA"
    assert res["amino_acid"]["modified_aa_code"] == "*"
    assert res["amino_acid"]["is_premature_stop"] is True
    assert res["classification"] == "nonsense"

def test_validation_bounds_and_mismatch():
    seq = "ATGCCAGAA"
    with pytest.raises(MutationValidationError, match="out of bounds"):
        simulate_mutation(seq, position=100, original_base="A", new_base="T")

    with pytest.raises(MutationValidationError, match="Nucleotide mismatch"):
        simulate_mutation(seq, position=1, original_base="C", new_base="T")

    with pytest.raises(MutationValidationError, match="identical"):
        simulate_mutation(seq, position=1, original_base="A", new_base="A")
