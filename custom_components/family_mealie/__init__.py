"""Family Mealie integration."""

from __future__ import annotations

from pathlib import Path
from secrets import token_urlsafe
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType

from .api import FamilyMealieClient
from .const import (
    CONF_AUTH_HEADER,
    CONF_URL,
    DATA_CLIENTS,
    DATA_IMAGE_TOKEN,
    DATA_YAML_CLIENT,
    DEFAULT_NAME,
    DOMAIN,
    FRONTEND_JS,
    FRONTEND_URL,
)
from .image_proxy import FamilyMealieImageView
from .websocket_api import async_register_websocket_api

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_URL): cv.string,
                vol.Required(CONF_AUTH_HEADER): cv.string,
                vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up Family Mealie."""

    hass.data.setdefault(DOMAIN, {DATA_CLIENTS: {}})
    hass.data[DOMAIN].setdefault(DATA_IMAGE_TOKEN, token_urlsafe(32))

    await _async_register_frontend(hass)
    hass.http.register_view(FamilyMealieImageView)
    async_register_websocket_api(hass)

    if DOMAIN in config:
        yaml_config = config[DOMAIN]
        hass.data[DOMAIN][DATA_YAML_CLIENT] = FamilyMealieClient(
            async_get_clientsession(hass),
            yaml_config[CONF_URL],
            yaml_config[CONF_AUTH_HEADER],
        )

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Family Mealie from a config entry."""

    hass.data.setdefault(DOMAIN, {DATA_CLIENTS: {}})
    hass.data[DOMAIN][DATA_CLIENTS][entry.entry_id] = FamilyMealieClient(
        async_get_clientsession(hass),
        entry.data[CONF_URL],
        entry.data[CONF_AUTH_HEADER],
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    hass.data[DOMAIN][DATA_CLIENTS].pop(entry.entry_id, None)
    return True


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Register the bundled frontend as a static HA resource."""

    frontend_path = Path(__file__).parent / "www" / FRONTEND_JS
    if not frontend_path.exists():
        return

    try:
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths(
            [StaticPathConfig(FRONTEND_URL, str(frontend_path), cache_headers=True)]
        )
    except Exception:
        hass.http.register_static_path(FRONTEND_URL, str(frontend_path), cache_headers=True)
