export interface Milestone {
  projectId: number;
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO date (YYYY-MM-DD)
  status: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}
