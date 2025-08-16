import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/videos - List all BCH-related videos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10); // Default to 12 for a grid layout
    const skip = (page - 1) * limit;

    const videos = await prisma.video.findMany({
      where: { isBchRelated: true },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: { channel: { select: { name: true } } },
    });

    const totalVideos = await prisma.video.count({ where: { isBchRelated: true } });

    return NextResponse.json({
      videos,
      totalPages: Math.ceil(totalVideos / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
