"""Mealie API client used by the Family Mealie integration."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
import re
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

    async def create_recipe(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Create a recipe and optionally fill in quick-entry details."""

        name = str(payload.get("name", "")).strip()
        if not name:
            raise FamilyMealieApiError("Recipe name is required.")

        ingredients = payload.get("recipeIngredient") or payload.get("recipe_ingredient")
        parser = str(payload.get("ingredientParser") or payload.get("ingredient_parser") or "auto")
        if payload.get("parseIngredients", True) and isinstance(ingredients, list):
            payload = payload | {"recipeIngredient": await self.parse_ingredient_lines(ingredients, parser)}

        slug_result = await self.post("/api/recipes", json={"name": name})
        slug = response_slug(slug_result)
        recipe = await self.recipe(slug)
        update_payload = recipe | compact(
            {
                "name": name,
                "description": payload.get("description"),
                "orgURL": payload.get("orgURL") or payload.get("org_url"),
                "recipeServings": payload.get("recipeServings") or payload.get("recipe_servings"),
                "recipeYield": payload.get("recipeYield") or payload.get("recipe_yield"),
                "prepTime": payload.get("prepTime") or payload.get("prep_time"),
                "cookTime": payload.get("cookTime") or payload.get("cook_time"),
                "totalTime": payload.get("totalTime") or payload.get("total_time"),
                "recipeIngredient": payload.get("recipeIngredient") or payload.get("recipe_ingredient"),
                "recipeInstructions": payload.get("recipeInstructions") or payload.get("recipe_instructions"),
                "notes": payload.get("notes") or payload.get("recipeNotes") or payload.get("recipe_notes"),
            }
        )
        try:
            return await self.put_with_alias_fallback(f"/api/recipes/{quote(slug, safe='')}", update_payload)
        except FamilyMealieApiError:
            fallback = recipe | compact(
                {
                    "name": name,
                    "description": payload.get("description"),
                    "orgURL": payload.get("orgURL") or payload.get("org_url"),
                    "recipeServings": payload.get("recipeServings") or payload.get("recipe_servings"),
                    "recipeYield": payload.get("recipeYield") or payload.get("recipe_yield"),
                    "prepTime": payload.get("prepTime") or payload.get("prep_time"),
                    "cookTime": payload.get("cookTime") or payload.get("cook_time"),
                    "totalTime": payload.get("totalTime") or payload.get("total_time"),
                    "recipeIngredient": plain_ingredient_lines(ingredients) if isinstance(ingredients, list) else ingredients,
                    "recipeInstructions": payload.get("recipeInstructions") or payload.get("recipe_instructions"),
                    "notes": payload.get("notes") or payload.get("recipeNotes") or payload.get("recipe_notes"),
                }
            )
            return await self.put_with_alias_fallback(f"/api/recipes/{quote(slug, safe='')}", fallback)

    async def import_recipe_url(
        self,
        url: str,
        include_tags: bool = False,
        include_categories: bool = False,
        parse_ingredients: bool = True,
        ingredient_parser: str = "auto",
    ) -> dict[str, Any]:
        """Import a recipe from a URL using Mealie's server-side scraper."""

        payload = {
            "url": url,
            "includeTags": include_tags,
            "includeCategories": include_categories,
        }
        result = await self.post_with_alias_fallback("/api/recipes/create/url", payload, timeout=90)
        slug = response_slug(result)
        if parse_ingredients:
            await self.parse_recipe_ingredients(slug, ingredient_parser)
        return {"slug": slug}

    async def parse_ingredient_lines(self, ingredients: list[Any], parser: str = "auto") -> list[Any]:
        """Parse pasted ingredient lines with Mealie's ingredient parser."""

        lines = [ingredient_line(item) for item in ingredients]
        lines = [line for line in lines if line]
        if not lines:
            return []

        for parser_name in parser_order(parser):
            try:
                parsed = await self.post(
                    "/api/parser/ingredients",
                    json={"parser": parser_name, "ingredients": lines},
                )
                if isinstance(parsed, list):
                    return [safe_parsed_ingredient(item, line) for item, line in zip(parsed, lines, strict=False)]
            except FamilyMealieApiError:
                pass

        return [{"note": line, "display": line, "originalText": line} for line in lines]

    async def parse_recipe_ingredients(self, slug: str, parser: str = "auto") -> dict[str, Any]:
        """Parse ingredients on an existing recipe and save the updated recipe."""

        recipe = await self.recipe(slug)
        ingredients = recipe.get("recipeIngredient") or recipe.get("recipe_ingredient")
        if not isinstance(ingredients, list) or not ingredients:
            return recipe

        parsed = await self.parse_ingredient_lines(ingredients, parser)
        if not parsed:
            return recipe

        try:
            return await self.put_with_alias_fallback(
                f"/api/recipes/{quote(slug, safe='')}",
                recipe | {"recipeIngredient": parsed},
            )
        except FamilyMealieApiError:
            return recipe

    async def recipe_image(self, recipe_id: str) -> MealieImage:
        """Return a recipe image by recipe id."""

        response = await self.request(
            "GET",
            f"/api/media/recipes/{quote(recipe_id, safe='')}/images/original.webp",
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

        return await self.post_with_alias_fallback("/api/households/mealplans", payload)

    async def update_mealplan(self, meal_id: int | str, payload: dict[str, Any]) -> dict[str, Any]:
        """Update a meal-plan entry."""

        return await self.put_with_alias_fallback(f"/api/households/mealplans/{meal_id}", payload)

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

        return await self.post_with_alias_fallback("/api/households/shopping/items", payload)

    async def update_shopping_item(self, item_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Update one shopping list item."""

        return await self.put_with_alias_fallback(f"/api/households/shopping/items/{quote(item_id, safe='')}", payload)

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

        payload = [{"recipeId": recipe_id, "recipeIncrementQuantity": scale}]
        return await self.post_with_alias_fallback(
            f"/api/households/shopping/lists/{quote(list_id, safe='')}/recipe",
            payload,
        )

    async def get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """GET JSON from Mealie."""

        return await self.request("GET", path, params=params)

    async def post(self, path: str, json: Any | None = None, timeout: int = DEFAULT_TIMEOUT) -> Any:
        """POST JSON to Mealie."""

        return await self.request("POST", path, json=json, timeout=timeout)

    async def put(self, path: str, json: Any | None = None) -> dict[str, Any]:
        """PUT JSON to Mealie."""

        return await self.request("PUT", path, json=json)

    async def post_with_alias_fallback(self, path: str, payload: Any, timeout: int = DEFAULT_TIMEOUT) -> Any:
        """POST JSON, retrying with snake_case aliases when Mealie rejects field names."""

        try:
            return await self.post(path, json=payload, timeout=timeout)
        except FamilyMealieApiError as err:
            if not looks_like_validation_error(err):
                raise
            return await self.post(path, json=camel_to_snake(payload), timeout=timeout)

    async def put_with_alias_fallback(self, path: str, payload: Any) -> dict[str, Any]:
        """PUT JSON, retrying with snake_case aliases when Mealie rejects field names."""

        try:
            return await self.put(path, json=payload)
        except FamilyMealieApiError as err:
            if not looks_like_validation_error(err):
                raise
            return await self.put(path, json=camel_to_snake(payload))

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
        timeout: int = DEFAULT_TIMEOUT,
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
            async with asyncio.timeout(timeout):
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


def response_slug(value: Any) -> str:
    """Return a slug from Mealie's string or object responses."""

    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        slug = value.get("slug") or value.get("value") or value.get("data")
        if slug:
            return str(slug)
    raise FamilyMealieApiError(f"Could not read recipe slug from Mealie response: {value}")


def ingredient_line(value: Any) -> str:
    """Return the original display line for a quick-entry ingredient."""

    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        return str(value.get("originalText") or value.get("original_text") or value.get("display") or value.get("note") or "").strip()
    return ""


def plain_ingredient_lines(ingredients: list[Any]) -> list[dict[str, str]]:
    """Return plain display ingredient objects from mixed ingredient values."""

    return [{"note": line, "display": line, "originalText": line} for line in (ingredient_line(item) for item in ingredients) if line]


def parser_order(parser: str) -> list[str]:
    """Return Mealie parser names in the order they should be tried."""

    parser_name = parser.strip().lower().replace("-", "_")
    if parser_name == "auto":
        return ["openai", "nlp", "brute"]
    if parser_name in {"openai", "nlp", "brute"}:
        return [parser_name]
    return ["openai", "nlp", "brute"]


def safe_parsed_ingredient(value: Any, fallback_line: str) -> dict[str, Any]:
    """Return a parsed ingredient only when it does not need Mealie's review flow."""

    if not isinstance(value, dict):
        return plain_ingredient(fallback_line)

    ingredient = value.get("ingredient")
    if not isinstance(ingredient, dict):
        return plain_ingredient(fallback_line)

    confidence = value.get("confidence")
    average = confidence.get("average") if isinstance(confidence, dict) else None
    if isinstance(average, (int, float)) and average < 0.85:
        return plain_ingredient(fallback_line)

    for key in ("food", "unit"):
        item = ingredient.get(key)
        if isinstance(item, dict) and item.get("id") in (None, ""):
            return plain_ingredient(fallback_line)

    cleaned = strip_empty_ids(ingredient)
    cleaned.setdefault("originalText", fallback_line)
    cleaned.setdefault("display", ingredient.get("display") or fallback_line)
    return cleaned


def plain_ingredient(line: str) -> dict[str, str]:
    """Return a plain ingredient object."""

    return {"note": line, "display": line, "originalText": line}


def strip_empty_ids(value: Any) -> Any:
    """Remove empty id values from nested parser objects."""

    if isinstance(value, list):
        return [strip_empty_ids(item) for item in value]
    if isinstance(value, dict):
        return {
            key: strip_empty_ids(item)
            for key, item in value.items()
            if not (key == "id" and item in (None, ""))
        }
    return value


def looks_like_validation_error(error: FamilyMealieApiError) -> bool:
    """Return true when retrying with alternate aliases might help."""

    return any(token in str(error).lower() for token in ("400", "422", "validation", "field required", "extra"))


def camel_to_snake(value: Any) -> Any:
    """Recursively convert camelCase dictionary keys to snake_case."""

    if isinstance(value, list):
        return [camel_to_snake(item) for item in value]
    if isinstance(value, dict):
        return {to_snake_case(key): camel_to_snake(item) for key, item in value.items()}
    return value


def to_snake_case(value: str) -> str:
    """Convert a camelCase key to snake_case."""

    return re.sub(r"(?<!^)(?=[A-Z])", "_", value).lower()
