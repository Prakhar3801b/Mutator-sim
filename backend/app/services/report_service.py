import datetime

def generate_markdown_report(data: dict) -> str:
    """
    Generate an authoritative, publication-style markdown report of the mutation simulation.
    """
    now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    gene = data.get("gene_symbol", "N/A")
    acc = data.get("accession", "N/A")
    pos = data.get("position", "N/A")
    orig_b = data.get("original_base", "N/A")
    new_b = data.get("new_base", "N/A")
    codon = data.get("codon", {})
    aa = data.get("amino_acid", {})
    classification = data.get("classification", "N/A").upper()
    class_desc = data.get("classification_description", "")
    ml = data.get("ml_prediction", {})
    clinvar = data.get("clinvar", {})
    
    md = f"""# Genetic Mutation Simulation Report
**Generated:** {now}  
**Platform:** Genetic Mutation Simulator (In-Silico Research Platform v1.1)

---

## 1. Sequence & Mutation Overview
- **Target Gene:** `{gene}`
- **Transcript / Accession:** `{acc}`
- **Mutation Type:** Single Nucleotide Substitution ({data.get('transition_transversion', 'N/A')})
- **CDS Coordinate:** Position `{pos}` (1-based)
- **Base Alteration:** `{orig_b}` $\\rightarrow$ `{new_b}`
- **Sequence GC Content:** {data.get('original_gc_content', 'N/A')}% $\\rightarrow$ {data.get('modified_gc_content', 'N/A')}%

---

## 2. Codon & Translation Analysis
- **Codon Number:** Triplet `{codon.get('codon_index', 'N/A')}` (Nucleotide position {codon.get('position_in_codon', 'N/A')} in triplet)
- **Codon Alteration:** `{codon.get('original_codon', 'N/A')}` $\\rightarrow$ `{codon.get('modified_codon', 'N/A')}`
- **Amino Acid Residue:** Residue `{aa.get('residue_index', 'N/A')}`
- **Protein Alteration:** `{aa.get('original_aa_name', 'N/A')}` $\\rightarrow$ `{aa.get('modified_aa_name', 'N/A')}`
- **Computational Classification:** **{classification}**
  > {class_desc}

---

## 3. Computational ML Impact Prediction
- **Model:** {ml.get('model_name', 'Random Forest Variant Predictor')}
- **Deleterious / Pathogenicity Probability:** `{ml.get('pathogenic_probability', 'N/A')}`
- **Predicted Risk Tier:** **{ml.get('risk_tier', 'N/A')}** ({ml.get('confidence_level', 'N/A')} confidence)
- **Key Feature Disruption Metrics:**
"""
    for feat in ml.get('feature_contributions', [])[:4]:
        md += f"  - **{feat.get('feature_label')}**: {feat.get('interpretation')}\n"

    md += f"""
---

## 4. Retrieved Database Evidence
- **ClinVar Status:** {clinvar.get('status_label', 'No record found')}
- **Exact Matches Found:** {len(clinvar.get('exact_matches', []))}
"""
    for m in clinvar.get('exact_matches', [])[:2]:
        md += f"  - **{m.get('title')}**: Significance: *{m.get('clinical_significance')}* (ID: {m.get('variation_id')})\n"

    md += """
---

## 5. Scientific Limitations & Boundaries
> **IMPORTANT NOTICE:** This computational simulation is provided solely for education, research, and in-silico experimentation. It is **NOT** a laboratory experiment, genetic test, or clinical diagnostic tool. Computational predictions do not guarantee biological outcomes in living organisms.
"""
    return md
