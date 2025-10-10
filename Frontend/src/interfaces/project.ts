export interface Project {
  createdAt: any;
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

  // Status: Enum để tránh sai giá trị
  status: "DRAFT" | "PUBLISHED" | "APPROVED" | "REJECTED";

  // Các file upload
  pitchDeck?: File | null;
  pitchVideo?: File | null;
  businessPlan?: File | null;
  financialProjection?: File | null;
}