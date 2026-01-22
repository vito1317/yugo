
import { SeedType } from './types';

export const SEEDS: SeedType[] = [
  { id: 'carrot', name: '胡蘿蔔', icon: '🥕', price: 50, growthSteps: 2, harvestAmount: 1 },
  { id: 'tomato', name: '番茄', icon: '🍅', price: 80, growthSteps: 3, harvestAmount: 1 },
  { id: 'broccoli', name: '青花菜', icon: '🥦', price: 120, growthSteps: 4, harvestAmount: 2 },
  { id: 'apple', name: '蘋果', icon: '🍎', price: 200, growthSteps: 6, harvestAmount: 3 },
];

export const POINTS_MAP = {
  EASY: 10,
  MEDIUM: 30,
  HARD: 60,
};

export const EXCHANGE_REQUIREMENT = 10; // Need 10 units of any produce for a box
export const WATERING_COST = 5; // Cost in points to water a plant
