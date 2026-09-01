import { DomainError } from "../domain/errors.js";
import type { HostState, Menu } from "../domain/types.js";
import { assertMenuSatisfiesConstraints, validateMenu } from "../domain/validation.js";
import type { MenuProposalAdapter } from "../tools/types.js";

function scaleMenu(template: Menu, guestCount: number): Menu {
  const scaled = structuredClone(template);
  scaled.id = `${template.id}-g${guestCount}`;
  scaled.name = `${template.name} — ${guestCount} guests`;
  for (const item of scaled.items) {
    const baseServings = item.servings;
    const ratio = guestCount / baseServings;
    item.servings = guestCount;
    for (const ingredient of item.ingredients) {
      ingredient.quantity = Number((ingredient.quantity * ratio).toFixed(2));
    }
  }
  validateMenu(scaled);
  return scaled;
}

export class StaticMenuProposalAdapter implements MenuProposalAdapter {
  constructor(private readonly templates: Menu[]) {
    for (const template of templates) validateMenu(template);
  }

  async proposeMenus(state: HostState, maxOptions: number): Promise<Menu[]> {
    const compatible: Menu[] = [];
    for (const template of this.templates) {
      const scaled = scaleMenu(template, state.event.guestCount);
      try {
        assertMenuSatisfiesConstraints(scaled, state.event.constraints);
        compatible.push(scaled);
      } catch (error) {
        if (!(error instanceof DomainError) || error.code !== "MENU_CONSTRAINT_CONFLICT") throw error;
      }
      if (compatible.length >= maxOptions) break;
    }
    return compatible;
  }
}

