export interface Meeting {
  id?: number;
  roomCode?: string;
  topic: string;
  meetingTime: string;
  description?: string;
  createdById: number;
  recordUrl?: string;
}

export interface MeetingFormData {
  topic: string;
  meetingTime: any; // Moment object from DatePicker
  description?: string;
}
