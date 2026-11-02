import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ArticleDTO } from "@/types";
import ArticleForm from "@/components/ArticleForm";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const res = await apiFetch(`/articles/${params.id}`, { cache: "no-store" });

  if (!res.ok) {
    notFound();
  }

  const article: ArticleDTO = await res.json();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Artikel</h1>
      <ArticleForm
        articleId={article.id}
        initialData={{
          title: article.title,
          content: article.content,
          coverImage: article.coverImage,
          published: article.published,
        }}
      />
    </div>
  );
}
