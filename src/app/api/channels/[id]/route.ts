import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid channel ID' }, { status: 400 });
    }

    // First, delete all videos associated with the channel to prevent foreign key constraint errors.
    await prisma.video.deleteMany({
      where: { channelId: id },
    });

    // Then, delete the channel itself.
    await prisma.channel.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Channel and associated videos deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete channel:', error);
    // Handle cases where the channel might not be found
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
       return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
}
