from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Pole(Base):
    __tablename__ = "poles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    users: Mapped[list["User"]] = relationship("User", back_populates="pole")
    articles: Mapped[list["Article"]] = relationship("Article", back_populates="pole")
    projects: Mapped[list["Project"]] = relationship("Project", back_populates="pole")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    user_role: Mapped[str] = mapped_column(String(200), nullable=False)
    pole_id: Mapped[int] = mapped_column(Integer, ForeignKey("poles.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    pole: Mapped["Pole"] = relationship("Pole", back_populates="users")
    authored_articles: Mapped[list["Article"]] = relationship(
        "Article", foreign_keys="Article.author_id", back_populates="author"
    )
    created_articles: Mapped[list["Article"]] = relationship(
        "Article", foreign_keys="Article.created_by_id", back_populates="created_by"
    )
    created_projects: Mapped[list["Project"]] = relationship(
        "Project", foreign_keys="Project.created_by_id", back_populates="created_by"
    )


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    pole_id: Mapped[int] = mapped_column(Integer, ForeignKey("poles.id"), nullable=False, index=True)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    hero_image: Mapped[str] = mapped_column(String(500), nullable=False)
    published_at: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    read_time: Mapped[int] = mapped_column(Integer, nullable=False)
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    blocks: Mapped[list[dict]] = mapped_column(JSONB, nullable=False)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    pole: Mapped["Pole"] = relationship("Pole", back_populates="articles")
    author: Mapped["User"] = relationship("User", foreign_keys=[author_id], back_populates="authored_articles")
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id], back_populates="created_articles")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    pole_id: Mapped[int] = mapped_column(Integer, ForeignKey("poles.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    confidential: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    stack: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    detail: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    article_slug: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    pole: Mapped["Pole"] = relationship("Pole", back_populates="projects")
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id], back_populates="created_projects")