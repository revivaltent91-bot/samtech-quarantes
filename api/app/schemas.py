from typing import Annotated, Literal
from datetime import datetime

from pydantic import BaseModel, Field

PROJECT_STATUSES: tuple[str, ...] = ("En Production", "Pilote", "R&D", "Archivé")

ProjectStatus = Literal["En Production", "Pilote", "R&D", "Archivé"]

# Rôles utilisateurs
UserRole = Literal["admin", "publisher"]


class ParagraphBlock(BaseModel):
    type: Literal["paragraph"]
    text: str


class HeadingBlock(BaseModel):
    type: Literal["heading"]
    level: Literal[2, 3]
    text: str


class ListBlock(BaseModel):
    type: Literal["list"]
    items: list[str]
    ordered: bool = False


class QuoteBlock(BaseModel):
    type: Literal["quote"]
    text: str
    author: str | None = None


class TableBlock(BaseModel):
    type: Literal["table"]
    caption: str | None = None
    headers: list[str]
    rows: list[list[str]]


class CodeBlock(BaseModel):
    type: Literal["code"]
    language: str | None = None
    code: str


class ImageBlock(BaseModel):
    type: Literal["image"]
    src: str
    alt: str
    caption: str | None = None


class CtaBlock(BaseModel):
    type: Literal["cta"]
    text: str
    href: str
    label: str


ArticleBlock = Annotated[
    ParagraphBlock
    | HeadingBlock
    | ListBlock
    | QuoteBlock
    | TableBlock
    | CodeBlock
    | ImageBlock
    | CtaBlock,
    Field(discriminator="type"),
]


# --- Schémas Pole ---
class PoleBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    isActive: bool = True


class PoleCreate(PoleBase):
    pass


class PoleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    isActive: bool | None = None


class PoleInDB(PoleBase):
    id: int


# --- Schémas User ---
class UserBase(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    displayName: str = Field(min_length=1, max_length=200)
    role: UserRole
    userRole: str = Field(min_length=1, max_length=200)
    poleId: int
    isActive: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=1)


class UserUpdate(BaseModel):
    displayName: str | None = Field(default=None, min_length=1, max_length=200)
    userRole: str | None = Field(default=None, min_length=1, max_length=200)
    poleId: int | None = None
    isActive: bool | None = None
    # Nouveau mot de passe (hashé côté serveur)
    password: str | None = Field(default=None, min_length=1)


class UserInDB(UserBase):
    id: int
    createdAt: datetime
    updatedAt: datetime


# --- Schémas Author (pour compatibilité front) ---
class AuthorOut(BaseModel):
    name: str
    role: str
    pole: str


# --- Schémas Article modifiés ---
class ArticlePayload(BaseModel):
    slug: str = Field(min_length=1, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1)
    poleId: int
    excerpt: str = Field(min_length=1)
    heroImage: str = Field(min_length=1)
    publishedAt: str = Field(min_length=4)
    readTime: int = Field(ge=0)
    authorId: int
    featured: bool = False
    blocks: list[ArticleBlock]


class ArticleUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=1, pattern=r"^[a-z0-9-]+$")
    title: str | None = Field(default=None, min_length=1)
    poleId: int | None = None
    excerpt: str | None = Field(default=None, min_length=1)
    heroImage: str | None = Field(default=None, min_length=1)
    publishedAt: str | None = Field(default=None, min_length=4)
    readTime: int | None = Field(default=None, ge=0)
    authorId: int | None = None
    featured: bool | None = None
    blocks: list[ArticleBlock] | None = None


# --- Schémas Project modifiés ---
class ProjectDetail(BaseModel):
    challenge: str = Field(min_length=1)
    approach: str = Field(min_length=1)
    value: str = Field(min_length=1)


class ProjectPayload(BaseModel):
    slug: str = Field(min_length=1, pattern=r"^[a-z0-9-]+$")
    title: str = Field(min_length=1)
    poleId: int
    status: ProjectStatus
    description: str = Field(min_length=1)
    stack: list[str] = Field(default_factory=list)
    confidential: bool = False
    url: str | None = None
    featured: bool = False
    detail: ProjectDetail | None = None
    articleSlug: str | None = None


class ProjectUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=1, pattern=r"^[a-z0-9-]+$")
    title: str | None = Field(default=None, min_length=1)
    poleId: int | None = None
    status: ProjectStatus | None = None
    description: str | None = Field(default=None, min_length=1)
    stack: list[str] | None = None
    confidential: bool | None = None
    url: str | None = None
    featured: bool | None = None
    detail: ProjectDetail | None = None
    articleSlug: str | None = None


class LoginPayload(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)
