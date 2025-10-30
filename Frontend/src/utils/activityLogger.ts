export interface ActivityItem {
  action: string;
  projectId?: string;
  timestamp: number;
}

export function logActivity(activity: ActivityItem) {
  const existing = JSON.parse(localStorage.getItem("recentActivities") || "[]");
  existing.unshift(activity);
  const trimmed = existing.slice(0, 20); // giới hạn 20 record gần nhất
  localStorage.setItem("recentActivities", JSON.stringify(trimmed));
}
