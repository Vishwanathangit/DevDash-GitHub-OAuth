import { FaRegClock, FaRegHeart, FaExternalLinkAlt } from "react-icons/fa";

export default function ArticleCard({ article }) {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:scale-[1.02]">
      {article.social_image && (
        <div className="relative overflow-hidden">
          <img
            src={article.social_image}
            alt={article.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}
      <div className="p-6">
        <h3 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
          {article.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tag_list.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 hover:border-blue-300 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <FaRegClock className="text-blue-500" />
              {article.reading_time_minutes} min read
            </span>
            <span className="flex items-center gap-2">
              <FaRegHeart className="text-red-500" />
              {article.public_reactions_count}
            </span>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
          >
            Read Article
            <FaExternalLinkAlt className="group-hover:translate-x-0.5 transition-transform" size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
