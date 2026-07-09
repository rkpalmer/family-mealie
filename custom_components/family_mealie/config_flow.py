"""Config flow for Family Mealie."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import FamilyMealieApiError, FamilyMealieClient
from .const import CONF_AUTH_HEADER, CONF_URL, DEFAULT_NAME, DOMAIN


class FamilyMealieConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a Family Mealie config flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        """Handle the initial step."""

        errors: dict[str, str] = {}

        if user_input is not None:
            client = FamilyMealieClient(
                async_get_clientsession(self.hass),
                user_input[CONF_URL],
                user_input[CONF_AUTH_HEADER],
            )
            try:
                await client.test_connection()
            except FamilyMealieApiError:
                errors["base"] = "cannot_connect"
            except Exception:
                errors["base"] = "unknown"
            else:
                await self.async_set_unique_id(user_input[CONF_URL].rstrip("/"))
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=user_input.get(CONF_NAME) or DEFAULT_NAME,
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_NAME, default=DEFAULT_NAME): str,
                    vol.Required(CONF_URL): str,
                    vol.Required(CONF_AUTH_HEADER): str,
                }
            ),
            errors=errors,
        )
