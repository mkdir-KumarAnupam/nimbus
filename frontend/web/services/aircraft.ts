import { api } from "@/lib/api";
import { AircraftResponse } from "@/types/aircraft";

export async function getAircraftById(id: string): Promise<AircraftResponse> {
  const { data } = await api.get<AircraftResponse>(`/aircrafts/${id}`);
  return data;
}
