from fastapi.testclient import TestClient

from app.main import app as _app


def _article_payload(**over) -> dict:
    base = {
        "slug": "nouv-article",
        "title": "Nouvel article",
        "poleId": 4,  # Quarantes Studio est le 4ème pôle dans conftest
        "excerpt": "Résumé de l'article",
        "heroImage": "https://img.example.com/a.jpg",
        "publishedAt": "2026-09-12",
        "readTime": 5,
        "authorId": 1,  # admin user
        "featured": False,
        "blocks": [{"type": "paragraph", "text": "Contenu de test"}],
    }
    base.update({k: v for k, v in over.items() if v is not _DELETE})
    return base


_DELETE = object()


def test_admin_requires_auth(client):
    assert client.get("/api/admin/me").status_code == 401
    assert client.get("/api/admin/articles").status_code == 401
    assert client.get("/api/admin/projects").status_code == 401


def test_login_wrong_password(client):
    r = client.post("/api/admin/login", json={"username": "admin", "password": "nope"})
    assert r.status_code == 401


def test_full_article_crud(admin_client):
    c = admin_client
    r = c.post("/api/admin/articles", json=_article_payload())
    assert r.status_code == 201
    aid = r.json()["id"]

    r = c.put(f"/api/admin/articles/{aid}", json={"title": "Titre modifié"})
    assert r.status_code == 200
    assert r.json()["title"] == "Titre modifié"

    pub = c.get("/api/articles/nouv-article").json()
    assert pub["title"] == "Titre modifié"

    assert c.delete(f"/api/admin/articles/{aid}").status_code == 204
    assert c.get("/api/articles/nouv-article").status_code == 404


def test_duplicate_slug_conflict(admin_client):
    c = admin_client
    assert c.post("/api/admin/articles", json=_article_payload(slug="dup")).status_code == 201
    assert c.post("/api/admin/articles", json=_article_payload(slug="dup")).status_code == 409


def test_reject_unknown_pole(admin_client):
    r = admin_client.post("/api/admin/articles", json=_article_payload(poleId=999))
    assert r.status_code == 400


def test_reject_unknown_block_type(admin_client):
    data = _article_payload()
    data["blocks"] = [{"type": "inconnu", "text": "x"}]
    assert admin_client.post("/api/admin/articles", json=data).status_code == 422


def test_reject_invalid_slug_charset(admin_client):
    r = admin_client.post("/api/admin/articles", json=_article_payload(slug="MAUVAIS Slug!"))
    assert r.status_code == 422


def test_projects_crud(admin_client):
    c = admin_client
    r = c.post(
        "/api/admin/projects",
        json={
            "slug": "projet-test",
            "title": "Projet test",
            "poleId": 1,  # KARABA est le premier pôle
            "status": "R&D",
            "description": "Description",
            "stack": ["FastAPI"],
            "confidential": False,
            "url": None,
            "featured": False,
            "detail": {"challenge": "c", "approach": "a", "value": "v"},
        },
    )
    assert r.status_code == 201
    pid = r.json()["id"]

    r = c.put(f"/api/admin/projects/{pid}", json={"status": "Pilote"})
    assert r.status_code == 200
    assert r.json()["status"] == "Pilote"

    assert c.get("/api/projects/projet-test").json()["status"] == "Pilote"
    assert c.delete(f"/api/admin/projects/{pid}").status_code == 204
    assert c.get("/api/projects/projet-test").status_code == 404


def test_reject_invalid_project_status(admin_client):
    c = admin_client
    r = c.post(
        "/api/admin/projects",
        json={
            "slug": "projet-status",
            "title": "P",
            "poleId": 1,
            "status": "Terminé",
            "description": "d",
            "stack": [],
        },
    )
    assert r.status_code == 422


# ==================== NOUVEAUX TESTS POUR LA NOUVELLE ARCHITECTURE ====================

def test_login_with_db_user(client):
    """Test du login avec un utilisateur de la base de données"""
    r = client.post(
        "/api/admin/login",
        json={"username": "admin", "password": "admin123"}
    )
    assert r.status_code == 200
    assert r.json()["ok"] is True
    assert r.json()["username"] == "admin"
    assert r.json()["role"] == "admin"


