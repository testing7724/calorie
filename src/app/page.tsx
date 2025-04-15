"use client";

import React, {useState, useCallback} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CameraIcon, MenuIcon} from 'lucide-react';
import {estimateCalorieCount, EstimateCalorieCountOutput} from "@/ai/flows/estimate-calorie-count";
import {identifyFoodItems} from "@/ai/flows/identify-food-items";
import {Input} from "@/components/ui/input";
import {FoodItem} from "@/services/nutrition";
import { cn } from "@/lib/utils";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [identifiedFoodItems, setIdentifiedFoodItems] = useState<string[]>([]);
  const [calorieEstimations, setCalorieEstimations] = useState<EstimateCalorieCountOutput | null>(null);
  const [foodQuantities, setFoodQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const src = reader.result as string;
        setImageSrc(src);
        setIdentifiedFoodItems([]);
        setCalorieEstimations(null);
        setFoodQuantities({});
      };
      reader.readAsDataURL(file);
    }
  };

  const identifyAndEstimate = useCallback(async () => {
    if (!imageSrc) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);

    try {
      const identified = await identifyFoodItems({photoUrl: imageSrc});
      setIdentifiedFoodItems(identified.foodItems);

      const initialFoodItems: FoodItem[] = identified.foodItems.map(item => ({name: item, quantity: 1}));
      const estimations = await estimateCalorieCount(initialFoodItems);
      setCalorieEstimations(estimations);

      // Initialize food quantities state
      const initialQuantities: Record<string, number> = {};
      estimations.forEach(item => {
        initialQuantities[item.name] = 1;
      });
      setFoodQuantities(initialQuantities);

    } catch (error) {
      console.error("Error identifying food items:", error);
      alert("Could not identify food items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [imageSrc]);

  const adjustQuantity = (foodName: string, newQuantity: number) => {
    setFoodQuantities(prev => ({...prev, [foodName]: newQuantity}));

    // Update calorie estimations based on new quantities
    if (calorieEstimations) {
      const updatedEstimations = calorieEstimations.map(item => {
        if (item.name === foodName) {
          return {...item, quantity: newQuantity};
        }
        return item;
      });
      setCalorieEstimations(updatedEstimations);
    }
  };

  const calculateTotalCalories = () => {
    if (!calorieEstimations) return 0;
    return calorieEstimations.reduce((total, item) => total + item.calories * item.quantity, 0);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-10 bg-background">
      <h1 className="text-3xl font-bold mb-4 text-foreground">CalorieSnap</h1>

      {/* Image Upload Section */}
      <Card className="w-full max-w-md mb-6">
        <CardHeader>
          <CardTitle>Upload Food Image</CardTitle>
          <CardDescription>Capture or upload an image of your meal.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {imageSrc ? (
            <img src={imageSrc} alt="Food Image" className="max-w-full h-auto rounded-md mb-4"/>
          ) : (
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md border-primary text-primary bg-secondary">
                <CameraIcon className="w-6 h-6 mb-2"/>
                <span>Click to Upload</span>
              </div>
            </label>
          )}
          <Input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageChange}/>
          <Button onClick={identifyAndEstimate} disabled={!imageSrc || loading} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/80">
            {loading ? "Identifying..." : "Identify Food"}
          </Button>
        </CardContent>
      </Card>

      {/* Identified Items and Calorie Estimation Section */}
      {calorieEstimations && calorieEstimations.length > 0 && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Calorie Estimation</CardTitle>
            <CardDescription>Adjust quantities for accurate estimation.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              {calorieEstimations.map((item, index) => (
                <li key={index} className="py-2 border-b last:border-none">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        min="1"
                        value={foodQuantities[item.name] || item.quantity}
                        onChange={(e) => adjustQuantity(item.name, parseInt(e.target.value))}
                        className="w-20 text-center mr-2"
                      />
                      <span className="text-muted-foreground">x {item.calories} cal = {item.calories * (foodQuantities[item.name] || item.quantity)} cal</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4 font-bold text-lg">
              Total Calories: {calculateTotalCalories()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

