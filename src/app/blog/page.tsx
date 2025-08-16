import Link from 'next/link';
import BlogPostCard from '@/components/BlogPostCard';

interface Post {
  slug: string;
  title: string;
  publishedAt: string | null;
  author: {
    name: string;
  };
}

interface BlogPageProps {
  searchParams: {
    page?: string;
  };
}

async function getPosts(page: number = 1) {
  // In a real app, you might want to fetch directly from the DB in a server component,
  // but using the API route is also fine and demonstrates its use.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog?page=${page}&limit=10`, {
    cache: 'no-store', // Don't cache blog list
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const { posts, totalPages, currentPage } = await getPosts(page);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <div className="space-y-6">
        {posts.map((post: Post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>

      <div className="flex justify-between items-center mt-8">
        {currentPage > 1 ? (
          <Link href={`/blog?page=${currentPage - 1}`} className="bg-blue-500 text-white py-2 px-4 rounded">
            &larr; Previous
          </Link>
        ) : (
          <div /> // Placeholder for alignment
        )}
        <span>Page {currentPage} of {totalPages}</span>
        {currentPage < totalPages ? (
          <Link href={`/blog?page=${currentPage + 1}`} className="bg-blue-500 text-white py-2 px-4 rounded">
            Next &rarr;
          </Link>
        ) : (
          <div /> // Placeholder for alignment
        )}
      </div>
    </div>
  );
}