def test_login_wrong_user(client):
    """Test du login avec un utilisateur invalide"""
    r = client.post(
        "/api/admin/login",
        json={"username": "nonexistent", "password": "admin123"}
    )
    assert r.status_code == 401


def test_me_endpoint(admin_client):
    """Test de l'endpoint /me"""
    r = admin_client.get("/api/admin/me")
    assert r.status_code == 200
    data = r.json()
    assert "id" in data
    assert "username" in data
    assert "role" in data
    assert "displayName" in data
    assert "userRole" in data
    assert "pole" in data


# Tests pour les pôles
def test_list_poles(admin_client):
    """Test de la liste des pôles"""
    r = admin_client.get("/api/admin/poles")
    assert r.status_code == 200
    poles = r.json()
    assert isinstance(poles, list)
    assert len(poles) > 0


def test_create_pole(admin_client):
    """Test de la création d'un pôle"""
    r = admin_client.post(
        "/api/admin/poles",
        json={"name": "Nouveau Pôle Test", "description": "Description test", "isActive": True}
    )
    assert r.status_code == 201
    pole = r.json()
    assert pole["name"] == "Nouveau Pôle Test"
    assert pole["description"] == "Description test"
    assert pole["isActive"] is True
    assert "id" in pole


def test_duplicate_pole(admin_client):
    """Test de la création d'un pôle en double"""
    # Créer un pôle
    admin_client.post(
        "/api/admin/poles",
        json={"name": "Pôle Duplicate Test", "isActive": True}
    )
    # Essayer de le recréer
    r = admin_client.post(
        "/api/admin/poles",
        json={"name": "Pôle Duplicate Test", "isActive": True}
    )
    assert r.status_code == 409


# Tests pour les utilisateurs
def test_list_users(admin_client):
    """Test de la liste des utilisateurs"""
    r = admin_client.get("/api/admin/users")
    assert r.status_code == 200
    users = r.json()
    assert isinstance(users, list)
    # L'admin doit être dans la liste
    assert any(u["username"] == "admin" for u in users)


def test_create_user(admin_client):
    """Test de la création d'un utilisateur"""
    # D'abord, récupérer un pôle
    poles = admin_client.get("/api/admin/poles").json()
    pole_id = poles[0]["id"]
    
    r = admin_client.post(
        "/api/admin/users",
        json={
            "username": "testuser",
            "displayName": "Test User",
            "password": "testpassword123",
            "role": "publisher",
            "userRole": "Test Role",
            "poleId": pole_id
        }
    )
    assert r.status_code == 201
    user = r.json()
    assert user["username"] == "testuser"
    assert user["displayName"] == "Test User"
    assert user["role"] == "publisher"


def test_duplicate_username(admin_client):
    """Test de la création d'un utilisateur avec un username déjà utilisé"""
    poles = admin_client.get("/api/admin/poles").json()
    pole_id = poles[0]["id"]
    
    # Créer un utilisateur
    admin_client.post(
        "/api/admin/users",
        json={
            "username": "duplicateuser",
            "displayName": "Duplicate User",
            "password": "password123",
            "role": "publisher",
            "userRole": "Test Role",
            "poleId": pole_id
        }
    )
    
    # Essayer de le recréer
    r = admin_client.post(
        "/api/admin/users",
        json={
            "username": "duplicateuser",
            "displayName": "Duplicate User 2",
            "password": "password123",
            "role": "publisher",
            "userRole": "Test Role",
            "poleId": pole_id
        }
    )
    assert r.status_code == 409


# Tests pour le lien article-projet
def test_project_with_article_slug(admin_client):
    """Test de la création d'un projet avec un articleSlug"""
    # D'abord, créer un article
    article_r = admin_client.post(
        "/api/admin/articles",
        json={
            "slug": "article-test-link",
            "title": "Article Test",
            "poleId": 1,
            "excerpt": "Excerpt",
            "heroImage": "https://test.com/image.jpg",
            "publishedAt": "2026-01-01",
            "readTime": 5,
            "authorId": 1,
            "featured": False,
            "blocks": []
        }
    )
    assert article_r.status_code == 201
    
    # Créer un projet avec l'articleSlug
    r = admin_client.post(
        "/api/admin/projects",
        json={
            "slug": "projet-with-article",
            "title": "Projet avec article",
            "poleId": 1,
            "status": "En Production",
            "description": "Description",
            "stack": [],
            "confidential": False,
            "featured": False,
            "articleSlug": "article-test-link"
        }
    )
    assert r.status_code == 201
    project = r.json()
    assert project["articleSlug"] == "article-test-link"


