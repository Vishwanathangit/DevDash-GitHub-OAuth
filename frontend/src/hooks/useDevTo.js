import { useQuery } from "@tanstack/react-query";
import { getArticles } from "../services/devto";

export default function useDevTo(username) {
  return useQuery({
    queryKey: ["devto", username],
    queryFn: () => getArticles(username),
    enabled: !!username,
  });
}