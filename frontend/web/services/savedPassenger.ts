import { api } from "@/lib/api";
import { SavedPassenger } from "@/types/passenger";

export const getSavedPassengers = async (): Promise<SavedPassenger[]> => {
  const { data } = await api.get<SavedPassenger[]>("/users/me/saved-passengers");
  return data;
};

export const createSavedPassenger = async (
  body: Omit<SavedPassenger, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<SavedPassenger> => {
  const { data } = await api.post<SavedPassenger>("/users/me/saved-passengers", body);
  return data;
};

export const updateSavedPassenger = async (
  id: string,
  body: Partial<SavedPassenger>
): Promise<SavedPassenger> => {
  const { data } = await api.put<SavedPassenger>(`/users/me/saved-passengers/${id}`, body);
  return data;
};

export const deleteSavedPassenger = async (id: string): Promise<void> => {
  await api.delete(`/users/me/saved-passengers/${id}`);
};
