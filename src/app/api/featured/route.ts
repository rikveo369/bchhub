import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/featured - List all featured content
export async function GET() {
  try {
    const featuredItems = await prisma.featuredContent.findMany({
      orderBy: { order: 'asc' },
      include: {
        video: {
          include: {
            channel: { select: { name: true } }
          }
        },
        blogPost: {
          include: {
            author: { select: { name: true } }
          }
        },
      },
    });

    // We need to format the data slightly so that the frontend
    // can easily tell whether an item is a video or a blog post.
    const response = featuredItems.map(item => {
      if (item.video) {
        return { type: 'video', data: item.video };
      }
      if (item.blogPost) {
        return { type: 'blogPost', data: item.blogPost };
      }
      return null;
    }).filter(Boolean);


    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch featured content:', error);
    return NextResponse.json({ error: 'Failed to fetch featured content' }, { status: 500 });
  }
}
