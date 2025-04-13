'use server';
/**
 * @fileOverview Estimates the calorie count for a list of identified food items.
 *
 * - estimateCalorieCount - A function that estimates the calorie count for a list of identified food items.
 * - EstimateCalorieCountInput - The input type for the estimateCalorieCount function.
 * - EstimateCalorieCountOutput - The return type for the estimateCalorieCount function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {FoodItem, getNutrition, Nutrition} from '@/services/nutrition';

const EstimateCalorieCountInputSchema = z.array(z.object({
  name: z.string().describe('The name of the food item.'),
  quantity: z.number().describe('The quantity of the food item (e.g., number of pieces, grams).'),
})).describe('A list of identified food items with their quantities.');

export type EstimateCalorieCountInput = z.infer<typeof EstimateCalorieCountInputSchema>;

const EstimateCalorieCountOutputSchema = z.array(z.object({
  name: z.string().describe('The name of the food item.'),
  quantity: z.number().describe('The quantity of the food item (e.g., number of pieces, grams).'),
  calories: z.number().describe('The estimated calorie count for the specified quantity of the food item.'),
})).describe('A list of identified food items with their quantities and estimated calorie counts.');

export type EstimateCalorieCountOutput = z.infer<typeof EstimateCalorieCountOutputSchema>;

export async function estimateCalorieCount(input: EstimateCalorieCountInput): Promise<EstimateCalorieCountOutput> {
  return estimateCalorieCountFlow(input);
}

const estimateCalorieCountFlow = ai.defineFlow<
  typeof EstimateCalorieCountInputSchema,
  typeof EstimateCalorieCountOutputSchema
>(
  {
    name: 'estimateCalorieCountFlow',
    inputSchema: EstimateCalorieCountInputSchema,
    outputSchema: EstimateCalorieCountOutputSchema,
  },
  async input => {
    const calorieEstimations: EstimateCalorieCountOutput = [];

    for (const foodItem of input) {
      const nutrition: Nutrition = await getNutrition(foodItem);
      calorieEstimations.push({
        name: foodItem.name,
        quantity: foodItem.quantity,
        calories: nutrition.calories,
      });
    }

    return calorieEstimations;
  }
);

