import VideoCard from '@/components/VideoCard';
import BlogPostCard from '@/components/BlogPostCard';

async function getFeaturedContent() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/featured`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch featured content');
  }
  return res.json();
}

export default async function HomePage() {
  const featuredContent = await getFeaturedContent();

  return (
    <div className="container mx-auto p-4">
      <div className="text-center my-8">
        <h1 className="text-4xl font-bold">Welcome to the BCH Content Hub</h1>
        <p className="text-lg text-gray-600 mt-2">
          Your source for quality videos and articles about Bitcoin Cash.
        </p>
      </div>

      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Featured Content</h2>

      {featuredContent.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredContent.map((item: any) => {
            if (item.type === 'video') {
              return <VideoCard key={`video-${item.data.id}`} video={item.data} />;
            }
            if (item.type === 'blogPost') {
              return <BlogPostCard key={`post-${item.data.id}`} post={item.data} />;
            }
            return null;
          })}
        </div>
      ) : (
        <p>No featured content available at the moment. Check back later!</p>
      )}
    </div>
  );
}
