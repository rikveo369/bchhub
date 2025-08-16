"use client";

import { useState, useEffect, FormEvent } from 'react';

interface Channel {
  id: number;
  name: string;
  youtubeChannelId: string;
  thumbnailUrl: string;
}

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newChannelId, setNewChannelId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (!res.ok) throw new Error('Failed to fetch channels');
      const data = await res.json();
      setChannels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleAddChannel = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeChannelId: newChannelId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add channel');
      }
      setNewChannelId('');
      fetchChannels(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDeleteChannel = async (id: number) => {
    if (!confirm('Are you sure you want to delete this channel and all its videos?')) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/channels/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete channel');
      }
      fetchChannels(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage YouTube Channels</h1>

      {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Add New Channel</h2>
        <form onSubmit={handleAddChannel}>
          <input
            type="text"
            value={newChannelId}
            onChange={(e) => setNewChannelId(e.target.value)}
            placeholder="Enter YouTube Channel ID"
            className="border p-2 mr-2 w-full md:w-1/2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Add Channel
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Channels</h2>
        <ul className="space-y-2">
          {channels.map((channel) => (
            <li key={channel.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center">
                <img src={channel.thumbnailUrl} alt={channel.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="font-bold">{channel.name}</p>
                  <p className="text-sm text-gray-500">{channel.youtubeChannelId}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteChannel(channel.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
