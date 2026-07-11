import { useMutation } from "@tanstack/react-query";
import { reserveSeat } from "@/services/reservation";

export function useReserveSeat() {
  return useMutation({
    mutationFn: reserveSeat,
  });
}
