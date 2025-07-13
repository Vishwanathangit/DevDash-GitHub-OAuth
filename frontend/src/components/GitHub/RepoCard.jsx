import { FaStar, FaCodeBranch, FaLock } from "react-icons/fa";

export default function RepoCard({ repo }) {
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
            {repo.name}
          </h3>
          {repo.private && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
              <FaLock size={10} />
              Private
            </span>
          )}
        </div>
      </div>
      
      <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
        {repo.description || "No description available"}
      </p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-slate-600 font-medium">
            {repo.language || "Unknown"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <FaStar className="text-yellow-500" />
            {repo.stargazers_count}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <FaCodeBranch className="text-blue-500" />
            {repo.forks_count}
          </span>
        </div>
      </div>
      
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group-hover:translate-x-1"
      >
        View Repository
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
