import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/blog - List all blog posts for admin
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch admin blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}
