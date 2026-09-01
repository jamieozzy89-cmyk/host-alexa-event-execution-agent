export const nutAllergy = {
  id: "allergen-nuts",
  type: "allergen",
  value: "nuts",
  scope: "all guests",
  source: "user",
  confirmed: true,
};

export const vegetarian = {
  id: "diet-vegetarian",
  type: "dietary",
  value: "one vegetarian guest",
  scope: "guest",
  source: "user",
  confirmed: true,
};

export const vegan = {
  id: "diet-vegan",
  type: "dietary",
  value: "one vegan guest",
  scope: "guest",
  source: "user",
  confirmed: true,
};

export const baseMenu = {
  id: "menu-six",
  name: "Saturday Dinner",
  items: [
    {
      id: "tomato-pasta",
      name: "Tomato pasta",
      servings: 6,
      estimatedPrepMinutes: 20,
      estimatedCookMinutes: 25,
      constraintTags: ["vegetarian", "nut-free"],
      ingredients: [
        { itemId: "pasta", name: "Pasta", quantity: 600, unit: "g" },
        { itemId: "tomatoes", name: "Tomatoes", quantity: 1200, unit: "g" },
        { itemId: "onion", name: "Onion", quantity: 2, unit: "each" },
      ],
      taskTemplates: [
        {
          id: "make-sauce",
          title: "Make tomato sauce",
          category: "cook",
          durationMinutes: 25,
          dependencies: [],
          dueOffsetMinutes: 45,
        },
        {
          id: "boil-pasta",
          title: "Boil pasta",
          category: "cook",
          durationMinutes: 15,
          dependencies: ["make-sauce"],
          dueOffsetMinutes: 20,
        },
      ],
    },
    {
      id: "salad",
      name: "Green salad",
      servings: 6,
      estimatedPrepMinutes: 10,
      estimatedCookMinutes: 0,
      constraintTags: ["vegan", "nut-free"],
      ingredients: [
        { itemId: "lettuce", name: "Lettuce", quantity: 1, unit: "each" },
        { itemId: "tomatoes", name: "Tomatoes", quantity: 300, unit: "g" },
      ],
      taskTemplates: [
        {
          id: "prep-salad",
          title: "Prepare salad",
          category: "prep",
          durationMinutes: 10,
          dependencies: [],
          dueOffsetMinutes: 15,
        },
      ],
    },
  ],
};

const adjustedBaseItems = structuredClone(baseMenu.items);
adjustedBaseItems[0].servings = 7;
adjustedBaseItems[0].ingredients.find((item) => item.itemId === "pasta").quantity = 700;
adjustedBaseItems[0].ingredients.find((item) => item.itemId === "tomatoes").quantity = 1400;
adjustedBaseItems[0].ingredients.find((item) => item.itemId === "onion").quantity = 3;
adjustedBaseItems[1].servings = 7;
adjustedBaseItems[1].ingredients.find((item) => item.itemId === "tomatoes").quantity = 350;

export const veganAdjustedMenu = {
  id: "menu-seven-vegan",
  name: "Saturday Dinner — Vegan Adjusted",
  items: [
    ...adjustedBaseItems,
    {
      id: "vegan-dessert",
      name: "Vegan berry dessert",
      servings: 7,
      estimatedPrepMinutes: 15,
      estimatedCookMinutes: 0,
      constraintTags: ["vegan", "nut-free"],
      ingredients: [
        { itemId: "berries", name: "Berries", quantity: 700, unit: "g" },
        { itemId: "oat-yogurt", name: "Oat yogurt", quantity: 500, unit: "g" },
      ],
      taskTemplates: [
        {
          id: "prep-vegan-dessert",
          title: "Prepare vegan dessert",
          category: "prep",
          durationMinutes: 15,
          dependencies: [],
          dueOffsetMinutes: 60,
        },
      ],
    },
  ],
};
