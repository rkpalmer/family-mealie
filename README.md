# Family Mealie

Family Mealie is a Home Assistant custom integration plus Lovelace card that turns a local-only Mealie server into a kitchen-tablet meal planner.

The browser talks only to Home Assistant. Home Assistant talks to Mealie locally with a server-side Authorization header.

## What This Solves

- No iframe.
- No public Mealie access.
- No HTTPS or reverse proxy for Mealie.
- No Mealie token in frontend JavaScript.
- Works with externally accessible Home Assistant because Mealie remains local-only.

## Install Manually

Copy this folder into Home Assistant:

```text
custom_components/family_mealie
```

So it becomes:

```text
/config/custom_components/family_mealie
```

Restart Home Assistant.

## Configure With secrets.yaml

You already have:

```yaml
mealie_auth_header: "Bearer YOUR_MEALIE_API_TOKEN"
```

Add this to `configuration.yaml`:

```yaml
family_mealie:
  url: http://YOUR_MEALIE_HOST:9000
  auth_header: !secret mealie_auth_header
```

Restart Home Assistant after changing `configuration.yaml`.

You can also configure it from **Settings → Devices & services → Add integration → Family Mealie**, but YAML is the better fit when you want to reuse `secrets.yaml`.

## Add the Dashboard Resource

After the integration is loaded, it serves the bundled card at:

```text
/family_mealie/family-mealie-planner-card.js
```

Add a Lovelace resource:

```text
URL: /family_mealie/family-mealie-planner-card.js?v=1
Type: JavaScript Module
```

## Card YAML

```yaml
type: custom:family-mealie-planner-card
title: Meals
days: 7
entry_types:
  - breakfast
  - lunch
  - dinner
result_limit: 300
refresh_minutes: 15
```

If you configure more than one Family Mealie instance later, add the config entry id:

```yaml
entry_id: your_family_mealie_config_entry_id
```

## Current Features

- 7-day meal board.
- Add recipe meals.
- Add note meals like Leftovers, Eat Out, Freezer Meal.
- Remove meal-plan entries through Mealie's native API.
- Recipe search.
- Recipe detail/cooking dialog.
- Recipe image proxy through Home Assistant.
- Grocery list tab.
- Create grocery lists.
- Add, check, uncheck, and remove grocery items.
- Add recipe ingredients to a grocery list.

## Build

```bash
npm install
npm run build
```

The build writes:

```text
dist/family-mealie-planner-card.js
custom_components/family_mealie/www/family-mealie-planner-card.js
```

## Notes

This targets Mealie `v3.20.1` API paths:

- `/api/recipes`
- `/api/recipes/{slug}`
- `/api/recipes/{slug}/image`
- `/api/households/mealplans`
- `/api/households/shopping/lists`
- `/api/households/shopping/items`

The existing Home Assistant Mealie integration is not required for this bridge.
