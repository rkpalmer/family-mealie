"""Mealie API client used by the Family Mealie integration."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any
from urllib.parse import quote

from aiohttp import ClientResponse, ClientSession

from .const import DEFAULT_TIMEOUT


class FamilyMealieApiError(Exception):
    """Raised when Mealie returns an error response."""


@dataclass(slots=True)
class MealieImage:
    """Image response data proxied through Home Assistant."""

    body: bytes
    content_type: str
    etag: str | None = None


class FamilyMealieClient:
    """Tiny async client for the Mealie v3 API."""

    def __init__(self, session: ClientSession, url: str, auth_header: str) -> None:
        self._session = session
        self._url = url.rstrip("/")
        self._auth_header = normalize_auth_header(auth_header)

    @property
    def base_url(self) -> str:
        """Return the configured Mealie base URL."""

        return self._url

    async def test_connection(self) -> dict[str, Any]:
        """Verify the auth header can access the current user."""

        return await self.get("/api/users/self")

    async def recipes(self, search: str = "", limit: int = 300) -> dict[str, Any]:
        """Return recipes visible to the configured Mealie user."""

        params: dict[str, Any] = {
            "page": 1,
            "perPage": limit,
            "orderBy": "name",
            "orderDirection": "asc",
        }
        if search:
            params["search"] = search

        return await self.get("/api/recipes", params=params)

    async def recipe(self, slug: str) -> dict[str, Any]:
        """Return a single recipe by slug."""

        return await self.get(f"/api/recipes/{quote(slug, safe='')}")

    async def recipe_image(self, slug: str) -> MealieImage:
        """Return a recipe image by slug."""

        response = await self.request(
            "GET",
            f"/api/recipes/{quote(slug, safe='')}/image",
            raw_response=True,
        )
        assert isinstance(response, ClientResponse)
        try:
            body = await response.read()
            return MealieImage(
                body=body,
                content_type=response.headers.get("Content-Type", "image/jpeg"),
                etag=response.headers.get("ETag"),
            )
        finally:
            response.release()

    async def mealplans(self, start_date: str, end_date: str, limit: int = -1) -> dict[str, Any]:
        """Return meal-plan entries for a date range."""

        return await self.get(
            "/api/households/mealplans",
            params={
                "page": 1,
                "perPage": limit,
                "start_date": start_date,
                "end_date": end_date,
            },
        )

    async def create_mealplan(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Create a meal-plan entry."""

        return await self.post("/api/households/mealplans", json=payload)

    async def update_mealplan(self, meal_id: int | str, payload: dict[str, Any]) -> dict[str, Any]:
        """Update a meal-plan entry."""

        return await self.put(f"/api/households/mealplans/{meal_id}", json=payload)

    async def delete_mealplan(self, meal_id: int | str) -> dict[str, Any]:
        """Delete a meal-plan entry."""

        return await self.delete(f"/api/households/mealplans/{meal_id}")

    async def shopping_lists(self, limit: int = -1) -> dict[str, Any]:
        """Return shopping lists."""

        return await self.get("/api/households/shopping/lists", params={"page": 1, "perPage": limit})

    async def shopping_list(self, list_id: str) -> dict[str, Any]:
        """Return a shopping list with its items."""

        return await self.get(f"/api/households/shopping/lists/{quote(list_id, safe='')}")

    async def create_shopping_list(self, name: str) -> dict[str, Any]:
        """Create a shopping list."""

        return await self.post("/api/households/shopping/lists", json={"name": name})

    async def create_shopping_item(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Create one shopping list item."""

        return await self.post("/api/households/shopping/items", json=payload)

    async def update_shopping_item(self, item_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Update one shopping list item."""

        return await self.put(f"/api/households/shopping/items/{quote(item_id, safe='')}", json=payload)

    async def delete_shopping_item(self, item_id: str) -> dict[str, Any]:
        """Delete one shopping list item."""

        return await self.delete(f"/api/households/shopping/items/{quote(item_id, safe='')}")

    async def add_recipe_to_shopping_list(
        self,
        list_id: str,
        recipe_id: str,
        scale: float = 1,
    ) -> dict[str, Any]:
        """Add recipe ingredients to a shopping list."""

        return await self.post(
            f"/api/households/shopping/lists/{quote(list_id, safe='')}/recipe",
            json=[{"recipeId": recipe_id, "recipeIncrementQuantity": scale}],
        )

    async def get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """GET JSON from Mealie."""

        return await self.request("GET", path, params=params)

    async def post(self, path: str, json: Any | None = None) -> dict[str, Any]:
        """POST JSON to Mealie."""

        return await self.request("POST", path, json=json)

    async def put(self, path: str, json: Any | None = None) -> dict[str, Any]:
        """PUT JSON to Mealie."""

        return await self.request("PUT", path, json=json)

    async def delete(self, path: str) -> dict[str, Any]:
        """DELETE JSON from Mealie."""

        return await self.request("DELETE", path)

    async def request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any | None = None,
        raw_response: bool = False,
    ) -> dict[str, Any] | ClientResponse:
        """Request Mealie and return parsed JSON unless raw_response is requested."""

        url = f"{self._url}{path}"
        headers = {
            "Authorization": self._auth_header,
            "Accept": "application/json",
        }
        if json is not None:
            headers["Content-Type"] = "application/json"

        try:
            async with asyncio.timeout(DEFAULT_TIMEOUT):
                response = await self._session.request(
                    method,
                    url,
                    headers=headers,
                    params=compact(params or {}),
                    json=json,
                )
        except TimeoutError as err:
            raise FamilyMealieApiError(f"Timed out talking to Mealie at {self._url}") from err

        if raw_response:
            if response.status >= 400:
                await raise_for_response(response)
            return response

        async with response:
            if response.status >= 400:
                await raise_for_response(response)

            if response.status == 204:
                return {}

            if response.content_type == "application/json":
                return await response.json()

            text = await response.text()
            return {"value": text}


async def raise_for_response(response: ClientResponse) -> None:
    """Raise a helpful error from a Mealie response."""

    try:
        payload = await response.json()
    except Exception:
        payload = await response.text()

    message = payload
    if isinstance(payload, dict):
        message = payload.get("detail") or payload.get("message") or payload

    raise FamilyMealieApiError(f"Mealie API error {response.status}: {message}")


def normalize_auth_header(value: str) -> str:
    """Normalize a token or Authorization header value."""

    value = value.strip()
    if value.lower().startswith("bearer "):
        return value
    return f"Bearer {value}"


def compact(value: dict[str, Any]) -> dict[str, Any]:
    """Remove empty values from query params."""

    return {key: item for key, item in value.items() if item is not None and item != ""}
