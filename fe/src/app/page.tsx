import { apiFetch } from "@/lib/api";
import type { ArticleDTO } from "@/types";

export default async function HomePage() {
  const res = await apiFetch("/articles", { cache: "no-store" });
  const articles: ArticleDTO[] = res.ok ? await res.json() : [];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Artikel Terbaru</h1>
      {articles.length === 0 && (
        <p className="text-gray-500">Belum ada artikel yang dipublish.</p>
      )}
      {articles.map((article) => (
        <article key={article.id} className="border rounded p-4">
          {article.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt={article.title}
              className="rounded mb-3 max-h-64 object-cover w-full"
            />
          )}
          <h2 className="text-xl font-semibold">{article.title}</h2>
          <p className="text-gray-700 line-clamp-3">{article.content}</p>
        </article>
      ))}
    </div>
  );
}
