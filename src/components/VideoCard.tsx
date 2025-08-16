"use client"; // Needs to be a client component to use state for the share buttons

import Link from 'next/link';
import { useState } from 'react';
import ShareButtons from './ShareButtons';

interface VideoCardProps {
  video: {
    youtubeVideoId: string;
    title: string;
    thumbnailUrl: string;
    channel: {
      name: string;
    };
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeVideoId}`;
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
      <Link href={youtubeUrl} target="_blank" rel="noopener noreferrer">
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-bold leading-tight h-16 overflow-hidden">{video.title}</h3>
        <p className="text-sm text-gray-600 mt-2">{video.channel.name}</p>
      </div>
      <div className="absolute top-2 right-2">
        <button onClick={() => setShowShare(!showShare)} className="bg-white/70 backdrop-blur-sm p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        </button>
      </div>
      {showShare && (
        <div className="absolute top-10 right-2 bg-white p-2 rounded-lg shadow-lg z-10">
          <ShareButtons url={youtubeUrl} title={video.title} />
        </div>
      )}
    </div>
  );
}
