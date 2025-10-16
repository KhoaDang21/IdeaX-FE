export interface Milestone {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO date (YYYY-MM-DD)
  status: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}