export const DEMO_MENU_TEMPLATES: Menu[] = [
  {
    id: "mediterranean-table",
    name: "Mediterranean Table",
    items: [
      {
        id: "tomato-herb-pasta",
        name: "Tomato herb pasta",
        servings: 6,
        estimatedPrepMinutes: 20,
        estimatedCookMinutes: 25,
        constraintTags: ["vegetarian", "nut-free"],
        ingredients: [
          { itemId: "pasta", name: "Pasta", quantity: 600, unit: "g" },
          { itemId: "tomatoes", name: "Tomatoes", quantity: 1200, unit: "g" },
          { itemId: "onion", name: "Onion", quantity: 2, unit: "each" },
          { itemId: "basil", name: "Fresh basil", quantity: 1, unit: "pack" },
        ],
        taskTemplates: [
          { id: "med-make-sauce", title: "Make tomato herb sauce", category: "cook", durationMinutes: 25, dependencies: [], dueOffsetMinutes: 50 },
          { id: "med-boil-pasta", title: "Cook pasta", category: "cook", durationMinutes: 15, dependencies: ["med-make-sauce"], dueOffsetMinutes: 25 },
        ],
      },
      {
        id: "lemon-salad",
        name: "Lemon garden salad",
        servings: 6,
        estimatedPrepMinutes: 12,
        estimatedCookMinutes: 0,
        constraintTags: ["vegan", "nut-free"],
        ingredients: [
          { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each" },
          { itemId: "cucumber", name: "Cucumber", quantity: 1, unit: "each" },
          { itemId: "lemon", name: "Lemon", quantity: 2, unit: "each" },
        ],
        taskTemplates: [
          { id: "med-prep-salad", title: "Prepare lemon garden salad", category: "prep", durationMinutes: 12, dependencies: [], dueOffsetMinutes: 20 },
        ],
      },
      {
        id: "berry-oat-dessert",
        name: "Berry oat dessert",
        servings: 6,
        estimatedPrepMinutes: 15,
        estimatedCookMinutes: 0,
        constraintTags: ["vegan", "nut-free"],
        ingredients: [
          { itemId: "berries", name: "Berries", quantity: 600, unit: "g" },
          { itemId: "oat-yogurt", name: "Oat yogurt", quantity: 450, unit: "g" },
        ],
        taskTemplates: [
          { id: "med-prep-dessert", title: "Assemble berry oat dessert", category: "prep", durationMinutes: 15, dependencies: [], dueOffsetMinutes: 75 },
        ],
      },
    ],
  },
  {
    id: "taco-table",
    name: "Build-Your-Own Taco Table",
    items: [
      {
        id: "bean-taco-filling",
        name: "Smoky bean taco filling",
        servings: 6,
        estimatedPrepMinutes: 15,
        estimatedCookMinutes: 25,
        constraintTags: ["vegan", "vegetarian", "nut-free"],
        ingredients: [
          { itemId: "black-beans", name: "Black beans", quantity: 1200, unit: "g" },
          { itemId: "tortillas", name: "Tortillas", quantity: 18, unit: "each" },
          { itemId: "peppers", name: "Peppers", quantity: 3, unit: "each" },
          { itemId: "onion", name: "Onion", quantity: 2, unit: "each" },
        ],
        taskTemplates: [
          { id: "taco-chop", title: "Chop taco vegetables", category: "prep", durationMinutes: 12, dependencies: [], dueOffsetMinutes: 55 },
          { id: "taco-cook", title: "Cook smoky bean filling", category: "cook", durationMinutes: 25, dependencies: ["taco-chop"], dueOffsetMinutes: 25 },
        ],
      },
      {
        id: "taco-toppings",
        name: "Fresh taco toppings",
        servings: 6,
        estimatedPrepMinutes: 15,
        estimatedCookMinutes: 0,
        constraintTags: ["vegan", "vegetarian", "nut-free"],
        ingredients: [
          { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each" },
          { itemId: "tomatoes", name: "Tomatoes", quantity: 600, unit: "g" },
          { itemId: "lime", name: "Lime", quantity: 3, unit: "each" },
        ],
        taskTemplates: [
          { id: "taco-toppings-prep", title: "Prepare taco toppings", category: "prep", durationMinutes: 15, dependencies: [], dueOffsetMinutes: 20 },
        ],
      },
    ],
  },
  {
    id: "curry-supper",
    name: "Coconut Curry Supper",
    items: [
      {
        id: "chickpea-curry",
        name: "Coconut chickpea curry",
        servings: 6,
        estimatedPrepMinutes: 18,
        estimatedCookMinutes: 35,
        constraintTags: ["vegan", "vegetarian", "nut-free"],
        ingredients: [
          { itemId: "chickpeas", name: "Chickpeas", quantity: 1200, unit: "g" },
          { itemId: "coconut-milk", name: "Coconut milk", quantity: 800, unit: "ml" },
          { itemId: "tomatoes", name: "Tomatoes", quantity: 800, unit: "g" },
          { itemId: "onion", name: "Onion", quantity: 2, unit: "each" },
        ],
        taskTemplates: [
          { id: "curry-prep", title: "Prepare curry ingredients", category: "prep", durationMinutes: 18, dependencies: [], dueOffsetMinutes: 70 },
          { id: "curry-cook", title: "Cook coconut chickpea curry", category: "cook", durationMinutes: 35, dependencies: ["curry-prep"], dueOffsetMinutes: 30 },
        ],
      },
      {
        id: "rice",
        name: "Steamed rice",
        servings: 6,
        estimatedPrepMinutes: 5,
        estimatedCookMinutes: 20,
        constraintTags: ["vegan", "vegetarian", "nut-free"],
        ingredients: [
          { itemId: "rice", name: "Rice", quantity: 450, unit: "g" },
        ],
        taskTemplates: [
          { id: "curry-rice", title: "Cook rice", category: "cook", durationMinutes: 20, dependencies: [], dueOffsetMinutes: 22 },
        ],
      },
      {
        id: "cucumber-salad",
        name: "Cucumber lime salad",
        servings: 6,
        estimatedPrepMinutes: 10,
        estimatedCookMinutes: 0,
        constraintTags: ["vegan", "vegetarian", "nut-free"],
        ingredients: [
          { itemId: "cucumber", name: "Cucumber", quantity: 2, unit: "each" },
          { itemId: "lime", name: "Lime", quantity: 2, unit: "each" },
        ],
        taskTemplates: [
          { id: "curry-salad", title: "Prepare cucumber lime salad", category: "prep", durationMinutes: 10, dependencies: [], dueOffsetMinutes: 18 },
        ],
      },
    ],
  },
];

export function createDefaultMenuProposalAdapter(): StaticMenuProposalAdapter {
  return new StaticMenuProposalAdapter(DEMO_MENU_TEMPLATES);
}
