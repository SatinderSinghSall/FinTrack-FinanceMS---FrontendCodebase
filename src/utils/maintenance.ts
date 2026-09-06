import api from "../services/api";

export type MaintenanceInfo = {
  enabled: boolean;
  title: string;
  message: string;
  allowUserAccess: boolean;
  startDate: string | null;
  endDate: string | null;
};

type MaintenanceResponse = {
  success?: boolean;
  data?: MaintenanceInfo | null;
  maintenance?: MaintenanceInfo | null;
};

export const checkMaintenance = async (): Promise<MaintenanceInfo | null> => {
  try {
    const response = await api.get<MaintenanceResponse>("/maintenance");

    const data = response.data;

    const maintenance = data?.data ?? data?.maintenance ?? null;

    if (!maintenance || !maintenance.enabled) {
      return null;
    }

    return {
      enabled: maintenance.enabled,
      title: maintenance.title,
      message: maintenance.message,
      allowUserAccess: maintenance.allowUserAccess,
      startDate: maintenance.startDate ?? null,
      endDate: maintenance.endDate ?? null,
    };
  } catch (error) {
    // Maintenance API failure must never lock users out.
    if (__DEV__) {
      console.warn("Maintenance check failed:", error);
    }

    return null;
  }
};
