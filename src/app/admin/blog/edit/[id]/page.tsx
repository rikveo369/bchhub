import BlogPostForm from '@/components/admin/BlogPostForm';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) {
    return notFound();
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Blog Post</h1>
      <BlogPostForm post={post} />
    </div>
  );
}
