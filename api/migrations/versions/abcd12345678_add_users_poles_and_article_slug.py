"""add users, poles tables and article_slug to projects

Revision ID: abcd12345678
Revises: fd3031e805b9
Create Date: 2026-09-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'abcd12345678'
down_revision: Union[str, Sequence[str], None] = 'fd3031e805b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ==================== CREATION DES TABLES ====================

    # Table poles
    op.create_table('poles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_poles_name'), 'poles', ['name'], unique=True)

    # Table users
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('display_name', sa.String(length=200), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('user_role', sa.String(length=200), nullable=False),
        sa.Column('pole_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['pole_id'], ['poles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # ==================== MODIFICATION DES TABLES EXISTANTES ====================

    # Ajouter colonnes à articles
    op.add_column('articles', sa.Column('pole_id', sa.Integer(), nullable=True))
    op.add_column('articles', sa.Column('author_id', sa.Integer(), nullable=True))
    op.add_column('articles', sa.Column('created_by_id', sa.Integer(), nullable=True))

    # Ajouter colonnes à projects
    op.add_column('projects', sa.Column('pole_id', sa.Integer(), nullable=True))
    op.add_column('projects', sa.Column('created_by_id', sa.Integer(), nullable=True))
    op.add_column('projects', sa.Column('article_slug', sa.String(length=200), nullable=True))

    # ==================== CREATION DES INDEX ====================
    op.create_index(op.f('ix_articles_pole_id'), 'articles', ['pole_id'])
    op.create_index(op.f('ix_articles_author_id'), 'articles', ['author_id'])
    op.create_index(op.f('ix_articles_created_by_id'), 'articles', ['created_by_id'])
    op.create_index(op.f('ix_projects_pole_id'), 'projects', ['pole_id'])
    op.create_index(op.f('ix_projects_created_by_id'), 'projects', ['created_by_id'])
    op.create_index(op.f('ix_projects_article_slug'), 'projects', ['article_slug'])

    # ==================== CREATION DES CLÉS ÉTRANGÈRES ====================

    op.create_foreign_key('fk_articles_pole_id', 'articles', 'poles', ['pole_id'], ['id'])
    op.create_foreign_key('fk_articles_author_id', 'articles', 'users', ['author_id'], ['id'])
    op.create_foreign_key('fk_articles_created_by_id', 'articles', 'users', ['created_by_id'], ['id'])
    op.create_foreign_key('fk_projects_pole_id', 'projects', 'poles', ['pole_id'], ['id'])
    op.create_foreign_key('fk_projects_created_by_id', 'projects', 'users', ['created_by_id'], ['id'])

    # ==================== MIGRATION DES DONNÉES ====================

    # 1. Insérer les pôles de base (permet une migration sur base vide)
    op.execute("""
        INSERT INTO poles (name, is_active) VALUES
            ('KARABA', true), ('KOF Corporation', true), ('TÉPÉ', true),
            ('Quarantes Studio', true), ('R&D', true), ('Vision', true)
        ON CONFLICT (name) DO NOTHING;
    """)

    # 2. Compléter avec les pôles éventuels manquants depuis articles et projets
    op.execute("""
        INSERT INTO poles (name, is_active)
        SELECT DISTINCT pole, true FROM articles
        WHERE pole IS NOT NULL
        ON CONFLICT (name) DO NOTHING;
    """)
    op.execute("""
        INSERT INTO poles (name, is_active)
        SELECT DISTINCT pole, true FROM projects
        WHERE pole IS NOT NULL
        ON CONFLICT (name) DO NOTHING;
    """)

    # 3. Mettre à jour articles avec pole_id
    op.execute("""
        UPDATE articles a
        SET pole_id = p.id
        FROM poles p
        WHERE a.pole = p.name AND a.pole_id IS NULL;
    """)

    # 4. Créer un utilisateur admin par défaut (hash pour 'admin123')
    op.execute("""
        INSERT INTO users (username, display_name, password_hash, role, user_role, pole_id, is_active)
        VALUES ('admin', 'Administrateur', '$2b$12$KI5aOWSv4QhAhq/5o.FZa.ynC5s58IJxULfJYzoV6RfkG0.wX2Fr6',
                'admin', 'Administrator',
                (SELECT id FROM poles WHERE name = 'KOF Corporation' LIMIT 1), true)
        ON CONFLICT (username) DO NOTHING;
    """)

    # 5. Créer des utilisateurs publisher pour chaque auteur existant dans articles
    #    (hash pour 'publisher123', mot de passe dev par défaut des publishers)
    op.execute("""
        INSERT INTO users (username, display_name, password_hash, role, user_role, pole_id, is_active)
        SELECT
            a.author_name || '-' || a.id as username,
            a.author_name as display_name,
            '$2b$12$yFloGAffAPZg4k3s5tyEv.RqbHr7xnde0evzaplbNX5n9GFyyevWy' as password_hash,
            'publisher' as role,
            a.author_role as user_role,
            p.id as pole_id,
            true as is_active
        FROM articles a
        JOIN poles p ON a.pole = p.name
        WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.username = a.author_name || '-' || a.id)
        ON CONFLICT (username) DO NOTHING;
    """)

    # 6. Mettre à jour articles avec author_id et created_by_id
    op.execute("""
        UPDATE articles a
        SET author_id = u.id, created_by_id = u.id
        FROM users u
        WHERE u.username = a.author_name || '-' || a.id AND a.author_id IS NULL;
    """)

    # Pour les articles où on n'a pas pu matcher l'utilisateur, on utilise l'admin
    op.execute("""
        UPDATE articles a
        SET author_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
            created_by_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
        WHERE a.author_id IS NULL;
    """)

    # 7. Mettre à jour projects avec pole_id
    op.execute("""
        UPDATE projects p
        SET pole_id = pl.id
        FROM poles pl
        WHERE p.pole = pl.name AND p.pole_id IS NULL;
    """)

    # 8. Mettre à jour projects avec created_by_id (admin par défaut)
    op.execute("""
        UPDATE projects p
        SET created_by_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
        WHERE p.created_by_id IS NULL;
    """)

    # ==================== RENDRE LES COLONNES NON-NULLABLE ====================

    op.alter_column('articles', 'pole_id', nullable=False)
    op.alter_column('articles', 'author_id', nullable=False)
    op.alter_column('articles', 'created_by_id', nullable=False)
    op.alter_column('projects', 'pole_id', nullable=False)
    op.alter_column('projects', 'created_by_id', nullable=False)

    # ==================== SUPPRESSION DES COLONNES LEGACY ====================
    # Les données de pole/auteur sont désormais dans poles + users.

    op.drop_index(op.f('ix_articles_pole'), table_name='articles')
    op.drop_index(op.f('ix_projects_pole'), table_name='projects')
    op.drop_column('articles', 'author_pole')
    op.drop_column('articles', 'author_role')
    op.drop_column('articles', 'author_name')
    op.drop_column('articles', 'pole')
    op.drop_column('projects', 'pole')


def downgrade() -> None:
    # Recréer les colonnes legacy (NOT NULL), avec backfill depuis poles/users
    op.add_column('articles', sa.Column('pole', sa.String(length=100), nullable=True))
    op.add_column('articles', sa.Column('author_name', sa.String(length=200), nullable=True))
    op.add_column('articles', sa.Column('author_role', sa.String(length=200), nullable=True))
    op.add_column('articles', sa.Column('author_pole', sa.String(length=100), nullable=True))
    op.add_column('projects', sa.Column('pole', sa.String(length=100), nullable=True))

    op.execute("""
        UPDATE articles a SET pole = p.name FROM poles p WHERE a.pole_id = p.id;
    """)
    op.execute("""
        UPDATE articles a
        SET author_name = u.display_name,
            author_role = u.user_role,
            author_pole = p.name
        FROM users u JOIN poles p ON u.pole_id = p.id
        WHERE a.author_id = u.id;
    """)
    op.execute("""
        UPDATE projects pj SET pole = p.name FROM poles p WHERE pj.pole_id = p.id;
    """)

    op.alter_column('articles', 'pole', nullable=False)
    op.alter_column('articles', 'author_name', nullable=False)
    op.alter_column('articles', 'author_role', nullable=False)
    op.alter_column('articles', 'author_pole', nullable=False)
    op.alter_column('projects', 'pole', nullable=False)

    op.create_index(op.f('ix_articles_pole'), 'articles', ['pole'])
    op.create_index(op.f('ix_projects_pole'), 'projects', ['pole'])

    # Supprimer clés étrangères
    op.drop_constraint('fk_projects_created_by_id', 'projects', type_='foreignkey')
    op.drop_constraint('fk_projects_pole_id', 'projects', type_='foreignkey')
    op.drop_constraint('fk_articles_created_by_id', 'articles', type_='foreignkey')
    op.drop_constraint('fk_articles_author_id', 'articles', type_='foreignkey')
    op.drop_constraint('fk_articles_pole_id', 'articles', type_='foreignkey')

    # Supprimer index
    op.drop_index(op.f('ix_projects_article_slug'), table_name='projects')
    op.drop_index(op.f('ix_projects_created_by_id'), table_name='projects')
    op.drop_index(op.f('ix_projects_pole_id'), table_name='projects')
    op.drop_index(op.f('ix_articles_created_by_id'), table_name='articles')
    op.drop_index(op.f('ix_articles_author_id'), table_name='articles')
    op.drop_index(op.f('ix_articles_pole_id'), table_name='articles')

    # Supprimer colonnes de projects
    op.drop_column('projects', 'article_slug')
    op.drop_column('projects', 'created_by_id')
    op.drop_column('projects', 'pole_id')

    # Supprimer colonnes de articles
    op.drop_column('articles', 'created_by_id')
    op.drop_column('articles', 'author_id')
    op.drop_column('articles', 'pole_id')

    # Supprimer tables
    op.drop_table('users')
    op.drop_table('poles')