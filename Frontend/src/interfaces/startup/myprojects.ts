export interface MilestoneUI {
  id: number;
  label: string;
  due: string;
  description: string;
}

export interface ProjectUI {
  id: number;
  title: string;
  status: string;
  progress: number;
  raised: string;
  target: string;
  stage: string;
  timeline: Array<{
    stage: string;
    date: string;
    status: "completed" | "in-progress" | "upcoming";
  }>;
  milestones: MilestoneUI[];
  metrics: {
    activeInvestors: number;
    completedMilestones: number;
    totalMilestones: number;
    completion: number;
  };
}