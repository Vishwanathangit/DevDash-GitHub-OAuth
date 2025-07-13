import { useQuery } from "@tanstack/react-query";
import { getRepos } from "../../services/github";
import RepoCard from "./RepoCard";
import Loader from "../UI/Loader";

export default function ReposSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["repos"],
    queryFn: getRepos,
  });

  if (isLoading) return <Loader />;
  
  if (error) return (
    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        Error: {error.message}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}