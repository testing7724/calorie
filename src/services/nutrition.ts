/**
 * Represents a food item with its name and quantity.
 */
export interface FoodItem {
  /**
   * The name of the food item.
   */
  name: string;
  /**
   * The quantity of the food item (e.g., number of pieces, grams).
   */
  quantity: number;
}

/**
 * Represents nutritional information for a food item, including calories.
 */
export interface Nutrition {
  /**
   * The number of calories in the specified quantity of the food item.
   */
  calories: number;
}

/**
 * Asynchronously retrieves nutrition information (including calories) for a given food item and quantity.
 *
 * @param foodItem The food item and quantity for which to retrieve nutrition data.
 * @returns A promise that resolves to a Nutrition object containing calorie information.
 */
export async function getNutrition(foodItem: FoodItem): Promise<Nutrition> {
  // TODO: Implement this by calling an external nutrition API.

  return {
    calories: 250,
  };
}