def test_project_with_invalid_article_slug(admin_client):
    """Test de la création d'un projet avec un articleSlug invalide"""
    r = admin_client.post(
        "/api/admin/projects",
        json={
            "slug": "projet-invalid-article",
            "title": "Projet avec article invalide",
            "poleId": 1,
            "status": "En Production",
            "description": "Description",
            "stack": [],
            "confidential": False,
            "featured": False,
            "articleSlug": "article-nonexistent"
        }
    )
    assert r.status_code == 400


# Tests pour les permissions
def test_publisher_cannot_access_other_pole(admin_client):
    """Un publisher ne peut lire/modifier que les ressources de son propre pôle"""
    poles = admin_client.get("/api/admin/poles").json()
    publisher_pole = next(p for p in poles if p["name"] == "KARABA")
    other_pole = next(p for p in poles if p["name"] != "KARABA")

    r = admin_client.post(
        "/api/admin/users",
        json={
            "username": "publisherk",
            "displayName": "Publisher KARABA",
            "password": "Pub123!",
            "role": "publisher",
            "userRole": "Rédacteur",
            "poleId": publisher_pole["id"],
        },
    )
    assert r.status_code == 201
    pub_user_id = r.json()["id"]

    pub = TestClient(_app)
    assert pub.post(
        "/api/admin/login", json={"username": "publisherk", "password": "Pub123!"}
    ).status_code == 200

    # Un projet d'un autre pôle n'est accessible ni en lecture ni en écriture
    projects = admin_client.get("/api/admin/projects").json()
    other = next(p for p in projects if p["poleId"] != publisher_pole["id"])
    assert pub.get(f"/api/admin/projects/{other['id']}").status_code == 403
    assert pub.put(
        f"/api/admin/projects/{other['id']}", json={"title": "Tentative"}
    ).status_code == 403
    assert pub.delete(f"/api/admin/projects/{other['id']}").status_code == 403

    # Créer un article pour un autre pôle → 403
    article = {
        "slug": "pub-art-ko",
        "title": "Article hors pôle",
        "poleId": other_pole["id"],
        "excerpt": "Résumé",
        "heroImage": "https://img.example.com/x.jpg",
        "publishedAt": "2026-09-15",
        "readTime": 3,
        "authorId": 1,
        "featured": False,
        "blocks": [{"type": "paragraph", "text": "test"}],
    }
    assert pub.post("/api/admin/articles", json=article).status_code == 403

    # Son propre pôle, avec lui-même comme auteur → 201
    article["slug"] = "pub-art-ok"
    article["poleId"] = publisher_pole["id"]
    article["authorId"] = pub_user_id
    assert pub.post("/api/admin/articles", json=article).status_code == 201


def test_update_user_password(admin_client):
    """Un admin peut réinitialiser le mot de passe d'un utilisateur"""
    poles = admin_client.get("/api/admin/poles").json()
    r = admin_client.post(
        "/api/admin/users",
        json={
            "username": "pwuser",
            "displayName": "PW User",
            "password": "OldPass123!",
            "role": "publisher",
            "userRole": "Rédacteur",
            "poleId": poles[0]["id"],
        },
    )
    assert r.status_code == 201
    uid = r.json()["id"]

    assert admin_client.put(f"/api/admin/users/{uid}", json={"password": "NewPass456!"}).status_code == 200

    ok_client = TestClient(_app)
    assert ok_client.post(
        "/api/admin/login", json={"username": "pwuser", "password": "NewPass456!"}
    ).status_code == 200
    old_client = TestClient(_app)
    assert old_client.post(
        "/api/admin/login", json={"username": "pwuser", "password": "OldPass123!"}
    ).status_code == 401