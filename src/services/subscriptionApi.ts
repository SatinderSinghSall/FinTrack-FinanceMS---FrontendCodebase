import api from "./api";

export const getSubscriptions = async () => {
  const response = await api.get("/subscriptions");

  return response.data;
};

export const getSubscriptionById = async (id: string) => {
  const response = await api.get(`/subscriptions/${id}`);

  return response.data;
};

export const createSubscription = async (data: any) => {
  const response = await api.post("/subscriptions", data);

  return response.data;
};

export const updateSubscription = async (id: string, data: any) => {
  const response = await api.put(`/subscriptions/${id}`, data);

  return response.data;
};

export const deleteSubscription = async (id: string) => {
  const response = await api.delete(`/subscriptions/${id}`);

  return response.data;
};
