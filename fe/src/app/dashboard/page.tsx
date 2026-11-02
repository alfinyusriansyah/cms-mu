import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { ArticleDTO } from "@/types";
import DeleteArticleButton from "./DeleteArticleButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;

  const res = await apiFetch("/articles?mine=true", {
    token,
    cache: "no-store",
  });
  const articles: ArticleDTO[] = res.ok ? await res.json() : [];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artikel Saya</h1>
        <Link
          href="/dashboard/articles/new"
          className="rounded bg-gray-900 px-4 py-2 text-white text-sm"
        >
          + Artikel Baru
        </Link>
      </div>

      {articles.length === 0 && (
        <p className="text-gray-500">Belum ada artikel. Buat yang pertama!</p>
      )}

      <div className="flex flex-col gap-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="border rounded p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{article.title}</p>
              <p className="text-sm text-gray-500">
                {article.published ? "Published" : "Draft"} ·{" "}
                {new Date(article.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/dashboard/articles/${article.id}/edit`}
                className="underline"
              >
                Edit
              </Link>
              <DeleteArticleButton articleId={article.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
