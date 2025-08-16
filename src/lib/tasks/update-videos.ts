import { prisma } from '../prisma';
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

const KEYWORDS = ['bitcoin cash', 'bch'];

async function updateVideos() {
  console.log('Starting video update task...');

  const channels = await prisma.channel.findMany();
  if (channels.length === 0) {
    console.log('No channels to update.');
    return;
  }

  for (const channel of channels) {
    try {
      console.log(`Fetching videos for channel: ${channel.name}`);

      const response = await youtube.search.list({
        part: ['snippet'],
        channelId: channel.youtubeChannelId,
        order: 'date',
        maxResults: 10, // Fetch the 10 most recent videos
      });

      const videos = response.data.items;
      if (!videos) continue;

      for (const video of videos) {
        if (!video.id?.videoId || !video.snippet) continue;

        const videoId = video.id.videoId;
        const { title, description, publishedAt, thumbnails } = video.snippet;

        // Check if video already exists
        const existingVideo = await prisma.video.findUnique({
          where: { youtubeVideoId: videoId },
        });

        if (existingVideo) {
          // console.log(`Video "${title}" already exists. Skipping.`);
          continue;
        }

        // Check for keywords
        const searchText = `${title?.toLowerCase()} ${description?.toLowerCase()}`;
        const isBchRelated = KEYWORDS.some(keyword => searchText.includes(keyword));

        console.log(`New video found: "${title}". BCH related: ${isBchRelated}`);

        await prisma.video.create({
          data: {
            youtubeVideoId: videoId,
            title: title || '',
            description: description || '',
            publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
            thumbnailUrl: thumbnails?.default?.url || '',
            channelId: channel.id,
            isBchRelated: isBchRelated,
          },
        });
      }
    } catch (error) {
      console.error(`Failed to fetch videos for channel ${channel.name}:`, error);
    }
  }

  console.log('Video update task finished.');
}

// This allows the script to be run directly from the command line
if (require.main === module) {
  updateVideos()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default updateVideos;
