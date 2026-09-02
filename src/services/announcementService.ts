import api from "./api";

export type AnnouncementType = "info" | "success" | "warning" | "feature";

export interface AnnouncementAction {
  enabled: boolean;
  label?: string;
  route?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  action?: AnnouncementAction;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementResponse {
  success: boolean;
  data: Announcement[];
}

export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  const response = await api.get<AnnouncementResponse>("/announcements");

  return response.data.data || [];
};
