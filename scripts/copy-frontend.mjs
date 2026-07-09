import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("custom_components/family_mealie/www", { recursive: true });
copyFileSync(
  "dist/family-mealie-planner-card.js",
  "custom_components/family_mealie/www/family-mealie-planner-card.js",
);
