import api from "./api";

export type FinancialTipCategory =
  | "budgeting"
  | "saving"
  | "expenses"
  | "debt"
  | "investing"
  | "financial-safety"
  | "money-habits"
  | "goals";

export type FinancialTipType = "tip" | "guide" | "lesson" | "warning";

export interface FinancialTipAction {
  enabled: boolean;
  label?: string;
  route?: string;
}

export interface FinancialTip {
  _id: string;

  title: string;

  shortDescription: string;

  content: string;

  category: FinancialTipCategory;

  type: FinancialTipType;

  isActive: boolean;

  featured: boolean;

  startDate: string;

  endDate: string | null;

  action?: FinancialTipAction;

  createdAt: string;

  updatedAt: string;
}

interface FinancialTipResponse {
  success: boolean;
  data: FinancialTip[];
}

export const getActiveFinancialTips = async (): Promise<FinancialTip[]> => {
  const response = await api.get<FinancialTipResponse>("/financial-tips");

  return response.data.data || [];
};
