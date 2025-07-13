import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { getArticles } from "../../services/devto";
import ArticleCard from "./ArticleCard";
import Button from "../UI/Button";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
});

export default function DevToSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      username: "",
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getArticles(value.username);
        setArticles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex gap-4"
        >
          <form.Field
            name="username"
            children={(field) => (
              <div className="flex-1">
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter Dev.to username"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                />
              </div>
            )}
          />
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-3 min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              "Fetch Articles"
            )}
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}