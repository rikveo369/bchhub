import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blog/:id - Get a single blog post by ID (for admin editing)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT /api/blog/:id - Update a blog post
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { title, content, isPublished } = body;

    // Basic validation
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        content,
        isPublished,
        // If the post is being published now, set the publishedAt date.
        // If it's being unpublished, set it to null.
        publishedAt: isPublished ? new Date() : null,
      },
    });
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/blog/:id - Delete a blog post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.blogPost.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
