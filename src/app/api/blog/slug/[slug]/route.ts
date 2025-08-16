import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blog/slug/:slug - Get a single published blog post by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: slug,
        isPublished: true,
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to fetch post by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
