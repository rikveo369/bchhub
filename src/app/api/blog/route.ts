import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

// GET /api/blog - List all published blog posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: { author: { select: { name: true } } },
    });

    const totalPosts = await prisma.blogPost.count({ where: { isPublished: true } });

    return NextResponse.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST /api/blog - Create a new blog post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, authorId, isPublished } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json({ error: 'Title, content, and authorId are required' }, { status: 400 });
    }

    const slug = slugify(title);

    // Check for duplicate slug
    const existingPost = await prisma.blogPost.findUnique({ where: { slug } });
    if (existingPost) {
      return NextResponse.json({ error: 'A post with this title already exists' }, { status: 409 });
    }

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        slug,
        authorId,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
