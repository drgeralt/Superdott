"""
tests/test_health.py
--------------------
Teste de Sanity Check: verifica se a API está viva.

Por que esse teste existe?
  É o teste mais simples possível. Se ele falhar, significa que
  o servidor não sobe — algo catastrófico está errado.
  No CI/CD, é a primeira linha de defesa.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_retorna_200(async_client: AsyncClient):
    """GET /health deve retornar HTTP 200."""
    response = await async_client.get("/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_retorna_status_ok(async_client: AsyncClient):
    """GET /health deve retornar o JSON {"status": "ok"}."""
    response = await async_client.get("/health")
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_health_content_type_json(async_client: AsyncClient):
    """GET /health deve retornar Content-Type application/json."""
    response = await async_client.get("/health")
    assert "application/json" in response.headers["content-type"]
