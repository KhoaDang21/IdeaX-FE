// src/interfaces/project.ts
export interface Project {
  investorClicks: number;
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
  status: "DRAFT" | "PUBLISHED" | "APPROVED" | "REJECTED" | "COMPLETE";
  adminNote?: string;
  startupId: number;
  createdAt: string;
  updatedAt: string;
  files?: {
    fileType: string;
    fileUrl: string;
  }[];
  // Added properties to fix TypeScript errors
  currentFunding?: number;
  fundingGoal?: number;
  companyName?: string;
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
