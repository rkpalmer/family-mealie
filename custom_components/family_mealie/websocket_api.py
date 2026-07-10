"""WebSocket API for the Family Mealie frontend."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .api import FamilyMealieApiError, FamilyMealieClient
from .const import DATA_CLIENTS, DATA_IMAGE_TOKEN, DATA_YAML_CLIENT, DOMAIN


def async_register_websocket_api(hass: HomeAssistant) -> None:
    """Register all websocket commands."""

    websocket_api.async_register_command(hass, websocket_info)
    websocket_api.async_register_command(hass, websocket_recipes)
    websocket_api.async_register_command(hass, websocket_recipe)
    websocket_api.async_register_command(hass, websocket_mealplans)
    websocket_api.async_register_command(hass, websocket_create_mealplan)
    websocket_api.async_register_command(hass, websocket_update_mealplan)
    websocket_api.async_register_command(hass, websocket_delete_mealplan)
    websocket_api.async_register_command(hass, websocket_shopping_lists)
    websocket_api.async_register_command(hass, websocket_shopping_list)
    websocket_api.async_register_command(hass, websocket_create_shopping_list)
    websocket_api.async_register_command(hass, websocket_create_shopping_item)
    websocket_api.async_register_command(hass, websocket_update_shopping_item)
    websocket_api.async_register_command(hass, websocket_delete_shopping_item)
    websocket_api.async_register_command(hass, websocket_add_recipe_to_shopping_list)


@websocket_api.websocket_command({vol.Required("type"): "family_mealie/info"})
@websocket_api.async_response
async def websocket_info(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Return integration metadata."""

    client = _client_from_msg(hass, msg)
    connection.send_result(
        msg["id"],
        {
            "base_url": client.base_url,
            "image_token": hass.data[DOMAIN][DATA_IMAGE_TOKEN],
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/recipes",
        vol.Optional("search", default=""): cv.string,
        vol.Optional("limit", default=300): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def websocket_recipes(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Return recipes."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).recipes(msg["search"], msg["limit"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/recipe",
        vol.Required("slug"): cv.string,
    }
)
@websocket_api.async_response
async def websocket_recipe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Return a recipe by slug."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).recipe(msg["slug"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/mealplans",
        vol.Required("start_date"): cv.string,
        vol.Required("end_date"): cv.string,
        vol.Optional("limit", default=-1): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def websocket_mealplans(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Return meal plans."""

    await _send_mealie_result(
        connection,
        msg,
        _client_from_msg(hass, msg).mealplans(msg["start_date"], msg["end_date"], msg["limit"]),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/mealplans/create",
        vol.Required("payload"): dict,
    }
)
@websocket_api.async_response
async def websocket_create_mealplan(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a meal plan entry."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).create_mealplan(msg["payload"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/mealplans/update",
        vol.Required("meal_id"): vol.Any(str, int),
        vol.Required("payload"): dict,
    }
)
@websocket_api.async_response
async def websocket_update_mealplan(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a meal plan entry."""

    await _send_mealie_result(
        connection,
        msg,
        _client_from_msg(hass, msg).update_mealplan(msg["meal_id"], msg["payload"]),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/mealplans/delete",
        vol.Required("meal_id"): vol.Any(str, int),
    }
)
@websocket_api.async_response
async def websocket_delete_mealplan(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a meal plan entry."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).delete_mealplan(msg["meal_id"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/shopping_lists",
        vol.Optional("limit", default=-1): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def websocket_shopping_lists(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return shopping lists."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).shopping_lists(msg["limit"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/shopping_list",
        vol.Required("list_id"): cv.string,
    }
)
@websocket_api.async_response
async def websocket_shopping_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return a shopping list."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).shopping_list(msg["list_id"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/shopping_lists/create",
        vol.Required("name"): cv.string,
    }
)
@websocket_api.async_response
async def websocket_create_shopping_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a shopping list."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).create_shopping_list(msg["name"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/shopping_items/create",
        vol.Required("payload"): dict,
    }
)
@websocket_api.async_response
async def websocket_create_shopping_item(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a shopping list item."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).create_shopping_item(msg["payload"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/shopping_items/update",
        vol.Required("item_id"): cv.string,
        vol.Required("payload"): dict,
    }
)
@websocket_api.async_response
async def websocket_update_shopping_item(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a shopping list item."""

    await _send_mealie_result(
        connection,
        msg,
        _client_from_msg(hass, msg).update_shopping_item(msg["item_id"], msg["payload"]),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/shopping_items/delete",
        vol.Required("item_id"): cv.string,
    }
)
@websocket_api.async_response
async def websocket_delete_shopping_item(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a shopping list item."""

    await _send_mealie_result(connection, msg, _client_from_msg(hass, msg).delete_shopping_item(msg["item_id"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "family_mealie/shopping_lists/add_recipe",
        vol.Required("list_id"): cv.string,
        vol.Required("recipe_id"): cv.string,
        vol.Optional("scale", default=1): vol.Coerce(float),
    }
)
@websocket_api.async_response
async def websocket_add_recipe_to_shopping_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add recipe ingredients to a shopping list."""

    await _send_mealie_result(
        connection,
        msg,
        _client_from_msg(hass, msg).add_recipe_to_shopping_list(msg["list_id"], msg["recipe_id"], msg["scale"]),
    )


async def _send_mealie_result(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    task,
) -> None:
    """Send a Mealie result or websocket error."""

    try:
        result = await task
    except FamilyMealieApiError as err:
        connection.send_error(msg["id"], "mealie_error", str(err))
        return
    except Exception as err:
        connection.send_error(msg["id"], "unknown_error", str(err))
        return

    connection.send_result(msg["id"], result)


def _client_from_msg(hass: HomeAssistant, msg: dict[str, Any]) -> FamilyMealieClient:
    """Return a configured Mealie client."""

    entry_id = msg.get("entry_id")
    clients = hass.data[DOMAIN][DATA_CLIENTS]
    if entry_id:
        return clients[entry_id]

    if clients:
        return next(iter(clients.values()))

    yaml_client = hass.data[DOMAIN].get(DATA_YAML_CLIENT)
    if yaml_client:
        return yaml_client

    raise FamilyMealieApiError("Family Mealie is not configured yet.")
