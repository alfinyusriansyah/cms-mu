"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DeleteArticleButton({ articleId }: { articleId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus artikel ini?")) return;
    setLoading(true);
    await fetch(`${API_URL}/articles/${articleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="underline text-red-600">
      {loading ? "..." : "Hapus"}
    </button>
  );
}
