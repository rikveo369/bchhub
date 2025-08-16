import Link from 'next/link';
import VideoCard from '@/components/VideoCard';

interface Video {
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
  channel: {
    name: string;
  };
}

interface VideosPageProps {
  searchParams: {
    page?: string;
  };
}

async function getVideos(page: number = 1) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos?page=${page}&limit=12`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch videos');
  }
  return res.json();
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const { videos, totalPages, currentPage } = await getVideos(page);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">BCH Videos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video: Video) => (
          <VideoCard key={video.youtubeVideoId} video={video} />
        ))}
      </div>

      <div className="flex justify-between items-center mt-8">
        {currentPage > 1 ? (
          <Link href={`/videos?page=${currentPage - 1}`} className="bg-blue-500 text-white py-2 px-4 rounded">
            &larr; Previous
          </Link>
        ) : (
          <div /> // Placeholder for alignment
        )}
        <span>Page {currentPage} of {totalPages}</span>
        {currentPage < totalPages ? (
          <Link href={`/videos?page=${currentPage + 1}`} className="bg-blue-500 text-white py-2 px-4 rounded">
            Next &rarr;
          </Link>
        ) : (
          <div /> // Placeholder for alignment
        )}
      </div>
    </div>
  );
}
