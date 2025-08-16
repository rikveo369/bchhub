import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

// GET /api/channels - List all channels
export async function GET() {
  try {
    const channels = await prisma.channel.findMany();
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

// POST /api/channels - Add a new channel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { youtubeChannelId } = body;

    if (!youtubeChannelId) {
      return NextResponse.json({ error: 'youtubeChannelId is required' }, { status: 400 });
    }

    // Check if channel already exists
    const existingChannel = await prisma.channel.findUnique({
      where: { youtubeChannelId },
    });

    if (existingChannel) {
      return NextResponse.json({ error: 'Channel already exists' }, { status: 409 });
    }

    // Fetch channel details from YouTube API
    const response = await youtube.channels.list({
      part: ['snippet'],
      id: [youtubeChannelId],
    });

    const channelData = response.data.items?.[0];

    if (!channelData || !channelData.snippet) {
      return NextResponse.json({ error: 'YouTube channel not found' }, { status: 404 });
    }

    const { title, customUrl, thumbnails } = channelData.snippet;

    // Create channel in our database
    const newChannel = await prisma.channel.create({
      data: {
        youtubeChannelId: youtubeChannelId,
        name: title || '',
        customUrl: customUrl || '',
        thumbnailUrl: thumbnails?.default?.url || '',
      },
    });

    return NextResponse.json(newChannel, { status: 201 });
  } catch (error) {
    console.error('Failed to add channel:', error);
    return NextResponse.json({ error: 'Failed to add channel' }, { status: 500 });
  }
}
