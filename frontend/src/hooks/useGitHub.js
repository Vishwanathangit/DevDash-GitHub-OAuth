import { useQuery } from "@tanstack/react-query";
import { getRepos } from "../services/github";

export default function useGitHub() {
  return useQuery({
    queryKey: ["repos"],
    queryFn: getRepos,
  });
}