
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: UserRole;
  status: UserStatus;
  points: number;
  joinedAt: number;
}

export interface SubTask {
  id: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  isCompleted: boolean;
}

export interface LifeTask {
  id: string;
  userId: string;
  title: string;
  subTasks: SubTask[];
  createdAt: number;
  isFullyCompleted?: boolean;
}

export enum GrowthStage {
  SEED = 0,
  SPROUT = 1,
  GROWING = 2,
  MATURE = 3,
  HARVESTABLE = 4
}

export interface SeedType {
  id: string;
  name: string;
  icon: string;
  price: number;
  growthSteps: number; 
  harvestAmount: number; 
}

export interface PlantedCrop {
  id: string;
  seedId: string;
  stage: GrowthStage;
  waterCount: number;
  lastWatered: number;
}

export interface InventoryItem {
  seedId: string;
  quantity: number;
}

export interface ProduceItem {
  seedId: string;
  quantity: number;
}

export interface HarvestLog {
  id: string;
  cropId: string;
  cropName: string;
  icon: string;
  message: string;
  timestamp: number;
}

export interface CSAFormData {
  name: string;
  phone: string;
  address: string;
}

export interface GlobalData {
  users: UserProfile[];
  tasks: LifeTask[];
  farmStates: Record<string, any>;
  harvestHistory: Record<string, HarvestLog[]>;
}
