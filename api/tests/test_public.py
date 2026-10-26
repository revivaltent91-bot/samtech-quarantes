def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_meta(client):
    d = client.get("/api/meta").json()
    assert "KARABA" in d["articlePoles"]
    assert "TÉPÉ" in d["projectPoles"]
    assert "En Production" in d["projectStatuses"]


def test_meta_poles_ordered(client):
    d = client.get("/api/meta").json()
    assert d["articlePoles"] == sorted(d["articlePoles"])
    assert d["projectPoles"] == sorted(d["projectPoles"])


def test_list_articles(client):
    r = client.get("/api/articles")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 8
    first = data[0]
    assert first["slug"] == "karaba-os-dernier-kilometre"
    assert "blocks" not in first
    assert first["author"]["pole"] == "KARABA"
    assert first["heroImage"].startswith("https://")


def test_get_article(client):
    r = client.get("/api/articles/karaba-os-dernier-kilometre")
    assert r.status_code == 200
    d = r.json()
    assert len(d["blocks"]) == 10
    assert d["readTime"] == 8
    assert d["featured"] is True


def test_get_article_404(client):
    assert client.get("/api/articles/nope").status_code == 404


def test_list_projects(client):
    data = client.get("/api/projects").json()
    assert len(data) == 10
    assert all("detail" not in p for p in data)


def test_get_project(client):
    d = client.get("/api/projects/karaba-os-reseau-distribution").json()
    assert d["detail"]["value"]
    assert "FastAPI" in d["stack"]


def test_get_project_404(client):
    assert client.get("/api/projects/nope").status_code == 404