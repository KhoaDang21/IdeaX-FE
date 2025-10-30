export interface Meeting {
  id?: number;
  roomCode?: string;
  topic: string;
  meetingTime: string;
  description?: string;
  createdById: number;
  createdByName?: string;
  projectId?: number;
  projectName?: string;
  startupId?: number;
  investorId?: number;
  status?: string;
  recordUrl?: string;
  fundingGoal?: number;
  stage?: string;
  teamSize?: number;
  location?: string;
}

export interface MeetingFormData {
  topic: string;
  meetingTime: any; // Moment object from DatePicker
  description?: string;
}
