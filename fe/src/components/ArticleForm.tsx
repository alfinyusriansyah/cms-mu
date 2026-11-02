"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import type { ArticleDTO } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Props = {
  initialData?: Partial<ArticleDTO>;
  articleId?: string; // ada isinya kalau mode edit
};

export default function ArticleForm({ initialData, articleId }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [coverImage, setCoverImage] = useState<string | null>(
    initialData?.coverImage ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Browser upload langsung ke FastAPI (bukan lewat Next.js API route lagi)
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail ?? "Upload gagal");
        return;
      }
      // FastAPI mengembalikan path relatif (/static/uploads/xxx.jpg) -> jadikan URL absolut
      setCoverImage(`${API_URL}${data.url}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      content,
      cover_image: coverImage,
      published,
    };
    const url = articleId ? `${API_URL}/articles/${articleId}` : `${API_URL}/articles`;
    const method = articleId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.detail === "string" ? data.detail : "Gagal menyimpan artikel");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Judul</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {uploading && <p className="text-sm text-gray-500">Mengunggah...</p>}
        {coverImage && (
          <div className="mt-2">
            <Image src={coverImage} alt="cover" width={240} height={140} className="rounded" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Konten</label>
        <textarea
          className="w-full rounded border px-3 py-2 min-h-[220px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Publish sekarang
      </label>

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50 self-start"
      >
        {saving ? "Menyimpan..." : "Simpan Artikel"}
      </button>
    </form>
  );
}
