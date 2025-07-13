import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvents, createEvent } from "../services/events";

export function useGetEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
}