// src/interfaces/project.ts
export interface Project {
  files: never[];
  id: number;
  projectName: string;
  category: string;
  customCategory?: string;
  fundingStage: string;
  fundingRange: string;
  fundingAmount: number;
  teamSize: number;
  location: string;
  website?: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "APPROVED" | "REJECTED";
  pitchDeck?: string; // URL from API
  pitchVideo?: string; // URL from API
  businessPlan?: string; // URL from API
  financialProjection?: string; // URL from API
  investorClicks: number;
  createdAt: string; // Changed from 'any' to 'string' for type safety
}

export interface ProjectFormState {
  projectName: string;
  category: string;
  customCategory?: string;
  fundingStage: string;
  fundingRange: string;
  teamSize: string; // String for form input, converted to number in FormData
  location: string;
  website?: string;
  description: string;
  pitchDeck: File | null;
  pitchVideo: File | null;
  businessPlan: File | null;
  financialProjection: File | null;
}