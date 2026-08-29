import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { BlogPostListItem } from "@/types/blog.type";

const BlogCard = ({ post }: { post: BlogPostListItem }) => {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative w-full aspect-[16/9] bg-background">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={24} className="text-text-muted/40" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col grow">
        <h2 className="text-base font-semibold text-text-main line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-text-muted line-clamp-2 mb-3">{post.excerpt}</p>
        )}
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="mt-auto text-xs text-text-muted">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        )}
      </div>
    </Link>
  );
};

export default BlogCard;
