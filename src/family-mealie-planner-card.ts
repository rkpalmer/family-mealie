import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

interface HomeAssistant {
  callWS: <T = unknown>(message: Record<string, unknown>) => Promise<T>;
  config?: {
    language?: string;
  };
}

interface CardConfig {
  type: string;
  title?: string;
  days?: number;
  entry_types?: string[];
  result_limit?: number;
  refresh_minutes?: number;
  entry_id?: string;
  ingredient_parser?: IngredientParser;
  week_start?: WeekStart;
}

interface RecipeSummary {
  id?: string;
  slug?: string;
  name: string;
  description?: string;
  image?: string;
  raw: Record<string, unknown>;
}

interface RecipeDetail extends RecipeSummary {
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients: string[];
  instructions: string[];
  notes: RecipeNoteDetail[];
}

interface RecipeNoteDetail {
  title?: string;
  text: string;
}

interface MealPlanItem {
  id?: string | number;
  date: string;
  entryType: string;
  title: string;
  text?: string;
  recipeId?: string;
  recipeSlug?: string;
  image?: string;
  raw: Record<string, unknown>;
}

interface ShoppingListSummary {
  id: string;
  name: string;
  itemCount?: number;
  raw: Record<string, unknown>;
}

interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  title: string;
  checked: boolean;
  raw: Record<string, unknown>;
}

interface ShoppingListDetail extends ShoppingListSummary {
  items: ShoppingListItem[];
}

interface SlotContext {
  date: string;
  entryType: string;
}

interface ManualRecipeForm {
  name: string;
  source: string;
  description: string;
  servings: string;
  prep: string;
  cook: string;
  total: string;
  ingredients: string;
  instructions: string;
  notes: string;
  parseIngredients: boolean;
  ingredientParser: IngredientParser;
}

interface CardDraft {
  view?: MainView;
  plannerOffsetDays?: number;
  search?: string;
  recipeCreateOpen?: boolean;
  recipeCreateMode?: RecipeCreateMode;
  recipeUrl?: string;
  manualRecipeName?: string;
  manualRecipeSource?: string;
  manualRecipeDescription?: string;
  manualRecipeServings?: string;
  manualRecipePrep?: string;
  manualRecipeCook?: string;
  manualRecipeTotal?: string;
  manualRecipeIngredients?: string;
  manualRecipeInstructions?: string;
  manualRecipeNotes?: string;
  manualParseIngredients?: boolean;
  addDialogOpen?: boolean;
  selectedSlot?: SlotContext;
  noteTitle?: string;
  noteText?: string;
}

type MainView = "planner" | "recipes" | "groceries";
type RecipeCreateMode = "url" | "manual";
type IngredientParser = "auto" | "openai" | "nlp" | "brute";
type WeekStart = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | number;

const DEFAULT_ENTRY_TYPES = ["breakfast", "lunch", "dinner"];
const QUICK_NOTES = ["Leftovers:", "Eat Out:", "Freezer Meal:", "Kids:"];
const DRAFT_STORAGE_PREFIX = "family-mealie-planner-card:draft:v2";
const DRAFT_FIELDS = new Set([
  "view",
  "plannerOffsetDays",
  "search",
  "recipeCreateOpen",
  "recipeCreateMode",
  "recipeUrl",
  "manualRecipeName",
  "manualRecipeSource",
  "manualRecipeDescription",
  "manualRecipeServings",
  "manualRecipePrep",
  "manualRecipeCook",
  "manualRecipeTotal",
  "manualRecipeIngredients",
  "manualRecipeInstructions",
  "manualRecipeNotes",
  "manualParseIngredients",
  "addDialogOpen",
  "selectedSlot",
  "noteTitle",
  "noteText",
]);

