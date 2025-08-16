import Link from 'next/link';

interface BlogPostCardProps {
  post: {
    slug: string;
    title: string;
    publishedAt: string | null;
    author: {
      name: string;
    };
  };
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <Link href={`/blog/${post.slug}`}>
        <h2 className="text-xl font-bold hover:text-blue-600">{post.title}</h2>
      </Link>
      <div className="text-sm text-gray-500 mt-2">
        <span>By {post.author.name}</span>
        {post.publishedAt && (
          <span className="mx-2">|</span>
        )}
        {post.publishedAt && (
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
