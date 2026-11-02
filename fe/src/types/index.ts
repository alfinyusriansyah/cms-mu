export type ArticleDTO = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type ArticleInput = {
  title: string;
  content: string;
  coverImage?: string | null;
  published?: boolean;
};
