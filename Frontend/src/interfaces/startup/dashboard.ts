// Interfaces cho dashboard data
export interface DashboardStats {
  totalProjects: number;
  fundingRaised: number;
  interestedInvestors: number;
  avgInvestorEngagement: number;
  growthRate: number;
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  project: string;
  timestamp: string;
  icon: string;
  status: "completed" | "in-progress" | "pending";
}

export interface ProjectMilestone {
  id: number;
  project: string;
  milestone: string;
  dueDate: string;
  status: "completed" | "in-progress" | "upcoming";
  progress: number;
}