@customElement("family-mealie-planner-card")
export class FamilyMealiePlannerCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config: CardConfig = { type: "custom:family-mealie-planner-card" };
  @state() private view: MainView = "planner";
  @state() private recipes: RecipeSummary[] = [];
  @state() private mealPlan: MealPlanItem[] = [];
  @state() private shoppingLists: ShoppingListSummary[] = [];
  @state() private selectedShoppingList?: ShoppingListDetail;
  @state() private selectedShoppingListId?: string;
  @state() private imageToken?: string;
  @state() private loading = false;
  @state() private error?: string;
  @state() private addDialogOpen = false;
  @state() private recipeDialogOpen = false;
  @state() private selectedSlot?: SlotContext;
  @state() private selectedMeal?: MealPlanItem;
  @state() private mealEditDate = "";
  @state() private mealEditEntryType = "";
  @state() private mealSaving = false;
  @state() private selectedRecipeForDialog?: RecipeSummary;
  @state() private recipeDetail?: RecipeDetail;
  @state() private recipeLoading = false;
  @state() private search = "";
  @state() private noteTitle = "";
  @state() private noteText = "";
  @state() private noteEditTitle = "";
  @state() private noteEditText = "";
  @state() private selectedRecipe?: RecipeSummary;
  @state() private plannerOffsetDays = 0;
  @state() private recipeCreateOpen = false;
  @state() private recipeCreateMode: RecipeCreateMode = "url";
  @state() private recipeUrl = "";
  @state() private manualRecipeName = "";
  @state() private manualRecipeSource = "";
  @state() private manualRecipeDescription = "";
  @state() private manualRecipeServings = "";
  @state() private manualRecipePrep = "";
  @state() private manualRecipeCook = "";
  @state() private manualRecipeTotal = "";
  @state() private manualRecipeIngredients = "";
  @state() private manualRecipeInstructions = "";
  @state() private manualRecipeNotes = "";
  @state() private manualParseIngredients = true;
  @state() private recipeSaving = false;
  @state() private recipeMessage?: string;
  @state() private groceryText = "";
  @state() private newListName = "";

  private refreshTimer?: number;
  private draftSaveTimer?: number;
  private draftRestored = false;
  private draggingMealId?: string;
  private pointerDrag?: {
    mealId: string;
    pointerId: number;
    startX: number;
    startY: number;
    active: boolean;
    source: HTMLElement;
    holdTimer?: number;
  };
  private suppressMealClickUntil = 0;

  public setConfig(config: CardConfig): void {
    if (!config || config.type !== "custom:family-mealie-planner-card") {
      throw new Error("Invalid card type. Use custom:family-mealie-planner-card.");
    }

    this.config = {
      title: "Meals",
      days: 7,
      entry_types: DEFAULT_ENTRY_TYPES,
      result_limit: 300,
      refresh_minutes: 15,
      ...config,
    };
    this.restartRefreshTimer();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.restoreDraft();
    this.restartRefreshTimer();
  }

  public disconnectedCallback(): void {
    window.clearInterval(this.refreshTimer);
    window.clearTimeout(this.draftSaveTimer);
    super.disconnectedCallback();
  }

  protected firstUpdated(): void {
    void this.refreshAll();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass && this.recipes.length === 0 && this.mealPlan.length === 0) {
      void this.refreshAll();
    }

    if (
      changed.has("addDialogOpen") ||
      changed.has("recipeDialogOpen") ||
      changed.has("mealEditEntryType") ||
      changed.has("selectedMeal") ||
      changed.has("selectedSlot")
    ) {
      this.syncNativeDialogs();
      this.syncNativeSelects();
    }

    if ([...changed.keys()].some((key) => DRAFT_FIELDS.has(String(key)))) {
      this.scheduleDraftSave();
    }
  }

  public getCardSize(): number {
    return 8;
  }

  protected render() {
    return html`
      <ha-card>
        <section class="shell">
          <header class="topbar">
            <div class="hero-icon"><ha-icon icon="mdi:silverware-fork-knife"></ha-icon></div>
            <div class="hero-copy">
              <p class="eyebrow">Family Mealie</p>
              <h2>${this.config.title}</h2>
              <p>${this.subtitle()}</p>
            </div>
            <div class="top-actions">
              ${this.view === "planner"
                ? html`
                    <button class="secondary action add-button" @click=${this.openDefaultAddDialog}>
                      <ha-icon icon="mdi:plus"></ha-icon>
                      <span>Add meal</span>
                    </button>
                  `
                : nothing}
              <button class="icon-button refresh-button" title="Refresh" @click=${this.refreshAll} ?disabled=${this.loading}>
                <ha-icon class=${this.loading ? "spin" : ""} icon=${this.loading ? "mdi:loading" : "mdi:refresh"}></ha-icon>
              </button>
            </div>
          </header>

          <nav class="tabs">
            ${this.renderTab("planner", "Planner", "mdi:calendar-week-outline")}
            ${this.renderTab("recipes", "Recipes", "mdi:chef-hat")}
            ${this.renderTab("groceries", "Groceries", "mdi:cart-outline")}
          </nav>

          ${this.error ? html`<div class="notice error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>${this.error}</div>` : nothing}
          ${this.view === "planner" ? this.renderPlanner() : nothing}
          ${this.view === "recipes" ? this.renderRecipes() : nothing}
          ${this.view === "groceries" ? this.renderGroceries() : nothing}
        </section>
      </ha-card>

      ${this.renderAddDialog()} ${this.renderRecipeDialog()}
    `;
  }

  private renderTab(view: MainView, label: string, icon: string) {
    return html`
      <button class=${this.view === view ? "active" : ""} @click=${() => this.openView(view)}>
        <ha-icon icon=${icon}></ha-icon>
        <span>${label}</span>
      </button>
    `;
  }

  private renderPlanner() {
    const days = this.daysToShow();

    return html`
      <div class="planner-nav">
        <button class="plain" @click=${() => this.shiftPlannerRange(-this.rangeStepDays())}>Previous week</button>
        <button class="plain" @click=${this.resetPlannerRange} ?disabled=${this.plannerOffsetDays === 0}>This week</button>
        <button class="plain" @click=${() => this.shiftPlannerRange(this.rangeStepDays())}>Next week</button>
      </div>
      <div class="board" style=${`--day-count:${days.length}`}>
        ${days.map((day) => this.renderDay(day))}
      </div>
    `;
  }

  private renderDay(day: Date) {
    const date = toDateString(day);
    const hasMeals = this.hasMealsForDay(date);

    return html`
      <article
        class="day"
        data-drop-date=${date}
        @dragover=${this.onPlannerDragOver}
        @drop=${(event: DragEvent) => this.dropMeal(event, date)}
      >
        <div class="day-head">
          <span>${this.formatWeekday(day)}</span>
          <strong>${this.formatMonthDay(day)}</strong>
        </div>
        ${this.renderDropTargets(date)}
        <div class="meal-sections">
          ${hasMeals
            ? this.entryTypes().map((entryType) => this.renderMealSection(day, entryType))
            : html`<div class="empty-day">No meals planned</div>`}
        </div>
      </article>
    `;
  }

  private renderMealSection(day: Date, entryType: string) {
    const date = toDateString(day);
    const meals = this.mealsFor(date, entryType);
    if (!meals.length) return nothing;

    return html`
      <section
        class="meal-section"
        data-drop-date=${date}
        data-drop-entry-type=${entryType}
        @dragover=${this.onPlannerDragOver}
        @drop=${(event: DragEvent) => this.dropMeal(event, date, entryType)}
      >
        <header>
          <span>${titleCase(entryType)}</span>
        </header>
        <div class="meal-list">
          ${meals.map((meal) => this.renderMealCard(meal))}
        </div>
      </section>
    `;
  }

  private renderMealOption(recipe: RecipeSummary) {
    return html`
      <button
        type="button"
        class=${this.selectedRecipeKey(recipe) === this.selectedRecipeKey(this.selectedRecipe) ? "selected" : ""}
        @click=${() => this.chooseRecipe(recipe)}
      >
        ${recipe.image ? html`<img src=${recipe.image} alt="" loading="lazy" />` : html`<span class="thumb">${recipe.name.slice(0, 1)}</span>`}
        <span>${recipe.name}</span>
      </button>
    `;
  }

  private renderMealCard(meal: MealPlanItem) {
    return html`
      <button
        class="meal-pill"
        draggable="false"
        @pointerdown=${(event: PointerEvent) => this.startMealPointer(event, meal)}
        @pointermove=${this.moveMealPointer}
        @pointerup=${this.endMealPointer}
        @pointercancel=${this.cancelMealPointer}
        @click=${(event: MouseEvent) => this.onMealCardClick(event, meal)}
      >
        <strong>${meal.title}</strong>
        ${meal.text && meal.text !== meal.title ? html`<small>${meal.text}</small>` : nothing}
      </button>
    `;
  }

  private renderDropTargets(date: string) {
    return html`
      <div class="drop-targets">
        ${this.entryTypes().map(
          (entryType) => html`
            <button
              type="button"
              data-drop-date=${date}
              data-drop-entry-type=${entryType}
              @dragover=${this.onPlannerDragOver}
              @drop=${(event: DragEvent) => this.dropMeal(event, date, entryType)}
            >
              ${titleCase(entryType)}
            </button>
          `,
        )}
      </div>
    `;
  }

  private renderRecipes() {
    const recipes = this.filteredRecipes();

    return html`
      <div class="recipe-toolbar">
        <label>
          Search recipes
          <input
            type="search"
            placeholder="Pasta, tacos, soup..."
            .value=${this.search}
            @input=${(event: InputEvent) => this.setSearch(inputValue(event))}
          />
        </label>
        <button class="secondary" @click=${this.toggleRecipeCreate}>
          <ha-icon icon=${this.recipeCreateOpen ? "mdi:chevron-up" : "mdi:plus"}></ha-icon>
          <span>${this.recipeCreateOpen ? "Hide add recipe" : "Add recipe"}</span>
        </button>
      </div>

      ${this.recipeCreateOpen
        ? html`
            <section class="recipe-create-panel">
              <header>
                <h3>Add recipe</h3>
                <div class="mode-tabs">
                  <button class=${this.recipeCreateMode === "url" ? "active" : ""} @click=${() => this.setRecipeCreateMode("url")}>
                    <ha-icon icon="mdi:link-variant"></ha-icon>
                    <span>Import URL</span>
                  </button>
                  <button class=${this.recipeCreateMode === "manual" ? "active" : ""} @click=${() => this.setRecipeCreateMode("manual")}>
                    <ha-icon icon="mdi:pencil-outline"></ha-icon>
                    <span>Manual</span>
                  </button>
                </div>
              </header>
              ${this.recipeMessage ? html`<div class="success"><ha-icon icon="mdi:check-circle-outline"></ha-icon>${this.recipeMessage}</div>` : nothing}
              ${this.recipeCreateMode === "url" ? this.renderRecipeUrlCreate() : this.renderRecipeManualCreate()}
            </section>
          `
        : this.recipeMessage
          ? html`<div class="success compact"><ha-icon icon="mdi:check-circle-outline"></ha-icon>${this.recipeMessage}</div>`
          : nothing}

      <div class="recipe-grid">
        ${recipes.map(
          (recipe) => html`
            <button class="recipe-tile" @click=${() => this.openRecipeSummaryDialog(recipe)}>
              ${recipe.image ? html`<img src=${recipe.image} alt="" loading="lazy" />` : html`<span class="thumb">${recipe.name.slice(0, 1)}</span>`}
              <span>${recipe.name}</span>
            </button>
          `,
        )}
      </div>
    `;
  }

  private renderRecipeUrlCreate() {
    return html`
      <div class="recipe-url-row">
        <label>
          Recipe URL
          <input
            type="url"
            placeholder="https://..."
            .value=${this.recipeUrl}
            @input=${(event: InputEvent) => (this.recipeUrl = inputValue(event))}
          />
        </label>
        <button class="primary" @click=${this.importRecipeUrl} ?disabled=${this.recipeSaving || !this.recipeUrl.trim()}>
          <ha-icon class=${this.recipeSaving ? "spin" : ""} icon=${this.recipeSaving ? "mdi:loading" : "mdi:import"}></ha-icon>
          <span>${this.recipeSaving ? "Importing" : "Import"}</span>
        </button>
      </div>
    `;
  }

  private renderRecipeManualCreate() {
    return html`
      <div class="manual-recipe-form">
        <label>
          Name
          <input
            type="text"
            placeholder="Chicken soup"
            .value=${this.manualRecipeName}
            @input=${(event: InputEvent) => (this.manualRecipeName = inputValue(event))}
          />
        </label>
        <label>
          Source URL
          <input
            type="url"
            placeholder="https://..."
            .value=${this.manualRecipeSource}
            @input=${(event: InputEvent) => (this.manualRecipeSource = inputValue(event))}
          />
        </label>
        <label class="span-2">
          Description
          <textarea
            .value=${this.manualRecipeDescription}
            @input=${(event: InputEvent) => (this.manualRecipeDescription = inputValue(event))}
          ></textarea>
        </label>
        <div class="time-grid span-2">
          <label>
            Servings
            <input
              type="number"
              min="0"
              inputmode="numeric"
              .value=${this.manualRecipeServings}
              @input=${(event: InputEvent) => (this.manualRecipeServings = inputValue(event))}
            />
          </label>
          <label>
            Prep
            <input
              type="text"
              placeholder="15 min"
              .value=${this.manualRecipePrep}
              @input=${(event: InputEvent) => (this.manualRecipePrep = inputValue(event))}
            />
          </label>
          <label>
            Cook
            <input
              type="text"
              placeholder="30 min"
              .value=${this.manualRecipeCook}
              @input=${(event: InputEvent) => (this.manualRecipeCook = inputValue(event))}
            />
          </label>
          <label>
            Total
            <input
              type="text"
              placeholder="45 min"
              .value=${this.manualRecipeTotal}
              @input=${(event: InputEvent) => (this.manualRecipeTotal = inputValue(event))}
            />
          </label>
        </div>
        <label>
          Ingredients
          <textarea
            class="tall"
            .value=${this.manualRecipeIngredients}
            @input=${(event: InputEvent) => (this.manualRecipeIngredients = inputValue(event))}
          ></textarea>
        </label>
        <label>
          Instructions
          <textarea
            class="tall"
            .value=${this.manualRecipeInstructions}
            @input=${(event: InputEvent) => (this.manualRecipeInstructions = inputValue(event))}
          ></textarea>
        </label>
        <label class="span-2">
          Notes
          <textarea
            .value=${this.manualRecipeNotes}
            @input=${(event: InputEvent) => (this.manualRecipeNotes = inputValue(event))}
          ></textarea>
        </label>
        <label class="check-row span-2">
          <input
            type="checkbox"
            .checked=${this.manualParseIngredients}
            @change=${(event: Event) => (this.manualParseIngredients = (event.currentTarget as HTMLInputElement).checked)}
          />
          <span>Use Mealie ingredient parser</span>
        </label>
        <footer class="span-2">
          <button class="primary" @click=${this.createManualRecipe} ?disabled=${this.recipeSaving || !this.manualRecipeName.trim()}>
            <ha-icon class=${this.recipeSaving ? "spin" : ""} icon=${this.recipeSaving ? "mdi:loading" : "mdi:content-save-outline"}></ha-icon>
            <span>${this.recipeSaving ? "Saving" : "Save recipe"}</span>
          </button>
        </footer>
      </div>
    `;
  }

  private renderGroceries() {
    return html`
      <section class="grocery-layout">
        <aside class="list-rail">
          <div class="rail-head">
            <strong>Lists</strong>
            <button class="small secondary" @click=${this.createShoppingList} ?disabled=${!this.newListName.trim()}>
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>Create</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="New list"
            .value=${this.newListName}
            @input=${(event: InputEvent) => (this.newListName = inputValue(event))}
          />
          <div class="list-buttons">
            ${this.shoppingLists.map(
              (list) => html`
                <button
                  class=${this.selectedShoppingListId === list.id ? "selected" : ""}
                  @click=${() => this.selectShoppingList(list.id)}
                >
                  <span>${list.name}</span>
                  ${list.itemCount !== undefined ? html`<small>${list.itemCount}</small>` : nothing}
                </button>
              `,
            )}
          </div>
        </aside>

        <section class="grocery-main">
          ${this.selectedShoppingList
            ? html`
                <header>
                  <h3>${this.selectedShoppingList.name}</h3>
                  <button class="icon-button" title="Refresh list" @click=${() => this.selectedShoppingListId && this.loadShoppingList(this.selectedShoppingListId)}>
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </header>
                <div class="add-grocery">
                  <input
                    type="text"
                    placeholder="Add grocery item"
                    .value=${this.groceryText}
                    @input=${(event: InputEvent) => (this.groceryText = inputValue(event))}
                    @keydown=${this.onGroceryKeyDown}
                  />
                  <button class="primary" @click=${this.addShoppingItem} ?disabled=${!this.groceryText.trim()}>
                    <ha-icon icon="mdi:plus"></ha-icon>
                    <span>Add</span>
                  </button>
                </div>
                <div class="grocery-items">
                  ${repeat(
                    this.groceryItemsForDisplay(this.selectedShoppingList),
                    (item) => item.id,
                    (item) => this.renderShoppingItem(item),
                  )}
                </div>
              `
            : html`<div class="empty-panel">Create or choose a grocery list.</div>`}
        </section>
      </section>
    `;
  }

  private renderShoppingItem(item: ShoppingListItem) {
    return html`
      <div class=${item.checked ? "grocery-item checked" : "grocery-item"}>
        <label class="grocery-check">
          <input
            type="checkbox"
            .checked=${item.checked}
            @change=${(event: Event) => this.toggleShoppingItem(item, (event.currentTarget as HTMLInputElement).checked)}
          />
          <span>${item.title}</span>
        </label>
        <button class="delete-inline" @click=${(event: Event) => this.deleteShoppingItem(event, item)}>Remove</button>
      </div>
    `;
  }

  private groceryItemsForDisplay(list: ShoppingListDetail): ShoppingListItem[] {
    return [
      ...list.items.filter((item) => !item.checked),
      ...list.items.filter((item) => item.checked),
    ];
  }

  private renderAddDialog() {
    if (!this.addDialogOpen || !this.selectedSlot) return nothing;
    const matches = this.filteredRecipes().slice(0, 36);

    return html`
      <dialog class="dialog add" @cancel=${this.closeAddDialog}>
        <form method="dialog" class="dialog-panel">
          <header>
            <div>
              <span>Add meal</span>
              <h3>${titleCase(this.selectedSlot.entryType)} · ${this.formatDialogDate(this.selectedSlot.date)}</h3>
            </div>
            <button type="button" class="plain" @click=${this.closeAddDialog}>Close</button>
          </header>

          <div class="field-row">
            <label>
              Date
              <input type="date" .value=${this.selectedSlot.date} @input=${this.onDateInput} />
            </label>
            <label>
              Meal
              <select class="meal-type-select" .value=${this.selectedSlot.entryType} @change=${this.onEntryTypeInput}>
                ${this.renderEntryTypeOptions(this.selectedSlot.entryType)}
              </select>
            </label>
          </div>

          <label>
            Search recipes
            <input
              type="search"
              placeholder="Pasta, tacos, soup..."
              .value=${this.search}
              @input=${(event: InputEvent) => (this.search = inputValue(event))}
            />
          </label>

          <div class="recipe-results">
            ${matches.map(
              (recipe) => html`
                ${this.renderMealOption(recipe)}
              `,
            )}
          </div>

          <div class="note-area">
            <span>Or add a note</span>
            <div class="chips">
              ${QUICK_NOTES.map(
                (note) => html`
                  <button type="button" @click=${() => this.chooseNote(note)}>
                    ${note}
                  </button>
                `,
              )}
            </div>
            <div class="note-fields">
              <label>
                Title
                <input
                  type="text"
                  placeholder="Leftovers: Chicken dish"
                  .value=${this.noteTitle}
                  @input=${(event: InputEvent) => this.updateNoteTitle(inputValue(event))}
                />
              </label>
              <label>
                Note
                <textarea
                  placeholder="Optional detail"
                  .value=${this.noteText}
                  @input=${(event: InputEvent) => this.updateNoteText(inputValue(event))}
                ></textarea>
              </label>
            </div>
          </div>

          <footer>
            <button type="button" class="primary" @click=${this.addMeal} ?disabled=${!this.selectedRecipe && !this.noteTitle.trim()}>
              <ha-icon icon="mdi:calendar-plus"></ha-icon>
              <span>Add to plan</span>
            </button>
          </footer>
        </form>
      </dialog>
    `;
  }

  private renderRecipeDialog() {
    if (!this.recipeDialogOpen || (!this.selectedMeal && !this.selectedRecipeForDialog)) return nothing;
    const detail = this.recipeDetail;
    const title = this.selectedMeal?.title ?? this.selectedRecipeForDialog?.name ?? "Recipe";
    const entryType = this.selectedMeal?.entryType;
    const isNoteMeal = Boolean(this.selectedMeal && !this.selectedMeal.recipeSlug && !this.selectedMeal.recipeId);
    const planRecipe = detail ?? this.selectedRecipeForDialog;

    return html`
      <dialog class="dialog recipe" @cancel=${this.closeRecipeDialog}>
        <article class="dialog-panel cook-panel">
          <header>
            <div>
              <span>${entryType ? titleCase(entryType) : "Recipe"}</span>
              <h3>${title}</h3>
            </div>
            <button type="button" class="plain" @click=${this.closeRecipeDialog}>Close</button>
          </header>

          ${this.recipeLoading
            ? html`<div class="loading">Loading recipe...</div>`
            : html`
              ${this.selectedMeal ? this.renderMealPlacementEditor() : nothing}
              ${isNoteMeal
                ? this.renderNoteEditor()
            : html`
                ${detail?.image || this.selectedMeal?.image
                  ? html`<img class="hero-image" src=${detail?.image ?? this.selectedMeal?.image ?? ""} alt="" />`
                  : nothing}

                <div class="stats">
                  ${this.stat("Serves", detail?.servings)}
                  ${this.stat("Prep", detail?.prepTime)}
                  ${this.stat("Cook", detail?.cookTime)}
                  ${this.stat("Total", detail?.totalTime)}
                </div>

                ${detail?.ingredients.length
                  ? html`
                      <section class="cook-section">
                        <h4>Ingredients</h4>
                        <ul>
                          ${detail.ingredients.map((item) => html`<li>${item}</li>`)}
                        </ul>
                      </section>
                    `
                  : this.selectedMeal?.text
                    ? html`<section class="cook-section note"><p>${this.selectedMeal.text}</p></section>`
                    : nothing}

                ${detail?.instructions.length
                  ? html`
                      <section class="cook-section">
                        <h4>Instructions</h4>
                        <ol>
                          ${detail.instructions.map((step) => html`<li>${step}</li>`)}
                        </ol>
                      </section>
                    `
                  : nothing}

                ${detail?.notes.length
                  ? html`
                      <section class="cook-section">
                        <h4>Notes</h4>
                        <div class="recipe-notes">
                          ${detail.notes.map(
                            (note) => html`
                              <article>
                                ${note.title ? html`<strong>${note.title}</strong>` : nothing}
                                <p>${note.text}</p>
                              </article>
                            `,
                          )}
                        </div>
                      </section>
                    `
                  : nothing}
              `}
            `}

          <footer class="recipe-actions">
            ${isNoteMeal
              ? html`
                  <button class="primary" @click=${this.saveNoteMeal} ?disabled=${this.mealSaving || !this.noteEditTitle.trim()}>
                    <ha-icon class=${this.mealSaving ? "spin" : ""} icon=${this.mealSaving ? "mdi:loading" : "mdi:content-save-outline"}></ha-icon>
                    <span>${this.mealSaving ? "Saving" : "Save note"}</span>
                  </button>
                `
              : nothing}
            ${this.selectedMeal && !isNoteMeal
              ? html`
                  <button class="primary" @click=${this.saveMealPlacement} ?disabled=${this.mealSaving || !this.mealPlacementChanged()}>
                    <ha-icon class=${this.mealSaving ? "spin" : ""} icon=${this.mealSaving ? "mdi:loading" : "mdi:content-save-outline"}></ha-icon>
                    <span>${this.mealSaving ? "Saving" : "Save changes"}</span>
                  </button>
                `
              : nothing}
            ${!this.selectedMeal && !isNoteMeal && planRecipe
              ? html`
                  <button class="primary" @click=${this.planRecipeFromDialog} ?disabled=${!planRecipe.id}>
                    <ha-icon icon="mdi:calendar-plus"></ha-icon>
                    <span>Plan meal</span>
                  </button>
                `
              : nothing}
            ${!isNoteMeal && detail?.id && this.shoppingLists.length
              ? html`
                  <select .value=${this.selectedShoppingListId ?? ""} @change=${(event: Event) => this.selectShoppingList(inputValue(event))}>
                    ${this.shoppingLists.map((list) => html`<option .value=${list.id}>${list.name}</option>`)}
                  </select>
                  <button class="primary" @click=${() => detail?.id && this.addRecipeToGroceries(detail.id)}>
                    <ha-icon icon="mdi:cart-plus"></ha-icon>
                    <span>Add ingredients</span>
                  </button>
                `
              : nothing}
            ${this.selectedMeal
              ? html`<button class="danger" @click=${() => this.selectedMeal && this.confirmDeleteMeal(this.selectedMeal)}>Remove meal</button>`
              : nothing}
          </footer>
        </article>
      </dialog>
    `;
  }

  private renderNoteEditor() {
    return html`
      <section class="note-editor">
        <label>
          Title
          <input
            type="text"
            .value=${this.noteEditTitle}
            @input=${(event: InputEvent) => (this.noteEditTitle = inputValue(event))}
          />
        </label>
        <label>
          Note
          <textarea
            .value=${this.noteEditText}
            @input=${(event: InputEvent) => (this.noteEditText = inputValue(event))}
          ></textarea>
        </label>
      </section>
    `;
  }

  private renderMealPlacementEditor() {
    return html`
      <section class="meal-placement-editor">
        <label>
          Date
          <input type="date" .value=${this.mealEditDate} @input=${this.onMealEditDateInput} />
        </label>
        <label>
          Meal
          <select class="meal-type-select" .value=${this.mealEditEntryType} @change=${this.onMealEditEntryTypeInput}>
            ${this.renderEntryTypeOptions(this.mealEditEntryType)}
          </select>
        </label>
      </section>
    `;
  }

  private renderEntryTypeOptions(selected: string) {
    const selectedKey = entryTypeKey(selected);
    return this.entryTypes().map(
      (type) => html`<option value=${type} ?selected=${entryTypeKey(type) === selectedKey}>${titleCase(type)}</option>`,
    );
  }

  private stat(label: string, value?: string) {
    if (!value) return nothing;
    return html`<div><span>${label}</span><strong>${value}</strong></div>`;
  }

  private async refreshAll(): Promise<void> {
    if (!this.hass || this.loading) return;
    this.loading = true;
    this.error = undefined;

    try {
      await this.loadInfo();
      await Promise.all([this.loadRecipes(), this.loadMealPlan(), this.loadShoppingLists()]);
    } catch (error) {
      this.error = errorMessage(error, "Could not load Mealie data through Home Assistant.");
    } finally {
      this.loading = false;
    }
  }

  private async loadInfo(): Promise<void> {
    const response = await this.callFamilyMealie("family_mealie/info");
    const object = unwrapObject(response);
    this.imageToken = stringValue(object?.image_token) ?? stringValue(object?.imageToken);
  }

  private async loadRecipes(): Promise<void> {
    const response = await this.callFamilyMealie("family_mealie/recipes", {
      limit: this.config.result_limit ?? 300,
    });
    this.recipes = unwrapArray(response).map((item) => normalizeRecipeSummary(item, this.imageToken)).filter(Boolean) as RecipeSummary[];
  }

  private async loadMealPlan(): Promise<void> {
    const [start, end] = this.dateRange();
    const response = await this.callFamilyMealie("family_mealie/mealplans", {
      start_date: start,
      end_date: end,
      limit: -1,
    });
    this.mealPlan = unwrapArray(response)
      .map((item) => normalizeMealPlanItem(item, this.imageToken, this.entryTypes()))
      .filter(Boolean) as MealPlanItem[];
  }

  private async loadShoppingLists(): Promise<void> {
    const response = await this.callFamilyMealie("family_mealie/shopping_lists", { limit: -1 });
    const lists = unwrapArray(response).map(normalizeShoppingListSummary).filter(Boolean) as ShoppingListSummary[];
    this.shoppingLists = lists;

    if (!this.selectedShoppingListId && lists.length) {
      this.selectedShoppingListId = lists[0].id;
    }

    if (this.selectedShoppingListId) {
      await this.loadShoppingList(this.selectedShoppingListId);
    }
  }

  private async loadShoppingList(listId: string): Promise<void> {
    const response = await this.callFamilyMealie("family_mealie/shopping_list", { list_id: listId });
    const detail = normalizeShoppingListDetail(response);
    if (detail) {
      this.selectedShoppingList = detail;
      this.selectedShoppingListId = detail.id;
    }
  }

  private async fetchRecipeDetail(recipe: RecipeSummary | MealPlanItem): Promise<RecipeDetail | undefined> {
    const slug = isMealPlanItem(recipe) ? recipe.recipeSlug : recipe.slug;
    if (!slug) return undefined;
    const response = await this.callFamilyMealie("family_mealie/recipe", { slug });
    return normalizeRecipeDetail(response, this.imageToken);
  }

  private async importRecipeUrl(event: Event): Promise<void> {
    event.preventDefault();
    const url = this.recipeUrl.trim();
    if (!url) return;

    this.recipeSaving = true;
    this.recipeMessage = undefined;
    this.error = undefined;
    try {
      await this.callFamilyMealie("family_mealie/recipes/import_url", {
        url,
        include_tags: true,
        include_categories: true,
        parse_ingredients: true,
        ingredient_parser: this.config.ingredient_parser ?? "auto",
      });
      this.recipeUrl = "";
      this.saveDraftNow();
      this.recipeMessage = "Recipe imported.";
      await this.loadRecipes();
    } catch (error) {
      this.error = errorMessage(error, "Could not import recipe.");
    } finally {
      this.recipeSaving = false;
    }
  }

  private async createManualRecipe(event: Event): Promise<void> {
    event.preventDefault();
    const payload = manualRecipePayload({
      name: this.manualRecipeName,
      source: this.manualRecipeSource,
      description: this.manualRecipeDescription,
      servings: this.manualRecipeServings,
      prep: this.manualRecipePrep,
      cook: this.manualRecipeCook,
      total: this.manualRecipeTotal,
      ingredients: this.manualRecipeIngredients,
      instructions: this.manualRecipeInstructions,
      notes: this.manualRecipeNotes,
      parseIngredients: this.manualParseIngredients,
      ingredientParser: this.config.ingredient_parser ?? "auto",
    });
    if (!payload.name) return;

    this.recipeSaving = true;
    this.recipeMessage = undefined;
    this.error = undefined;
    try {
      await this.callFamilyMealie("family_mealie/recipes/create", { payload });
      this.clearManualRecipeForm();
      this.saveDraftNow();
      this.recipeMessage = "Recipe saved.";
      await this.loadRecipes();
    } catch (error) {
      this.error = errorMessage(error, "Could not save recipe.");
    } finally {
      this.recipeSaving = false;
    }
  }

  private async addMeal(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.selectedSlot) return;

    const recipe = this.selectedRecipe;
    const noteTitle = this.noteTitle.trim();
    const note = this.noteText.trim();
    const payload: Record<string, unknown> = {
      date: this.selectedSlot.date,
      entryType: this.canonicalEntryType(this.selectedSlot.entryType),
      title: "",
      text: "",
    };

    if (recipe?.id) {
      payload.recipeId = recipe.id;
    } else if (noteTitle) {
      payload.title = noteTitle;
      payload.text = note;
    }

    try {
      await this.callFamilyMealie("family_mealie/mealplans/create", { payload });
      this.closeAddDialog();
      this.selectedSlot = undefined;
      this.noteTitle = "";
      this.noteText = "";
      this.selectedRecipe = undefined;
      this.saveDraftNow();
      await this.loadMealPlan();
    } catch (error) {
      this.error = errorMessage(error, "Could not add meal.");
    }
  }

  private async saveNoteMeal(event: Event): Promise<void> {
    event.preventDefault();
    const meal = this.selectedMeal;
    if (!meal?.id) return;

    const title = this.noteEditTitle.trim();
    if (!title) return;
    const text = this.noteEditText.trim();
    const payload = mealPlanUpdatePayload(meal, {
      date: this.mealEditDate || meal.date,
      entryType: this.canonicalEntryType(this.mealEditEntryType || meal.entryType),
      title,
      text,
    });

    this.mealSaving = true;
    try {
      await this.callFamilyMealie("family_mealie/mealplans/update", { meal_id: meal.id, payload });
      this.selectedMeal = {
        ...meal,
        date: String(payload.date ?? meal.date),
        entryType: String(payload.entryType ?? meal.entryType),
        title,
        text,
        raw: { ...meal.raw, ...payload },
      };
      await this.loadMealPlan();
      this.closeRecipeDialog();
    } catch (error) {
      this.error = errorMessage(error, "Could not save meal.");
    } finally {
      this.mealSaving = false;
    }
  }

  private async saveMealPlacement(event: Event): Promise<void> {
    event.preventDefault();
    const meal = this.selectedMeal;
    if (!meal?.id) return;

    await this.moveMeal(meal, this.mealEditDate || meal.date, this.mealEditEntryType || meal.entryType, true);
  }

  private async confirmDeleteMeal(meal: MealPlanItem): Promise<void> {
    if (!meal.id) return;
    const ok = window.confirm(`Remove ${meal.title} from ${this.formatDialogDate(meal.date)}?`);
    if (!ok) return;

    try {
      await this.callFamilyMealie("family_mealie/mealplans/delete", { meal_id: meal.id });
      this.closeRecipeDialog();
      await this.loadMealPlan();
    } catch (error) {
      this.error = errorMessage(error, "Could not remove meal.");
    }
  }

  private async createShoppingList(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.newListName.trim();
    if (!name) return;

    try {
      const response = await this.callFamilyMealie("family_mealie/shopping_lists/create", { name });
      const list = normalizeShoppingListSummary(response);
      this.newListName = "";
      await this.loadShoppingLists();
      if (list) await this.selectShoppingList(list.id);
    } catch (error) {
      this.error = errorMessage(error, "Could not create grocery list.");
    }
  }

  private async addShoppingItem(event?: Event): Promise<void> {
    event?.preventDefault();
    const list = this.selectedShoppingList;
    const text = this.groceryText.trim();
    if (!list || !text) return;

    const payload = {
      shoppingListId: list.id,
      checked: false,
      position: list.items.length,
      quantity: 1,
      note: text,
      display: text,
      extras: {},
      recipeReferences: [],
    };

    try {
      await this.callFamilyMealie("family_mealie/shopping_items/create", { payload });
      this.groceryText = "";
      await this.loadShoppingList(list.id);
    } catch (error) {
      this.error = errorMessage(error, "Could not add grocery item.");
    }
  }

  private async toggleShoppingItem(item: ShoppingListItem, checked: boolean): Promise<void> {
    const payload = shoppingItemUpdatePayload(item, checked);
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/update", { item_id: item.id, payload });
      if (this.selectedShoppingListId) await this.loadShoppingList(this.selectedShoppingListId);
    } catch (error) {
      this.error = errorMessage(error, "Could not update grocery item.");
    }
  }

  private async deleteShoppingItem(event: Event, item: ShoppingListItem): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/delete", { item_id: item.id });
      if (this.selectedShoppingListId) await this.loadShoppingList(this.selectedShoppingListId);
    } catch (error) {
      this.error = errorMessage(error, "Could not remove grocery item.");
    }
  }

  private async addRecipeToGroceries(recipeId: string): Promise<void> {
    if (!this.selectedShoppingListId) return;
    try {
      await this.callFamilyMealie("family_mealie/shopping_lists/add_recipe", {
        list_id: this.selectedShoppingListId,
        recipe_id: recipeId,
        scale: 1,
      });
      await this.loadShoppingList(this.selectedShoppingListId);
      this.view = "groceries";
      this.closeRecipeDialog();
    } catch (error) {
      this.error = errorMessage(error, "Could not add ingredients to grocery list.");
    }
  }

  private async callFamilyMealie<T = unknown>(type: string, data: Record<string, unknown> = {}): Promise<T> {
    if (!this.hass) throw new Error("Home Assistant is not ready yet.");
    return this.hass.callWS<T>({
      type,
      entry_id: this.config.entry_id,
      ...data,
    });
  }

  private openView(view: MainView): void {
    this.view = view;
    if (view === "groceries" && !this.selectedShoppingList && this.selectedShoppingListId) {
      void this.loadShoppingList(this.selectedShoppingListId);
    }
  }

  private async shiftPlannerRange(days: number): Promise<void> {
    this.plannerOffsetDays += days;
    await this.reloadPlannerRange();
  }

  private resetPlannerRange = async (): Promise<void> => {
    this.plannerOffsetDays = 0;
    await this.reloadPlannerRange();
  };

  private async reloadPlannerRange(): Promise<void> {
    if (!this.hass) return;
    this.error = undefined;
    try {
      await this.loadMealPlan();
    } catch (error) {
      this.error = errorMessage(error, "Could not load meals for this week.");
    }
  }

  private clearManualRecipeForm(): void {
    this.manualRecipeName = "";
    this.manualRecipeSource = "";
    this.manualRecipeDescription = "";
    this.manualRecipeServings = "";
    this.manualRecipePrep = "";
    this.manualRecipeCook = "";
    this.manualRecipeTotal = "";
    this.manualRecipeIngredients = "";
    this.manualRecipeInstructions = "";
    this.manualRecipeNotes = "";
    this.manualParseIngredients = true;
  }

  private toggleRecipeCreate = (): void => {
    this.recipeCreateOpen = !this.recipeCreateOpen;
    if (this.recipeCreateOpen) this.recipeMessage = undefined;
  };

  private setRecipeCreateMode(mode: RecipeCreateMode): void {
    this.recipeCreateMode = mode;
  }

  private setSearch(value: string): void {
    this.search = value;
  }

  private openAddDialog(slot: SlotContext, recipe?: RecipeSummary): void {
    this.selectedSlot = slot;
    this.selectedRecipe = recipe;
    this.search = recipe?.name ?? "";
    this.noteTitle = "";
    this.noteText = "";
    this.addDialogOpen = true;
  }

  private openDefaultAddDialog = (): void => {
    const firstDay = this.daysToShow()[0] ?? startOfDay(new Date());
    const entryType = this.entryTypes()[0] ?? DEFAULT_ENTRY_TYPES[0];
    this.openAddDialog({ date: toDateString(firstDay), entryType });
  };

  private defaultRecipePlanSlot(): SlotContext {
    const [start, end] = this.dateRange();
    const today = toDateString(startOfDay(new Date()));
    const entryType = this.entryTypes()[0] ?? DEFAULT_ENTRY_TYPES[0];
    return {
      date: today >= start && today <= end ? today : start,
      entryType,
    };
  }

  private planRecipeFromDialog = (): void => {
    const recipe = this.recipeDetail ?? this.selectedRecipeForDialog;
    if (!recipe?.id) return;

    this.closeRecipeDialog();
    this.selectedMeal = undefined;
    this.selectedRecipeForDialog = undefined;
    this.recipeDetail = undefined;
    this.openAddDialog(this.defaultRecipePlanSlot(), recipe);
  };

  private closeAddDialog = (): void => {
    this.addDialogOpen = false;
  };

  private async openMealDialog(meal: MealPlanItem): Promise<void> {
    this.selectedMeal = meal;
    this.selectedRecipeForDialog = undefined;
    this.recipeDetail = undefined;
    this.mealEditDate = meal.date;
    this.mealEditEntryType = meal.entryType;
    this.noteEditTitle = meal.title;
    this.noteEditText = meal.text ?? "";
    this.recipeDialogOpen = true;

    if (meal.recipeSlug) {
      this.recipeLoading = true;
      try {
        this.recipeDetail = await this.fetchRecipeDetail(meal);
      } catch (error) {
        this.error = errorMessage(error, "Could not load recipe details.");
      } finally {
        this.recipeLoading = false;
      }
    }
  }

  private async openRecipeSummaryDialog(recipe: RecipeSummary): Promise<void> {
    this.selectedMeal = undefined;
    this.selectedRecipeForDialog = recipe;
    this.recipeDetail = undefined;
    this.recipeDialogOpen = true;
    this.recipeLoading = true;

    try {
      this.recipeDetail = await this.fetchRecipeDetail(recipe);
    } catch (error) {
      this.error = errorMessage(error, "Could not load recipe details.");
    } finally {
      this.recipeLoading = false;
    }
  }

  private closeRecipeDialog = (): void => {
    this.recipeDialogOpen = false;
    this.mealSaving = false;
  };

  private async selectShoppingList(listId: string): Promise<void> {
    if (!listId) return;
    this.selectedShoppingListId = listId;
    await this.loadShoppingList(listId);
  }

  private chooseRecipe(recipe: RecipeSummary): void {
    this.selectedRecipe = recipe;
    this.noteTitle = "";
    this.noteText = "";
  }

  private chooseNote(note: string): void {
    this.noteTitle = note;
    this.selectedRecipe = undefined;
  }

  private updateNoteTitle(value: string): void {
    this.noteTitle = value;
    if (value) this.selectedRecipe = undefined;
  }

  private updateNoteText(value: string): void {
    this.noteText = value;
    if (value) this.selectedRecipe = undefined;
  }

  private onDateInput(event: InputEvent): void {
    if (!this.selectedSlot) return;
    this.selectedSlot = { ...this.selectedSlot, date: inputValue(event) };
  }

  private onEntryTypeInput(event: InputEvent): void {
    if (!this.selectedSlot) return;
    this.selectedSlot = { ...this.selectedSlot, entryType: this.canonicalEntryType(inputValue(event)) };
  }

  private onMealEditDateInput = (event: InputEvent): void => {
    this.mealEditDate = inputValue(event);
  };

  private onMealEditEntryTypeInput = (event: InputEvent): void => {
    this.mealEditEntryType = this.canonicalEntryType(inputValue(event));
  };

  private mealPlacementChanged(): boolean {
    const meal = this.selectedMeal;
    if (!meal) return false;
    return this.mealEditDate !== meal.date || this.canonicalEntryType(this.mealEditEntryType) !== this.canonicalEntryType(meal.entryType);
  }

  private startMealPointer(event: PointerEvent, meal: MealPlanItem): void {
    if (!meal.id || event.button !== 0) return;

    const source = event.currentTarget as HTMLElement;
    source.setPointerCapture?.(event.pointerId);

    const drag = {
      mealId: String(meal.id),
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
      source,
      holdTimer: undefined as number | undefined,
    };
    drag.holdTimer = window.setTimeout(() => this.activateMealPointerDrag(drag.pointerId), 450);
    this.pointerDrag = drag;
  }

  private moveMealPointer = (event: PointerEvent): void => {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.active) {
      if (distance > 10) this.cancelMealPointer();
      return;
    }

    event.preventDefault();
  };

  private endMealPointer = (event: PointerEvent): void => {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.holdTimer) window.clearTimeout(drag.holdTimer);
    drag.source.releasePointerCapture?.(event.pointerId);
    this.pointerDrag = undefined;

    if (!drag.active) return;

    event.preventDefault();
    event.stopPropagation();
    this.suppressMealClickUntil = Date.now() + 350;

    const target = this.dropTargetFromPoint(event.clientX, event.clientY);
    this.clearDraggingState();
    if (!target) return;

    const meal = this.mealPlan.find((item) => String(item.id) === drag.mealId);
    if (!meal) return;
    void this.moveMeal(meal, target.date, target.entryType ?? meal.entryType);
  };

  private cancelMealPointer = (): void => {
    if (this.pointerDrag?.holdTimer) window.clearTimeout(this.pointerDrag.holdTimer);
    this.pointerDrag?.source.releasePointerCapture?.(this.pointerDrag.pointerId);
    this.pointerDrag = undefined;
    this.clearDraggingState();
  };

  private activateMealPointerDrag(pointerId: number): void {
    const drag = this.pointerDrag;
    if (!drag || drag.pointerId !== pointerId) return;

    drag.active = true;
    drag.holdTimer = undefined;
    this.draggingMealId = drag.mealId;
    this.classList.add("dragging-meal");
    drag.source.classList.add("dragging");
  }

  private onMealCardClick(event: MouseEvent, meal: MealPlanItem): void {
    if (Date.now() < this.suppressMealClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    void this.openMealDialog(meal);
  }

  private onPlannerDragOver = (event: DragEvent): void => {
    if (!this.draggingMealId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  };

  private async dropMeal(event: DragEvent, date: string, entryType?: string): Promise<void> {
    if (!this.draggingMealId) return;
    event.preventDefault();
    event.stopPropagation();

    const mealId = event.dataTransfer?.getData("text/plain") || this.draggingMealId;
    const meal = this.mealPlan.find((item) => String(item.id) === mealId);
    this.clearDraggingState();
    if (!meal) return;

    await this.moveMeal(meal, date, entryType ?? meal.entryType);
  }

  private dropTargetFromPoint(x: number, y: number): { date: string; entryType?: string } | undefined {
    const root = this.renderRoot as ShadowRoot;
    const element = root.elementFromPoint?.(x, y) as HTMLElement | null;
    const target = element?.closest<HTMLElement>("[data-drop-date]");
    const date = target?.dataset.dropDate;
    if (!date) return undefined;
    return {
      date,
      entryType: target.dataset.dropEntryType,
    };
  }

  private clearDraggingState(): void {
    this.classList.remove("dragging-meal");
    this.renderRoot.querySelectorAll(".meal-pill.dragging").forEach((element) => element.classList.remove("dragging"));
    this.draggingMealId = undefined;
  }

  private async moveMeal(meal: MealPlanItem, date: string, entryType: string, closeDialog = false): Promise<void> {
    const nextEntryType = this.canonicalEntryType(entryType);
    if (!meal.id || !date || !nextEntryType) return;
    if (meal.date === date && this.canonicalEntryType(meal.entryType) === nextEntryType) return;

    const payload = mealPlanUpdatePayload(meal, { date, entryType: nextEntryType });
    this.mealSaving = true;
    try {
      await this.callFamilyMealie("family_mealie/mealplans/update", { meal_id: meal.id, payload });
      this.selectedMeal = this.selectedMeal?.id === meal.id ? { ...meal, date, entryType: nextEntryType, raw: { ...meal.raw, ...payload } } : this.selectedMeal;
      await this.loadMealPlan();
      if (closeDialog) this.closeRecipeDialog();
    } catch (error) {
      this.error = errorMessage(error, "Could not move meal.");
    } finally {
      this.mealSaving = false;
    }
  }

  private onGroceryKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      void this.addShoppingItem(event);
    }
  };

  private filteredRecipes(): RecipeSummary[] {
    const query = this.search.trim().toLocaleLowerCase();
    if (!query) return this.recipes;
    return this.recipes.filter((recipe) => recipe.name.toLocaleLowerCase().includes(query));
  }

  private selectedRecipeKey(recipe?: RecipeSummary): string | undefined {
    return recipe?.id ?? recipe?.slug ?? recipe?.name;
  }

  private mealsFor(date: string, entryType: string): MealPlanItem[] {
    const key = entryTypeKey(entryType);
    return this.mealPlan.filter((meal) => meal.date === date && entryTypeKey(meal.entryType) === key);
  }

  private hasMealsForDay(date: string): boolean {
    return this.mealPlan.some((meal) => meal.date === date);
  }

  private daysToShow(): Date[] {
    const count = Math.max(1, Math.min(14, this.config.days ?? 7));
    const today = startOfDay(new Date());
    const start = addDays(startOfWeek(today, this.weekStartIndex()), this.plannerOffsetDays);
    return Array.from({ length: count }, (_, index) => addDays(start, index));
  }

  private rangeStepDays(): number {
    return Math.max(1, Math.min(14, this.config.days ?? 7));
  }

  private entryTypes(): string[] {
    const values = this.config.entry_types?.map((type) => type.trim()).filter(Boolean) ?? [];
    return values.length ? values : DEFAULT_ENTRY_TYPES;
  }

  private canonicalEntryType(value: string): string {
    return canonicalEntryType(value, this.entryTypes());
  }

  private weekStartIndex(): number {
    return weekStartIndex(this.config.week_start);
  }

  private dateRange(): [string, string] {
    const days = this.daysToShow();
    return [toDateString(days[0]), toDateString(days[days.length - 1])];
  }

  private subtitle(): string {
    if (this.view === "recipes") return `${this.recipes.length} recipes`;
    if (this.view === "groceries") return this.selectedShoppingList?.name ?? "Grocery lists";
    const days = this.daysToShow();
    return `${this.formatMonthDay(days[0])} - ${this.formatMonthDay(days[days.length - 1])}`;
  }

  private formatWeekday(date: Date): string {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { weekday: "short" }).format(date);
  }

  private formatMonthDay(date: Date): string {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { month: "short", day: "numeric" }).format(date);
  }

  private formatDialogDate(value: string): string {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { weekday: "long", month: "long", day: "numeric" }).format(parseLocalDate(value));
  }

  private restartRefreshTimer(): void {
    window.clearInterval(this.refreshTimer);
    const minutes = this.config.refresh_minutes ?? 15;
    if (minutes > 0) {
      this.refreshTimer = window.setInterval(() => void this.refreshAll(), minutes * 60 * 1000);
    }
  }

  private syncNativeDialogs(): void {
    const addDialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog.add");
    const recipeDialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog.recipe");

    if (this.addDialogOpen && addDialog && !addDialog.open) addDialog.showModal();
    if (this.recipeDialogOpen && recipeDialog && !recipeDialog.open) recipeDialog.showModal();
  }

  private syncNativeSelects(): void {
    const addSelect = this.renderRoot.querySelector<HTMLSelectElement>("dialog.add select.meal-type-select");
    if (addSelect && this.selectedSlot) {
      addSelect.value = this.canonicalEntryType(this.selectedSlot.entryType);
    }

    const editSelect = this.renderRoot.querySelector<HTMLSelectElement>("dialog.recipe select.meal-type-select");
    if (editSelect && this.selectedMeal) {
      editSelect.value = this.canonicalEntryType(this.mealEditEntryType || this.selectedMeal.entryType);
    }
  }

  private restoreDraft(): void {
    if (this.draftRestored) return;
    this.draftRestored = true;

    const draft = readDraft(this.draftStorageKey());
    if (!draft) return;

    if (draft.view && ["planner", "recipes", "groceries"].includes(draft.view)) this.view = draft.view;
    if (typeof draft.plannerOffsetDays === "number") this.plannerOffsetDays = draft.plannerOffsetDays;
    if (typeof draft.search === "string") this.search = draft.search;
    if (typeof draft.recipeCreateOpen === "boolean") this.recipeCreateOpen = draft.recipeCreateOpen;
    if (draft.recipeCreateMode === "url" || draft.recipeCreateMode === "manual") this.recipeCreateMode = draft.recipeCreateMode;
    if (typeof draft.recipeUrl === "string") this.recipeUrl = draft.recipeUrl;
    if (typeof draft.manualRecipeName === "string") this.manualRecipeName = draft.manualRecipeName;
    if (typeof draft.manualRecipeSource === "string") this.manualRecipeSource = draft.manualRecipeSource;
    if (typeof draft.manualRecipeDescription === "string") this.manualRecipeDescription = draft.manualRecipeDescription;
    if (typeof draft.manualRecipeServings === "string") this.manualRecipeServings = draft.manualRecipeServings;
    if (typeof draft.manualRecipePrep === "string") this.manualRecipePrep = draft.manualRecipePrep;
    if (typeof draft.manualRecipeCook === "string") this.manualRecipeCook = draft.manualRecipeCook;
    if (typeof draft.manualRecipeTotal === "string") this.manualRecipeTotal = draft.manualRecipeTotal;
    if (typeof draft.manualRecipeIngredients === "string") this.manualRecipeIngredients = draft.manualRecipeIngredients;
    if (typeof draft.manualRecipeInstructions === "string") this.manualRecipeInstructions = draft.manualRecipeInstructions;
    if (typeof draft.manualRecipeNotes === "string") this.manualRecipeNotes = draft.manualRecipeNotes;
    if (typeof draft.manualParseIngredients === "boolean") this.manualParseIngredients = draft.manualParseIngredients;
    if (draft.selectedSlot?.date && draft.selectedSlot.entryType) {
      this.selectedSlot = {
        date: draft.selectedSlot.date,
        entryType: this.canonicalEntryType(draft.selectedSlot.entryType),
      };
    }
    if (typeof draft.noteTitle === "string") this.noteTitle = draft.noteTitle;
    if (typeof draft.noteText === "string") this.noteText = draft.noteText;
    if (draft.addDialogOpen && this.selectedSlot) this.addDialogOpen = true;
  }

  private scheduleDraftSave(): void {
    window.clearTimeout(this.draftSaveTimer);
    this.draftSaveTimer = window.setTimeout(() => this.saveDraftNow(), 150);
  }

  private saveDraftNow(): void {
    window.clearTimeout(this.draftSaveTimer);
    writeDraft(this.draftStorageKey(), {
      view: this.view,
      plannerOffsetDays: this.plannerOffsetDays,
      search: this.search,
      recipeCreateOpen: this.recipeCreateOpen,
      recipeCreateMode: this.recipeCreateMode,
      recipeUrl: this.recipeUrl,
      manualRecipeName: this.manualRecipeName,
      manualRecipeSource: this.manualRecipeSource,
      manualRecipeDescription: this.manualRecipeDescription,
      manualRecipeServings: this.manualRecipeServings,
      manualRecipePrep: this.manualRecipePrep,
      manualRecipeCook: this.manualRecipeCook,
      manualRecipeTotal: this.manualRecipeTotal,
      manualRecipeIngredients: this.manualRecipeIngredients,
      manualRecipeInstructions: this.manualRecipeInstructions,
      manualRecipeNotes: this.manualRecipeNotes,
      manualParseIngredients: this.manualParseIngredients,
      addDialogOpen: this.addDialogOpen,
      selectedSlot: this.selectedSlot,
      noteTitle: this.noteTitle,
      noteText: this.noteText,
    });
  }

  private draftStorageKey(): string {
    return `${DRAFT_STORAGE_PREFIX}:${this.config.entry_id ?? this.config.title ?? "default"}`;
  }

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color);
      container-type: inline-size;
      --family-accent: var(--primary-color, #4f7765);
      --family-accent-soft: color-mix(in srgb, var(--family-accent) 12%, var(--card-background-color, #fff));
      --family-warm: color-mix(in srgb, #e8bc7c 12%, var(--card-background-color, #fff));
      --meal-card-radius: 14px;
      --meal-card-touch: 52px;
      --meal-card-surface: var(--card-background-color, #fff);
      --meal-card-muted: var(--secondary-text-color, #6b7280);
      --meal-card-line: var(--divider-color, rgba(0, 0, 0, 0.12));
      --meal-card-accent: var(--family-accent);
      --meal-card-warning: var(--error-color, #b3261e);
    }

    ha-card {
      overflow: hidden;
      border-radius: 26px;
      background: var(--meal-card-surface);
    }

    .shell {
      padding: 20px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--meal-card-accent) 10%, transparent), transparent 220px),
        var(--meal-card-surface);
    }

    .topbar,
    .dialog-panel > header,
    .dialog-panel > footer,
    .grocery-main header,
    .rail-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .topbar {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) auto;
      align-items: center;
      margin: -20px -20px 0;
      padding: 22px 24px;
      border-bottom: 1px solid var(--meal-card-line);
      background: linear-gradient(120deg, var(--family-accent-soft), color-mix(in srgb, #e8bc7c 10%, var(--meal-card-surface)));
    }

    .hero-icon {
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 16px;
      color: var(--family-accent);
      background: color-mix(in srgb, var(--family-accent) 15%, transparent);
    }

    .hero-icon ha-icon {
      --mdc-icon-size: 30px;
    }

    .hero-copy {
      min-width: 0;
    }

    .eyebrow {
      margin: 0 0 3px;
      color: var(--family-accent);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }

    h2,
    h3,
    h4,
    p {
      margin: 0;
    }

    h2 {
      font-size: 28px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    h3 {
      font-size: 24px;
      line-height: 1.15;
    }

    .topbar p,
    header span,
    .stats span,
    .note-area span {
      color: var(--meal-card-muted);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .topbar .eyebrow {
      color: var(--family-accent);
      font-size: 11px;
      letter-spacing: 0.13em;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    button {
      min-height: var(--meal-card-touch);
      border: 1px solid var(--meal-card-line);
      border-radius: 13px;
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      cursor: pointer;
    }

    button:disabled {
      cursor: progress;
      opacity: 0.65;
    }

    .primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border-color: transparent;
      background: var(--meal-card-accent);
      color: var(--text-primary-color, #fff);
      font-weight: 800;
      padding: 0 18px;
      box-shadow: 0 7px 18px color-mix(in srgb, var(--meal-card-accent) 24%, transparent);
    }

    .primary:disabled {
      box-shadow: none;
    }

    .secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border-color: color-mix(in srgb, var(--meal-card-accent) 30%, var(--meal-card-line));
      background: var(--family-accent-soft);
      color: var(--meal-card-accent);
      font-weight: 800;
      padding: 0 18px;
    }

    .icon-button {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      min-height: 44px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: var(--secondary-background-color);
      cursor: pointer;
    }

    .primary ha-icon,
    .secondary ha-icon,
    .icon-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .action {
      min-width: 116px;
    }

    .plain {
      min-height: 44px;
      padding: 0 14px;
      background: transparent;
    }

    .small {
      min-height: 40px;
      padding: 0 12px;
      font-size: 14px;
      font-weight: 750;
    }

    .danger,
    .delete-inline {
      color: var(--meal-card-warning);
      border-color: color-mix(in srgb, var(--meal-card-warning) 32%, var(--meal-card-line));
      background: color-mix(in srgb, var(--meal-card-warning) 8%, var(--meal-card-surface));
      font-weight: 750;
    }

    .tabs {
      display: inline-grid;
      grid-template-columns: repeat(3, minmax(120px, 1fr));
      gap: 6px;
      margin-top: 18px;
      padding: 6px;
      border: 1px solid var(--meal-card-line);
      border-radius: 16px;
      background: color-mix(in srgb, var(--primary-background-color, #f6f6f6) 72%, var(--meal-card-surface));
    }

    .tabs button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-height: 44px;
      border-radius: 12px;
      border: 0;
      font-weight: 800;
      background: transparent;
    }

    .tabs ha-icon {
      color: var(--meal-card-accent);
      --mdc-icon-size: 20px;
    }

    .tabs button.active {
      background: var(--meal-card-surface);
      box-shadow: var(--ha-card-box-shadow, 0 1px 4px rgba(0, 0, 0, 0.16));
    }

    .notice {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px 14px;
      border-radius: var(--meal-card-radius);
      font-size: 13px;
    }

    .notice.error {
      border: 1px solid color-mix(in srgb, var(--meal-card-warning) 35%, transparent);
      background: color-mix(in srgb, var(--meal-card-warning) 9%, var(--meal-card-surface));
      color: var(--meal-card-warning);
    }

    .board {
      display: grid;
      grid-template-columns: repeat(var(--day-count), minmax(178px, 1fr));
      gap: 12px;
      overflow-x: auto;
      padding: 18px 2px 2px;
      scrollbar-width: thin;
    }

    .day {
      min-width: 178px;
      border: 1px solid var(--meal-card-line);
      border-radius: 18px;
      background: color-mix(in srgb, var(--meal-card-surface) 90%, var(--primary-background-color, #f6f6f6));
      overflow: hidden;
    }

    .day-head {
      padding: 14px;
      border-bottom: 1px solid var(--meal-card-line);
    }

    .day-head span,
    .day-head strong {
      display: block;
    }

    .day-head span {
      color: var(--meal-card-muted);
      font-weight: 750;
    }

    .day-head strong {
      margin-top: 4px;
      font-size: 22px;
    }

    .meal-sections {
      display: grid;
      gap: 0;
      padding: 6px 0;
    }

    .drop-targets {
      display: none;
      grid-template-columns: repeat(auto-fit, minmax(86px, 1fr));
      gap: 8px;
      padding: 10px 12px 4px;
    }

    :host(.dragging-meal) .drop-targets {
      display: grid;
    }

    .drop-targets button {
      min-height: 40px;
      border-style: dashed;
      color: var(--meal-card-accent);
      background: color-mix(in srgb, var(--meal-card-accent) 8%, var(--meal-card-surface));
      font-size: 13px;
      font-weight: 800;
    }

    .planner-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
    }

    .empty-day {
      min-height: 150px;
      display: grid;
      place-items: center;
      padding: 18px;
      color: var(--meal-card-muted);
      font-weight: 800;
      text-align: center;
    }

    .meal-section {
      display: grid;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid var(--meal-card-line);
    }

    .meal-section:first-child {
      border-top: 0;
    }

    .meal-section header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .meal-section header span {
      color: var(--meal-card-muted);
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .meal-list {
      display: grid;
      gap: 8px;
    }

    .meal-pill {
      display: block;
      width: 100%;
      min-height: 64px;
      padding: 12px;
      border: 1px solid var(--meal-card-line);
      border-radius: 12px;
      background: var(--meal-card-surface);
      text-align: left;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
      touch-action: none;
      user-select: none;
    }

    .meal-pill strong,
    .meal-pill small {
      display: block;
      overflow-wrap: anywhere;
    }

    .meal-pill strong {
      font-size: 17px;
      line-height: 1.2;
    }

    .meal-pill small {
      margin-top: 4px;
      color: var(--meal-card-muted);
      font-size: 13px;
    }

    .meal-pill.dragging {
      opacity: 0.45;
      outline: 2px solid color-mix(in srgb, var(--meal-card-accent) 45%, transparent);
    }

    .recipe-create-panel,
    .recipe-toolbar {
      margin-top: 18px;
    }

    .recipe-toolbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: end;
    }

    .recipe-create-panel {
      display: grid;
      gap: 14px;
      padding: 14px;
      border: 1px solid var(--meal-card-line);
      border-radius: 18px;
      background: color-mix(in srgb, var(--meal-card-surface) 94%, var(--primary-background-color, #f6f6f6));
    }

    .recipe-create-panel header,
    .manual-recipe-form footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .mode-tabs {
      display: inline-flex;
      gap: 6px;
      padding: 5px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: var(--meal-card-surface);
    }

    .mode-tabs button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 40px;
      border: 0;
      padding: 0 12px;
      background: transparent;
      font-weight: 800;
    }

    .mode-tabs ha-icon {
      --mdc-icon-size: 18px;
    }

    .mode-tabs button.active {
      background: color-mix(in srgb, var(--meal-card-accent) 12%, var(--meal-card-surface));
      color: var(--meal-card-accent);
    }

    .recipe-url-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      align-items: end;
    }

    .manual-recipe-form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .span-2 {
      grid-column: 1 / -1;
    }

    .time-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    .success {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border: 1px solid color-mix(in srgb, var(--meal-card-accent) 35%, transparent);
      border-radius: var(--meal-card-radius);
      color: var(--meal-card-accent);
      background: color-mix(in srgb, var(--meal-card-accent) 8%, var(--meal-card-surface));
      font-weight: 750;
    }

    .success.compact {
      margin-top: 12px;
    }

    .check-row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
    }

    .check-row input {
      width: 24px;
      height: 24px;
      min-height: auto;
      padding: 0;
    }

    .recipe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 14px;
    }

    .recipe-tile {
      display: grid;
      grid-template-rows: 128px auto;
      gap: 10px;
      min-height: 210px;
      padding: 10px;
      border-radius: 16px;
      text-align: left;
      font-weight: 800;
    }

    .recipe-tile img,
    .hero-image {
      width: 100%;
      object-fit: cover;
      border-radius: var(--meal-card-radius);
      background: var(--primary-background-color);
    }

    .recipe-tile img {
      height: 128px;
    }

    .recipe-tile span {
      overflow-wrap: anywhere;
    }

    .grocery-layout {
      display: grid;
      grid-template-columns: minmax(220px, 280px) 1fr;
      gap: 14px;
      margin-top: 18px;
    }

    .list-rail,
    .grocery-main,
    .empty-panel {
      border: 1px solid var(--meal-card-line);
      border-radius: 18px;
      background: color-mix(in srgb, var(--meal-card-surface) 92%, var(--primary-background-color, #f6f6f6));
    }

    .list-rail {
      display: grid;
      align-content: start;
      gap: 10px;
      padding: 12px;
    }

    .list-buttons {
      display: grid;
      gap: 8px;
    }

    .list-buttons button {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 48px;
      padding: 0 12px;
      text-align: left;
      font-weight: 800;
    }

    .list-buttons button.selected {
      border-color: var(--meal-card-accent);
      background: color-mix(in srgb, var(--meal-card-accent) 10%, var(--meal-card-surface));
    }

    .list-buttons small {
      color: var(--meal-card-muted);
    }

    .grocery-main {
      display: grid;
      gap: 12px;
      padding: 14px;
      align-content: start;
    }

    .add-grocery {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
    }

    .grocery-items {
      display: grid;
      gap: 8px;
    }

    .grocery-item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      min-height: 58px;
      padding: 8px 10px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      font-size: 18px;
      font-weight: 750;
    }

    .grocery-check {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr);
      align-items: center;
      gap: 10px;
      min-width: 0;
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .grocery-item.checked {
      opacity: 0.72;
      background: color-mix(in srgb, var(--meal-card-surface) 88%, var(--primary-background-color, #f6f6f6));
    }

    .grocery-item input {
      min-height: auto;
      width: 24px;
      height: 24px;
      padding: 0;
    }

    .grocery-item input:checked + span {
      color: var(--meal-card-muted);
      text-decoration: line-through;
    }

    .delete-inline {
      min-height: 38px;
      padding: 0 10px;
      font-size: 13px;
    }

    .empty-panel {
      min-height: 240px;
      display: grid;
      place-items: center;
      color: var(--meal-card-muted);
      font-weight: 800;
    }

    .dialog {
      width: min(980px, calc(100vw - 32px));
      max-height: min(860px, calc(100vh - 32px));
      border: 0;
      border-radius: 22px;
      padding: 0;
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      box-shadow: var(--ha-card-box-shadow, 0 18px 64px rgba(0, 0, 0, 0.32));
    }

    .dialog::backdrop {
      background: rgba(0, 0, 0, 0.42);
    }

    .dialog-panel {
      display: grid;
      gap: 18px;
      padding: 22px;
      max-height: calc(100vh - 76px);
      overflow: auto;
    }

    .dialog-panel h3 {
      margin-top: 4px;
      font-size: 28px;
      line-height: 1.12;
    }

    .field-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    label {
      display: grid;
      gap: 8px;
      color: var(--meal-card-muted);
      font-weight: 750;
    }

    input,
    select,
    textarea {
      min-height: var(--meal-card-touch);
      border: 1px solid var(--meal-card-line);
      border-radius: 12px;
      padding: 0 14px;
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      outline: none;
    }

    input:focus,
    select:focus,
    textarea:focus {
      border-color: var(--meal-card-accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--meal-card-accent) 14%, transparent);
    }

    textarea {
      min-height: 130px;
      padding-top: 12px;
      resize: vertical;
    }

    textarea.tall {
      min-height: 190px;
    }

    .recipe-results {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 10px;
      max-height: 320px;
      overflow: auto;
      padding-right: 4px;
    }

    .recipe-results button {
      display: grid;
      grid-template-columns: 48px 1fr;
      align-items: center;
      gap: 12px;
      min-height: 68px;
      padding: 9px;
      text-align: left;
      font-weight: 750;
    }

    .recipe-results button.selected {
      border-color: var(--meal-card-accent);
      background: color-mix(in srgb, var(--meal-card-accent) 10%, var(--meal-card-surface));
    }

    .recipe-results img,
    .thumb {
      width: 48px;
      height: 48px;
      border-radius: var(--meal-card-radius);
      object-fit: cover;
    }

    .thumb {
      display: grid;
      place-items: center;
      background: color-mix(in srgb, var(--meal-card-accent) 16%, var(--meal-card-surface));
      color: var(--meal-card-accent);
      font-weight: 900;
    }

    .recipe-tile .thumb {
      width: 100%;
      height: 128px;
      font-size: 44px;
    }

    .note-area {
      display: grid;
      gap: 10px;
    }

    .note-fields {
      display: grid;
      grid-template-columns: minmax(180px, 0.85fr) minmax(220px, 1.15fr);
      gap: 12px;
    }

    .note-fields textarea {
      min-height: 84px;
    }

    .note-editor {
      display: grid;
      gap: 14px;
    }

    .meal-placement-editor {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      padding: 12px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: color-mix(in srgb, var(--meal-card-surface) 94%, var(--primary-background-color, #f6f6f6));
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .chips button {
      min-height: 44px;
      padding: 0 14px;
      font-weight: 750;
    }

    .hero-image {
      max-height: 300px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .stats div {
      padding: 14px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
    }

    .stats strong {
      display: block;
      margin-top: 6px;
      font-size: 20px;
    }

    .cook-section {
      display: grid;
      gap: 12px;
    }

    .cook-section h4 {
      font-size: 22px;
    }

    .cook-section ul,
    .cook-section ol {
      margin: 0;
      padding-left: 28px;
      font-size: 20px;
      line-height: 1.55;
    }

    .cook-section li + li {
      margin-top: 10px;
    }

    .recipe-notes {
      display: grid;
      gap: 10px;
    }

    .recipe-notes article {
      display: grid;
      gap: 6px;
      padding: 12px 14px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: color-mix(in srgb, var(--meal-card-surface) 92%, var(--primary-background-color, #f6f6f6));
    }

    .recipe-notes p {
      font-size: 18px;
      line-height: 1.45;
    }

    .recipe-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .recipe-actions select {
      min-width: 220px;
    }

    .loading {
      min-height: 180px;
      display: grid;
      place-items: center;
      color: var(--meal-card-muted);
      font-size: 20px;
    }

    @media (max-width: 860px) {
      .shell {
        padding: 14px;
      }

      .topbar {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: flex-start;
        margin: -14px -14px 0;
        padding: 18px;
      }

      .hero-icon {
        display: none;
      }

      .top-actions {
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .add-button {
        min-width: 44px;
        width: 44px;
        padding: 0;
      }

      .add-button span {
        display: none;
      }

      .tabs {
        width: 100%;
        grid-template-columns: repeat(3, 1fr);
      }

      .board {
        grid-template-columns: repeat(var(--day-count), minmax(220px, 82vw));
      }

      .field-row,
      .manual-recipe-form,
      .note-fields,
      .recipe-toolbar,
      .recipe-url-row,
      .stats,
      .grocery-layout {
        grid-template-columns: 1fr;
      }

      .time-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;
}

function normalizeRecipeSummary(value: unknown, imageToken?: string): RecipeSummary | undefined {
  const object = unwrapObject(value);
  if (!object) return undefined;
  const name = stringValue(object.name) ?? stringValue(object.recipe_name) ?? stringValue(object.title);
  if (!name) return undefined;
  const slug = stringValue(object.slug) ?? stringValue(object.recipe_slug);
  const id = stringValue(object.id) ?? stringValue(object.recipe_id);
  return {
    id,
    slug,
    name,
    description: stringValue(object.description),
    image: recipeImageUrl(id, object, imageToken),
    raw: object,
  };
}

function isMealPlanItem(value: RecipeSummary | MealPlanItem): value is MealPlanItem {
  return "entryType" in value;
}

function normalizeRecipeDetail(value: unknown, imageToken?: string): RecipeDetail | undefined {
  const object = unwrapObject(value);
  const summary = normalizeRecipeSummary(object, imageToken);
  if (!object || !summary) return undefined;

  return {
    ...summary,
    servings: formatServings(
      object.recipe_servings ?? object.recipeServings ?? object.servings,
      object.recipe_yield ?? object.recipeYield,
    ),
    prepTime: formatDuration(object.prep_time ?? object.prepTime),
    cookTime: formatDuration(object.cook_time ?? object.cookTime),
    totalTime: formatDuration(object.total_time ?? object.totalTime),
    ingredients: normalizeIngredients(object.recipe_ingredient ?? object.ingredients ?? object.recipeIngredient),
    instructions: normalizeInstructions(object.recipe_instructions ?? object.instructions ?? object.recipeInstructions),
    notes: normalizeRecipeNotes(object.notes ?? object.recipe_notes ?? object.recipeNotes),
  };
}

function normalizeMealPlanItem(value: unknown, imageToken?: string, entryTypes: string[] = DEFAULT_ENTRY_TYPES): MealPlanItem | undefined {
  const object = unwrapObject(value);
  if (!object) return undefined;

  const recipe = unwrapObject(object.recipe);
  const date = stringValue(object.date) ?? stringValue(object.mealplan_date) ?? stringValue(object.mealplanDate);
  const entryType = canonicalEntryType(
    stringValue(object.entryType) ?? stringValue(object.entry_type) ?? stringValue(object.mealType) ?? stringValue(object.meal_type) ?? "",
    entryTypes,
  );
  const text = stringValue(object.text) ?? stringValue(object.note);
  const title = stringValue(object.title) || stringValue(recipe?.name) || text || "Meal";
  const slug = stringValue(object.recipeSlug) ?? stringValue(object.recipe_slug) ?? stringValue(recipe?.slug);

  if (!date || !entryType) return undefined;

  return {
    id: object.id as string | number | undefined,
    date: date.slice(0, 10),
    entryType,
    title,
    text,
    recipeId: stringValue(object.recipeId) ?? stringValue(object.recipe_id) ?? stringValue(recipe?.id),
    recipeSlug: slug,
    image: recipeImageUrl(stringValue(object.recipeId) ?? stringValue(object.recipe_id) ?? stringValue(recipe?.id), recipe, imageToken),
    raw: object,
  };
}

function normalizeShoppingListSummary(value: unknown): ShoppingListSummary | undefined {
  const object = unwrapObject(value);
  if (!object) return undefined;
  const id = stringValue(object.id);
  if (!id) return undefined;
  const name = stringValue(object.name) ?? "Grocery List";
  const items = unwrapArray(object.listItems ?? object.list_items);
  return {
    id,
    name,
    itemCount: items.length || undefined,
    raw: object,
  };
}

function normalizeShoppingListDetail(value: unknown): ShoppingListDetail | undefined {
  const summary = normalizeShoppingListSummary(value);
  const object = unwrapObject(value);
  if (!summary || !object) return undefined;
  return {
    ...summary,
    items: unwrapArray(object.listItems ?? object.list_items).map(normalizeShoppingListItem).filter(Boolean) as ShoppingListItem[],
  };
}

function normalizeShoppingListItem(value: unknown): ShoppingListItem | undefined {
  const object = unwrapObject(value);
  if (!object) return undefined;
  const id = stringValue(object.id);
  const shoppingListId = stringValue(object.shoppingListId) ?? stringValue(object.shopping_list_id);
  if (!id || !shoppingListId) return undefined;

  return {
    id,
    shoppingListId,
    title: shoppingItemTitle(object),
    checked: Boolean(object.checked),
    raw: object,
  };
}

function shoppingItemTitle(object: Record<string, unknown>): string {
  const display = stringValue(object.display);
  if (display) return display;

  const quantity = stringValue(object.quantity);
  const unit = stringValue(unwrapObject(object.unit)?.name) ?? stringValue(object.unit);
  const food = stringValue(unwrapObject(object.food)?.name) ?? stringValue(object.food);
  const note = stringValue(object.note);
  return [quantity && quantity !== "0" ? quantity : undefined, unit, food, note].filter(Boolean).join(" ") || "Item";
}

function shoppingItemUpdatePayload(item: ShoppingListItem, checked: boolean): Record<string, unknown> {
  const raw = item.raw;
  return compactObject({
    shoppingListId: item.shoppingListId,
    checked,
    position: raw.position ?? 0,
    quantity: raw.quantity ?? 1,
    food: raw.food,
    unit: raw.unit,
    note: raw.note ?? "",
    display: raw.display ?? item.title,
    foodId: raw.foodId ?? raw.food_id,
    labelId: raw.labelId ?? raw.label_id,
    unitId: raw.unitId ?? raw.unit_id,
    extras: raw.extras ?? {},
    recipeReferences: raw.recipeReferences ?? raw.recipe_references ?? [],
  });
}

function mealPlanUpdatePayload(
  meal: MealPlanItem,
  changes: Partial<Pick<MealPlanItem, "date" | "entryType" | "title" | "text">>,
): Record<string, unknown> {
  const raw = meal.raw;
  const recipeId = meal.recipeId ?? raw.recipeId ?? raw.recipe_id ?? unwrapObject(raw.recipe)?.id;
  return compactObject({
    id: meal.id ?? raw.id,
    groupId: raw.groupId ?? raw.group_id,
    userId: raw.userId ?? raw.user_id,
    date: changes.date ?? meal.date,
    entryType: changes.entryType ?? meal.entryType,
    title: changes.title ?? meal.title,
    text: changes.text ?? meal.text ?? "",
    recipeId: recipeId ?? null,
  }, ["text"]);
}

function manualRecipePayload(form: ManualRecipeForm): Record<string, unknown> & { name: string } {
  const servings = positiveNumber(form.servings);
  const ingredients = textLines(form.ingredients);
  const instructions = textLines(form.instructions);
  const notes = textLines(form.notes);

  return {
    name: form.name.trim(),
    ...compactObject({
      description: form.description.trim(),
      orgURL: form.source.trim(),
      recipeServings: servings,
      recipeYield: servings ? `${servings} servings` : undefined,
      prepTime: timeText(form.prep),
      cookTime: timeText(form.cook),
      totalTime: timeText(form.total),
      recipeIngredient: ingredients.length
        ? ingredients.map((line) => ({
            note: line,
            display: line,
            originalText: line,
          }))
        : undefined,
      recipeInstructions: instructions.length
        ? instructions.map((line) => ({
            title: "",
            summary: "",
            text: line,
            ingredientReferences: [],
          }))
        : undefined,
      notes: notes.length
        ? notes.map((line) => ({
            title: "",
            text: line,
          }))
        : undefined,
      parseIngredients: form.parseIngredients,
      ingredientParser: form.ingredientParser,
    }),
  };
}

function textLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function positiveNumber(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function timeText(value: string): string | undefined {
  const text = value.trim();
  if (!text) return undefined;
  return /^\d+$/.test(text) ? `${text} min` : text;
}

function formatServings(servingsValue: unknown, yieldValue: unknown): string | undefined {
  const servings = stringValue(servingsValue);
  const recipeYield = stringValue(yieldValue);
  if (servings && recipeYield && recipeYield !== servings) {
    return recipeYield.toLocaleLowerCase().includes("serv") ? recipeYield : `${servings} (${recipeYield})`;
  }
  return servings ?? recipeYield;
}

function normalizeIngredients(value: unknown): string[] {
  return unwrapArray(value)
    .map((item) => {
      if (typeof item === "string") return item;
      const object = unwrapObject(item);
      if (!object) return undefined;
      const display = stringValue(object.display);
      if (display) return display;
      const note = stringValue(object.note);
      const food = stringValue(unwrapObject(object.food)?.name) ?? stringValue(object.food);
      const quantity = stringValue(object.quantity);
      const unit = stringValue(unwrapObject(object.unit)?.name) ?? stringValue(object.unit);
      return [quantity && quantity !== "0" ? quantity : undefined, unit, food, note].filter(Boolean).join(" ");
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeInstructions(value: unknown): string[] {
  return unwrapArray(value)
    .flatMap((item) => {
      if (typeof item === "string") return [stripHtml(item)];
      const object = unwrapObject(item);
      const text = stringValue(object?.text) ?? stringValue(object?.instruction) ?? stringValue(object?.summary);
      return text ? [stripHtml(text)] : [];
    })
    .filter(Boolean);
}

function normalizeRecipeNotes(value: unknown): RecipeNoteDetail[] {
  if (typeof value === "string") {
    const text = stripHtml(value);
    return text ? [{ text }] : [];
  }

  return unwrapArray(value)
    .map((item) => {
      if (typeof item === "string") {
        const text = stripHtml(item);
        return text ? { text } : undefined;
      }

      const object = unwrapObject(item);
      if (!object) return undefined;
      const title = stringValue(object.title) ?? stringValue(object.name);
      const text = stringValue(object.text) ?? stringValue(object.note) ?? stringValue(object.summary);
      const cleanText = text ? stripHtml(text) : undefined;
      if (!cleanText && !title) return undefined;
      return {
        title: cleanText ? title : undefined,
        text: cleanText ?? title ?? "",
      };
    })
    .filter((item): item is RecipeNoteDetail => Boolean(item?.text));
}

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const object = unwrapObject(value);
  if (!object) return [];
  const candidates = [object.items, object.data, object.results, object.recipe, object.recipes, object.mealplans, object.mealplan];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function unwrapObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function compactObject(value: Record<string, unknown>, keepEmptyKeys: string[] = []): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([key, item]) => item !== undefined && (item !== "" || keepEmptyKeys.includes(key))),
  );
}

function readDraft(key: string): CardDraft | undefined {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return undefined;
    const parsed = JSON.parse(value);
    return unwrapObject(parsed) as CardDraft | undefined;
  } catch {
    return undefined;
  }
}

function writeDraft(key: string, draft: CardDraft): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Best effort only. The card should keep working if storage is unavailable.
  }
}

function canonicalEntryType(value: string, entryTypes: string[]): string {
  const fallback = value.trim();
  const key = entryTypeKey(fallback);
  const match = entryTypes.find((entryType) => entryTypeKey(entryType) === key);
  return match ?? fallback.toLocaleLowerCase();
}

function entryTypeKey(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[\s_-]+/g, "_");
}

function stringValue(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  return String(value);
}

function recipeImageUrl(recipeId: string | undefined, object: Record<string, unknown> | undefined, imageToken?: string): string | undefined {
  const image = stringValue(object?.image) ?? stringValue(object?.image_url) ?? stringValue(object?.recipe_image);
  if (image && /^https?:\/\//i.test(image)) return image;
  return recipeId && image && imageToken ? `/api/family_mealie/recipe/${encodeURIComponent(recipeId)}/image?token=${encodeURIComponent(imageToken)}` : undefined;
}

function formatDuration(value: unknown): string | undefined {
  const text = stringValue(value);
  if (!text) return undefined;
  if (/^\d+$/.test(text)) return `${text} min`;
  return text.replace(/^PT/i, "").replace(/(\d+)H/i, "$1 hr ").replace(/(\d+)M/i, "$1 min").trim();
}

function stripHtml(value: string): string {
  const element = document.createElement("div");
  element.innerHTML = value;
  return element.textContent?.trim() ?? value;
}

function inputValue(event: Event): string {
  return (event.currentTarget as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date, weekStart: number): Date {
  const start = startOfDay(date);
  const diff = (start.getDay() - weekStart + 7) % 7;
  return addDays(start, -diff);
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function weekStartIndex(value: WeekStart | undefined): number {
  if (typeof value === "number" && Number.isInteger(value)) return ((value % 7) + 7) % 7;
  const normalized = String(value ?? "sunday").trim().toLocaleLowerCase();
  const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const shortNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const index = names.indexOf(normalized);
  if (index >= 0) return index;
  const shortIndex = shortNames.indexOf(normalized);
  return shortIndex >= 0 ? shortIndex : 0;
}

function titleCase(value: string): string {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String((error as { message: unknown }).message);
  return fallback;
}

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }

  interface HTMLElementTagNameMap {
    "family-mealie-planner-card": FamilyMealiePlannerCard;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "family-mealie-planner-card",
  name: "Family Mealie Planner",
  description: "Kitchen-tablet meal planning for Mealie through a Home Assistant backend bridge.",
});
