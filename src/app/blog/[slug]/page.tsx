import { notFound } from 'next/navigation';
import { marked } from 'marked';
import ShareButtons from '@/components/ShareButtons';

interface PostPageProps {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/slug/${slug}`, {
    next: { revalidate: 3600 } // Revalidate every hour
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch post');
  }
  return res.json();
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const parsedContent = marked.parse(post.content);
  const postUrl = `${process.env.NEXT_PUBLIC_API_URL}/blog/${post.slug}`;

  return (
    <article className="container mx-auto p-4 prose lg:prose-xl">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="text-gray-500 mb-4">
        <span>By {post.author.name}</span>
        <span className="mx-2">|</span>
        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
      </div>

      <div dangerouslySetInnerHTML={{ __html: parsedContent }} />

      <div className="mt-8 pt-4 border-t">
        <h3 className="text-lg font-bold mb-2">Share this post</h3>
        <ShareButtons url={postUrl} title={post.title} />
      </div>
    </article>
  );
}
