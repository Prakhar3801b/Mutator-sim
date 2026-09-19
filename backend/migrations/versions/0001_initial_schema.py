"""Initial schema: gene_cache, sequence_cache, analysis_history, literature_cache

Revision ID: 0001
Revises:
Create Date: 2026-09-19

Mirrors backend/app/database/models.py exactly (tables, columns, indexes).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- gene_cache -------------------------------------------------------
    op.create_table(
        "gene_cache",
        sa.Column("gene_id", sa.String(length=50), nullable=False),
        sa.Column("symbol", sa.String(length=50), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("organism", sa.String(length=100), nullable=True),
        sa.Column("chromosome", sa.String(length=20), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("transcripts_json", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("gene_id"),
    )
    op.create_index(op.f("ix_gene_cache_gene_id"), "gene_cache", ["gene_id"], unique=False)
    op.create_index(op.f("ix_gene_cache_symbol"), "gene_cache", ["symbol"], unique=False)
    op.create_index(op.f("ix_gene_cache_organism"), "gene_cache", ["organism"], unique=False)

    # --- sequence_cache ---------------------------------------------------
    op.create_table(
        "sequence_cache",
        sa.Column("accession", sa.String(length=100), nullable=False),
        sa.Column("sequence", sa.Text(), nullable=False),
        sa.Column("sequence_type", sa.String(length=50), nullable=True),
        sa.Column("length", sa.Integer(), nullable=True),
        sa.Column("gc_content", sa.Float(), nullable=True),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("accession"),
    )
    op.create_index(op.f("ix_sequence_cache_accession"), "sequence_cache", ["accession"], unique=False)

    # --- analysis_history -------------------------------------------------
    op.create_table(
        "analysis_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("gene_symbol", sa.String(length=50), nullable=True),
        sa.Column("accession", sa.String(length=100), nullable=True),
        sa.Column("mutation_type", sa.String(length=30), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("original_base", sa.String(length=10), nullable=False),
        sa.Column("new_base", sa.String(length=10), nullable=False),
        sa.Column("original_codon", sa.String(length=10), nullable=True),
        sa.Column("modified_codon", sa.String(length=10), nullable=True),
        sa.Column("original_aa", sa.String(length=20), nullable=True),
        sa.Column("modified_aa", sa.String(length=20), nullable=True),
        sa.Column("classification", sa.String(length=50), nullable=True),
        sa.Column("ml_score", sa.Float(), nullable=True),
        sa.Column("ml_tier", sa.String(length=50), nullable=True),
        sa.Column("clinvar_status", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_analysis_history_gene_symbol"), "analysis_history", ["gene_symbol"], unique=False)

    # --- literature_cache -------------------------------------------------
    op.create_table(
        "literature_cache",
        sa.Column("query", sa.String(length=255), nullable=False),
        sa.Column("papers_json", sa.Text(), nullable=False),
        sa.Column("count", sa.Integer(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("query"),
    )
    op.create_index(op.f("ix_literature_cache_query"), "literature_cache", ["query"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_literature_cache_query"), table_name="literature_cache")
    op.drop_table("literature_cache")
    op.drop_index(op.f("ix_analysis_history_gene_symbol"), table_name="analysis_history")
    op.drop_table("analysis_history")
    op.drop_index(op.f("ix_sequence_cache_accession"), table_name="sequence_cache")
    op.drop_table("sequence_cache")
    op.drop_index(op.f("ix_gene_cache_organism"), table_name="gene_cache")
    op.drop_index(op.f("ix_gene_cache_symbol"), table_name="gene_cache")
    op.drop_index(op.f("ix_gene_cache_gene_id"), table_name="gene_cache")
    op.drop_table("gene_cache")
