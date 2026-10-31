const KEY = 'sfrecipes:recipes';

export const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'];

export const STARTER_RECIPES = [
  {
    id: 'r1',
    name: 'Firehouse Pancakes',
    category: 'Breakfast',
    time: 20,
    servings: 4,
    ingredients: [
      '2 cups all-purpose flour',
      '2 tbsp sugar',
      '2 tsp baking powder',
      '1/2 tsp baking soda',
      '1/2 tsp salt',
      '2 cups buttermilk',
      '2 large eggs',
      '3 tbsp melted butter, plus more for the pan',
    ],
    steps: [
      'Whisk the flour, sugar, baking powder, baking soda, and salt together in a large bowl.',
      'In a separate bowl, whisk the buttermilk, eggs, and melted butter until smooth.',
      'Pour the wet mix into the dry mix and stir until just combined — a few lumps are fine.',
      'Heat a buttered skillet over medium heat. Pour 1/4 cup batter per pancake.',
      'Cook 2-3 minutes until bubbles form on top, then flip and cook 1-2 minutes more until golden.',
      'Serve hot with maple syrup and your favorite toppings.',
    ],
    favorite: false,
  },
  {
    id: 'r2',
    name: 'Smoky Chicken Quesadilla',
    category: 'Lunch',
    time: 25,
    servings: 2,
    ingredients: [
      '2 cups cooked shredded chicken',
      '1 tsp smoked paprika',
      '1/2 tsp cumin',
      '2 large flour tortillas',
      '1 1/2 cups shredded Monterey Jack cheese',
      '1/2 cup diced bell pepper',
      '2 tbsp olive oil',
      'Salsa and sour cream, to serve',
    ],
    steps: [
      'Toss the shredded chicken with smoked paprika, cumin, and a pinch of salt.',
      'Heat 1 tbsp olive oil in a skillet over medium heat.',
      'Lay one tortilla in the skillet; spread half the chicken, peppers, and cheese over one half.',
      'Fold the tortilla in half and cook 3-4 minutes per side until golden and melty.',
      'Repeat with the second tortilla and remaining filling.',
      'Cut into wedges and serve with salsa and sour cream.',
    ],
    favorite: false,
  },
  {
    id: 'r3',
    name: 'One-Pan Garlic Butter Pasta',
    category: 'Dinner',
    time: 30,
    servings: 4,
    ingredients: [
      '12 oz spaghetti',
      '5 cloves garlic, thinly sliced',
      '4 tbsp butter',
      '2 tbsp olive oil',
      '1/2 tsp red pepper flakes',
      '1/2 cup grated Parmesan, plus more to serve',
      'Salt and black pepper to taste',
      'Fresh parsley, chopped (optional)',
    ],
    steps: [
      'Cook the spaghetti in salted boiling water until al dente. Reserve 1 cup of pasta water before draining.',
      'In a large pan, heat the olive oil and butter over medium heat. Add the sliced garlic and red pepper flakes; cook 2 minutes until fragrant but not browned.',
      'Add the drained pasta to the pan with 1/2 cup of the reserved pasta water; toss to coat.',
      'Stir in the Parmesan until a silky sauce forms, adding more pasta water as needed.',
      'Season with salt and black pepper. Top with parsley and extra Parmesan and serve.',
    ],
    favorite: false,
  },
  {
    id: 'r4',
    name: 'Midnight Chocolate Mug Cake',
    category: 'Dessert',
    time: 10,
    servings: 1,
    ingredients: [
      '4 tbsp all-purpose flour',
      '2 tbsp cocoa powder',
      '2 tbsp sugar',
      '1/4 tsp baking powder',
      '3 tbsp milk',
      '2 tbsp vegetable oil',
      '1/2 tsp vanilla extract',
      'Chocolate chips or a scoop of ice cream, to serve',
    ],
    steps: [
      'In a microwave-safe mug, whisk the flour, cocoa powder, sugar, and baking powder.',
      'Add the milk, oil, and vanilla; stir until you have a smooth batter with no dry pockets.',
      'Microwave on high for 70-90 seconds, until the top looks set but the center is still slightly soft.',
      'Let it rest 1 minute — it finishes cooking as it cools.',
      'Top with chocolate chips or ice cream and eat straight from the mug.',
    ],
    favorite: false,
  },
  {
    id: 'r5',
    name: 'Loaded Studio Nachos',
    category: 'Snacks',
    time: 15,
    servings: 4,
    ingredients: [
      '1 large bag tortilla chips',
      '2 cups shredded cheddar cheese',
      '1 cup black beans, rinsed',
      '1/2 cup diced tomatoes',
      '1/4 cup sliced jalapeños',
      '1/4 cup diced red onion',
      'Guacamole and sour cream, to serve',
    ],
    steps: [
      'Preheat the oven to 425°F (220°C). Line a large baking sheet with parchment.',
      'Spread half the chips on the sheet; top with half the cheese, beans, tomatoes, jalapeños, and onion.',
      'Add the remaining chips and top with the rest of the cheese and toppings.',
      'Bake 8-10 minutes until the cheese is melted and bubbly.',
      'Dollop with guacamole and sour cream and serve immediately.',
    ],
    favorite: false,
  },
  {
    id: 'r6',
    name: 'Honey Sriracha Wings',
    category: 'Dinner',
    time: 45,
    servings: 4,
    ingredients: [
      '2 lbs chicken wings, split and patted dry',
      '1 tbsp baking powder',
      '1 tsp salt',
      '1/2 tsp black pepper',
      '1/3 cup honey',
      '3 tbsp sriracha',
      '2 tbsp butter, melted',
      'Sesame seeds and sliced green onions, to garnish',
    ],
    steps: [
      'Preheat the oven to 450°F (230°C). Set a wire rack over a lined baking sheet.',
      'Toss the wings with baking powder, salt, and pepper until evenly coated.',
      'Arrange on the rack without crowding; bake 40-45 minutes, flipping once, until crisp and golden.',
      'Meanwhile, warm the honey, sriracha, and melted butter together in a small saucepan.',
      'Toss the hot wings in the glaze until well coated.',
      'Garnish with sesame seeds and green onions and serve hot.',
    ],
    favorite: false,
  },
];

export function getRecipes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  saveRecipes(STARTER_RECIPES);
  return [...STARTER_RECIPES];
}

export function saveRecipes(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {}
}

export function addRecipe(r) {
  const list = getRecipes();
  const recipe = { ...r, id: String(Date.now()), favorite: false };
  list.unshift(recipe);
  saveRecipes(list);
  return recipe;
}

export function updateRecipe(id, patch) {
  const list = getRecipes().map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveRecipes(list);
  return list;
}

export function deleteRecipe(id) {
  const list = getRecipes().filter((r) => r.id !== id);
  saveRecipes(list);
  return list;
}

export function toggleFavorite(id) {
  const list = getRecipes().map((r) =>
    r.id === id ? { ...r, favorite: !r.favorite } : r
  );
  saveRecipes(list);
  return list;
}
