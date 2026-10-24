import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { pageNumber } from "@/lib/format";
import { getAuthor, getPosts } from "@/lib/rblog";
import { pageMetadata, withPage } from "@/lib/seo";

type Props = PageProps<"/authors/[slug]">;

// RBlog has no author list: take the authors of the latest posts.
export async function generateStaticParams() {
  const posts = await getPosts({ perPage: 100 });
  const slugs = new Set(posts.data.flatMap((p) => (p.author.slug ? [p.author.slug] : [])));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const author = await getAuthor(slug);
  if (!author) return {};
  const page = pageNumber((await props.searchParams).page);
  return pageMetadata({
    title: page > 1 ? `${author.name} (trang ${page})` : author.name,
    description: author.bio ?? `Các bài viết của ${author.name}.`,
    path: withPage(`/authors/${author.slug}`, page),
    image: author.avatar
      ? { url: author.avatar.url, width: author.avatar.width ?? undefined, height: author.avatar.height ?? undefined, alt: author.avatar.alt }
      : undefined,
  });
}

// Looked up before anything streams: a real 404 (see posts/[slug]).
export const instant = false;

export default async function AuthorPage(props: Props) {
  const { slug } = await props.params;
  const author = await getAuthor(slug);
  if (!author) notFound();

  return (
    <Listing
      eyebrow="Tác giả"
      title={author.name}
      description={author.bio}
      filter={{ author: author.slug }}
      searchParams={props.searchParams}
      base={`/authors/${author.slug}`}
    >
      {(author.avatar || author.website) && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          {author.avatar && (
            <Image
              src={author.avatar.url}
              alt={author.avatar.alt}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
          )}
          {author.website && (
            <a href={author.website} target="_blank" rel="noopener noreferrer me" className="text-accent hover:underline">
              {author.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      )}
    </Listing>
  );
}
