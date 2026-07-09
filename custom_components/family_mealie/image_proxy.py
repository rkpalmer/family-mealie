"""HTTP image proxy for recipe images."""

from __future__ import annotations

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .api import FamilyMealieApiError, FamilyMealieClient
from .const import DATA_CLIENTS, DATA_YAML_CLIENT, DOMAIN


class FamilyMealieImageView(HomeAssistantView):
    """Proxy Mealie recipe images through Home Assistant."""

    url = "/api/family_mealie/recipe/{slug}/image"
    name = "api:family_mealie:recipe_image"
    requires_auth = True

    async def get(self, request: web.Request, slug: str) -> web.Response:
        """Return an image from Mealie."""

        hass: HomeAssistant = request.app["hass"]
        client = _first_client(hass)

        try:
            image = await client.recipe_image(slug)
        except FamilyMealieApiError as err:
            raise web.HTTPBadGateway(text=str(err)) from err

        headers: dict[str, str] = {
            "Cache-Control": "private, max-age=3600",
        }
        if image.etag:
            headers["ETag"] = image.etag

        return web.Response(body=image.body, content_type=image.content_type, headers=headers)


def _first_client(hass: HomeAssistant) -> FamilyMealieClient:
    clients = hass.data[DOMAIN][DATA_CLIENTS]
    if clients:
        return next(iter(clients.values()))

    yaml_client = hass.data[DOMAIN].get(DATA_YAML_CLIENT)
    if yaml_client:
        return yaml_client

    raise FamilyMealieApiError("Family Mealie is not configured yet.")
