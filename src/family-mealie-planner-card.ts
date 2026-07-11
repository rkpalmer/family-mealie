import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

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
  parseIngredients: boolean;
  ingredientParser: IngredientParser;
}

type MainView = "planner" | "recipes" | "groceries";
type RecipeCreateMode = "url" | "manual";
type IngredientParser = "auto" | "openai" | "nlp" | "brute";
type WeekStart = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | number;

const DEFAULT_ENTRY_TYPES = ["breakfast", "lunch", "dinner"];
const QUICK_NOTES = ["Leftovers:", "Eat Out:", "Freezer Meal:", "Kids:"];

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
  @state() private draggingMealId?: string;
  @state() private selectedRecipeForDialog?: RecipeSummary;
  @state() private recipeDetail?: RecipeDetail;
  @state() private recipeLoading = false;
  @state() private search = "";
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
  @state() private manualParseIngredients = true;
  @state() private recipeSaving = false;
  @state() private recipeMessage?: string;
  @state() private groceryText = "";
  @state() private newListName = "";

  private refreshTimer?: number;

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
    this.restartRefreshTimer();
  }

  public disconnectedCallback(): void {
    window.clearInterval(this.refreshTimer);
    super.disconnectedCallback();
  }

  protected firstUpdated(): void {
    void this.refreshAll();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass && this.recipes.length === 0 && this.mealPlan.length === 0) {
      void this.refreshAll();
    }

    if (changed.has("addDialogOpen") || changed.has("recipeDialogOpen")) {
      this.syncNativeDialogs();
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
            <div>
              <h2>${this.config.title}</h2>
              <p>${this.subtitle()}</p>
            </div>
            <div class="top-actions">
              ${this.view === "planner"
                ? html`<button class="secondary action" @click=${this.openDefaultAddDialog}>Add meal</button>`
                : nothing}
              <button class="primary action" title="Refresh" @click=${this.refreshAll} ?disabled=${this.loading}>
                ${this.loading ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </header>

          <nav class="tabs">
            ${this.renderTab("planner", "Planner")}
            ${this.renderTab("recipes", "Recipes")}
            ${this.renderTab("groceries", "Groceries")}
          </nav>

          ${this.error ? html`<div class="notice">${this.error}</div>` : nothing}
          ${this.view === "planner" ? this.renderPlanner() : nothing}
          ${this.view === "recipes" ? this.renderRecipes() : nothing}
          ${this.view === "groceries" ? this.renderGroceries() : nothing}
        </section>
      </ha-card>

      ${this.renderAddDialog()} ${this.renderRecipeDialog()}
    `;
  }

  private renderTab(view: MainView, label: string) {
    return html`
      <button class=${this.view === view ? "active" : ""} @click=${() => this.openView(view)}>
        ${label}
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
      <article class="day" @dragover=${this.onPlannerDragOver} @drop=${(event: DragEvent) => this.dropMeal(event, date)}>
        <div class="day-head">
          <span>${this.formatWeekday(day)}</span>
          <strong>${this.formatMonthDay(day)}</strong>
        </div>
        ${this.draggingMealId ? this.renderDropTargets(date) : nothing}
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
      <section class="meal-section" @dragover=${this.onPlannerDragOver} @drop=${(event: DragEvent) => this.dropMeal(event, date, entryType)}>
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
        class=${this.draggingMealId === String(meal.id) ? "meal-pill dragging" : "meal-pill"}
        draggable=${meal.id ? "true" : "false"}
        @dragstart=${(event: DragEvent) => this.startMealDrag(event, meal)}
        @dragend=${this.endMealDrag}
        @click=${() => this.openMealDialog(meal)}
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
            @input=${(event: InputEvent) => (this.search = inputValue(event))}
          />
        </label>
        <button class="secondary" @click=${this.toggleRecipeCreate}>
          ${this.recipeCreateOpen ? "Hide add recipe" : "Add recipe"}
        </button>
      </div>

      ${this.recipeCreateOpen
        ? html`
            <section class="recipe-create-panel">
              <header>
                <h3>Add recipe</h3>
                <div class="mode-tabs">
                  <button class=${this.recipeCreateMode === "url" ? "active" : ""} @click=${() => (this.recipeCreateMode = "url")}>
                    Import URL
                  </button>
                  <button class=${this.recipeCreateMode === "manual" ? "active" : ""} @click=${() => (this.recipeCreateMode = "manual")}>
                    Manual
                  </button>
                </div>
              </header>
              ${this.recipeMessage ? html`<div class="success">${this.recipeMessage}</div>` : nothing}
              ${this.recipeCreateMode === "url" ? this.renderRecipeUrlCreate() : this.renderRecipeManualCreate()}
            </section>
          `
        : this.recipeMessage
          ? html`<div class="success compact">${this.recipeMessage}</div>`
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
          ${this.recipeSaving ? "Importing" : "Import"}
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
            ${this.recipeSaving ? "Saving" : "Save recipe"}
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
            <button class="small" @click=${this.createShoppingList} ?disabled=${!this.newListName.trim()}>Create</button>
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
                  <button class="plain" @click=${() => this.selectedShoppingListId && this.loadShoppingList(this.selectedShoppingListId)}>
                    Refresh
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
                  <button class="primary" @click=${this.addShoppingItem} ?disabled=${!this.groceryText.trim()}>Add</button>
                </div>
                <div class="grocery-items">
                  ${this.selectedShoppingList.items.map((item) => this.renderShoppingItem(item))}
                </div>
              `
            : html`<div class="empty-panel">Create or choose a grocery list.</div>`}
        </section>
      </section>
    `;
  }

  private renderShoppingItem(item: ShoppingListItem) {
    return html`
      <label class="grocery-item">
        <input
          type="checkbox"
          .checked=${item.checked}
          @change=${(event: Event) => this.toggleShoppingItem(item, (event.currentTarget as HTMLInputElement).checked)}
        />
        <span>${item.title}</span>
        <button class="delete-inline" @click=${(event: Event) => this.deleteShoppingItem(event, item)}>Remove</button>
      </label>
    `;
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
              <select .value=${this.selectedSlot.entryType} @change=${this.onEntryTypeInput}>
                ${this.entryTypes().map((type) => html`<option .value=${type}>${titleCase(type)}</option>`)}
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
            <input
              type="text"
              placeholder="Custom note"
              .value=${this.noteText}
              @input=${(event: InputEvent) => {
                this.noteText = inputValue(event);
                if (this.noteText) this.selectedRecipe = undefined;
              }}
            />
          </div>

          <footer>
            <button type="button" class="primary" @click=${this.addMeal} ?disabled=${!this.selectedRecipe && !this.noteText.trim()}>
              Add to plan
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
                  ${this.stat("Servings", detail?.servings)}
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
              `}
            `}

          <footer class="recipe-actions">
            ${isNoteMeal
              ? html`
                  <button class="primary" @click=${this.saveNoteMeal} ?disabled=${this.mealSaving || !this.noteEditTitle.trim()}>
                    ${this.mealSaving ? "Saving" : "Save note"}
                  </button>
                `
              : nothing}
            ${this.selectedMeal && !isNoteMeal
              ? html`
                  <button class="primary" @click=${this.saveMealPlacement} ?disabled=${this.mealSaving || !this.mealPlacementChanged()}>
                    ${this.mealSaving ? "Saving" : "Save changes"}
                  </button>
                `
              : nothing}
            ${!isNoteMeal && detail?.id && this.shoppingLists.length
              ? html`
                  <select .value=${this.selectedShoppingListId ?? ""} @change=${(event: Event) => this.selectShoppingList(inputValue(event))}>
                    ${this.shoppingLists.map((list) => html`<option .value=${list.id}>${list.name}</option>`)}
                  </select>
                  <button class="primary" @click=${() => detail?.id && this.addRecipeToGroceries(detail.id)}>
                    Add ingredients
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
          <select .value=${this.mealEditEntryType} @change=${this.onMealEditEntryTypeInput}>
            ${this.entryTypes().map((type) => html`<option .value=${type}>${titleCase(type)}</option>`)}
          </select>
        </label>
      </section>
    `;
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
    this.mealPlan = unwrapArray(response).map((item) => normalizeMealPlanItem(item, this.imageToken)).filter(Boolean) as MealPlanItem[];
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
    const note = this.noteText.trim();
    const payload: Record<string, unknown> = {
      date: this.selectedSlot.date,
      entryType: this.selectedSlot.entryType,
      title: "",
      text: "",
    };

    if (recipe?.id) {
      payload.recipeId = recipe.id;
    } else if (note) {
      payload.title = note;
      payload.text = note;
    }

    try {
      await this.callFamilyMealie("family_mealie/mealplans/create", { payload });
      this.closeAddDialog();
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
    const text = this.noteEditText.trim() || title;
    const payload = mealPlanUpdatePayload(meal, {
      date: this.mealEditDate || meal.date,
      entryType: this.mealEditEntryType || meal.entryType,
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
    this.manualParseIngredients = true;
  }

  private toggleRecipeCreate = (): void => {
    this.recipeCreateOpen = !this.recipeCreateOpen;
    if (this.recipeCreateOpen) this.recipeMessage = undefined;
  };

  private openAddDialog(slot: SlotContext): void {
    this.selectedSlot = slot;
    this.selectedRecipe = undefined;
    this.search = "";
    this.noteText = "";
    this.addDialogOpen = true;
  }

  private openDefaultAddDialog = (): void => {
    const firstDay = this.daysToShow()[0] ?? startOfDay(new Date());
    const entryType = this.entryTypes()[0] ?? DEFAULT_ENTRY_TYPES[0];
    this.openAddDialog({ date: toDateString(firstDay), entryType });
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
    this.noteEditText = meal.text ?? meal.title;
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
    this.noteText = "";
  }

  private chooseNote(note: string): void {
    this.noteText = note;
    this.selectedRecipe = undefined;
  }

  private onDateInput(event: InputEvent): void {
    if (!this.selectedSlot) return;
    this.selectedSlot = { ...this.selectedSlot, date: inputValue(event) };
  }

  private onEntryTypeInput(event: InputEvent): void {
    if (!this.selectedSlot) return;
    this.selectedSlot = { ...this.selectedSlot, entryType: inputValue(event) };
  }

  private onMealEditDateInput = (event: InputEvent): void => {
    this.mealEditDate = inputValue(event);
  };

  private onMealEditEntryTypeInput = (event: InputEvent): void => {
    this.mealEditEntryType = inputValue(event);
  };

  private mealPlacementChanged(): boolean {
    const meal = this.selectedMeal;
    if (!meal) return false;
    return this.mealEditDate !== meal.date || this.mealEditEntryType !== meal.entryType;
  }

  private startMealDrag(event: DragEvent, meal: MealPlanItem): void {
    if (!meal.id) return;
    this.draggingMealId = String(meal.id);
    event.dataTransfer?.setData("text/plain", String(meal.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  }

  private endMealDrag = (): void => {
    this.draggingMealId = undefined;
  };

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
    this.draggingMealId = undefined;
    if (!meal) return;

    await this.moveMeal(meal, date, entryType ?? meal.entryType);
  }

  private async moveMeal(meal: MealPlanItem, date: string, entryType: string, closeDialog = false): Promise<void> {
    if (!meal.id || !date || !entryType) return;
    if (meal.date === date && meal.entryType === entryType) return;

    const payload = mealPlanUpdatePayload(meal, { date, entryType });
    this.mealSaving = true;
    try {
      await this.callFamilyMealie("family_mealie/mealplans/update", { meal_id: meal.id, payload });
      this.selectedMeal = this.selectedMeal?.id === meal.id ? { ...meal, date, entryType, raw: { ...meal.raw, ...payload } } : this.selectedMeal;
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
    return this.mealPlan.filter((meal) => meal.date === date && meal.entryType.toLocaleLowerCase() === entryType.toLocaleLowerCase());
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
    return this.config.entry_types?.length ? this.config.entry_types : DEFAULT_ENTRY_TYPES;
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

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color);
      --meal-card-radius: 8px;
      --meal-card-touch: 52px;
      --meal-card-surface: var(--card-background-color, #fff);
      --meal-card-muted: var(--secondary-text-color, #6b7280);
      --meal-card-line: var(--divider-color, rgba(0, 0, 0, 0.12));
      --meal-card-accent: var(--primary-color, #4f7f68);
      --meal-card-warning: var(--error-color, #b3261e);
    }

    ha-card {
      overflow: hidden;
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

    h2,
    h3,
    h4,
    p {
      margin: 0;
    }

    h2 {
      font-size: 28px;
      line-height: 1.1;
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

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    button {
      min-height: var(--meal-card-touch);
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      cursor: pointer;
    }

    button:disabled {
      cursor: progress;
      opacity: 0.65;
    }

    .primary {
      border-color: transparent;
      background: var(--meal-card-accent);
      color: var(--text-primary-color, #fff);
      font-weight: 800;
      padding: 0 18px;
    }

    .secondary {
      border-color: color-mix(in srgb, var(--meal-card-accent) 30%, var(--meal-card-line));
      background: color-mix(in srgb, var(--meal-card-accent) 10%, var(--meal-card-surface));
      color: var(--meal-card-accent);
      font-weight: 800;
      padding: 0 18px;
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
      border-radius: var(--meal-card-radius);
      background: color-mix(in srgb, var(--primary-background-color, #f6f6f6) 72%, var(--meal-card-surface));
    }

    .tabs button {
      min-height: 44px;
      border: 0;
      font-weight: 800;
      background: transparent;
    }

    .tabs button.active {
      background: var(--meal-card-surface);
      box-shadow: var(--ha-card-box-shadow, 0 1px 4px rgba(0, 0, 0, 0.16));
    }

    .notice {
      margin-top: 16px;
      padding: 12px 14px;
      border: 1px solid color-mix(in srgb, var(--meal-card-warning) 35%, transparent);
      border-radius: var(--meal-card-radius);
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
      border-radius: var(--meal-card-radius);
      background: color-mix(in srgb, var(--meal-card-surface) 90%, var(--primary-background-color, #f6f6f6));
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(86px, 1fr));
      gap: 8px;
      padding: 10px 12px 4px;
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
      border-radius: var(--meal-card-radius);
      background: var(--meal-card-surface);
      text-align: left;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
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
      border-radius: var(--meal-card-radius);
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
      min-height: 40px;
      border: 0;
      padding: 0 12px;
      background: transparent;
      font-weight: 800;
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
      border-radius: var(--meal-card-radius);
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
      grid-template-columns: 32px 1fr auto;
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
      border-radius: var(--meal-card-radius);
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
      border-radius: var(--meal-card-radius);
      padding: 0 14px;
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
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
        align-items: flex-start;
      }

      .top-actions {
        flex-wrap: wrap;
        justify-content: flex-end;
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
    servings: stringValue(object.recipe_yield) ?? stringValue(object.servings) ?? stringValue(object.recipeYield),
    prepTime: formatDuration(object.prep_time ?? object.prepTime),
    cookTime: formatDuration(object.cook_time ?? object.cookTime),
    totalTime: formatDuration(object.total_time ?? object.totalTime),
    ingredients: normalizeIngredients(object.recipe_ingredient ?? object.ingredients ?? object.recipeIngredient),
    instructions: normalizeInstructions(object.recipe_instructions ?? object.instructions ?? object.recipeInstructions),
  };
}

function normalizeMealPlanItem(value: unknown, imageToken?: string): MealPlanItem | undefined {
  const object = unwrapObject(value);
  if (!object) return undefined;

  const recipe = unwrapObject(object.recipe);
  const date = stringValue(object.date) ?? stringValue(object.mealplan_date) ?? stringValue(object.mealplanDate);
  const entryType = stringValue(object.entryType) ?? stringValue(object.entry_type) ?? stringValue(object.mealType) ?? stringValue(object.meal_type);
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
    text: changes.text ?? meal.text ?? meal.title,
    recipeId: recipeId ?? null,
  });
}

function manualRecipePayload(form: ManualRecipeForm): Record<string, unknown> & { name: string } {
  const servings = positiveNumber(form.servings);
  const ingredients = textLines(form.ingredients);
  const instructions = textLines(form.instructions);

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

function compactObject(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== ""));
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
