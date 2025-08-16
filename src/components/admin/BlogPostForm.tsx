"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { BlogPost } from '@prisma/client';

interface BlogPostFormProps {
  post?: BlogPost; // Optional post object for editing
}

export default function BlogPostForm({ post }: BlogPostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isEditMode = post !== undefined;

  useEffect(() => {
    if (isEditMode && post) {
      setTitle(post.title);
      setContent(post.content);
      setIsPublished(post.isPublished);
    }
  }, [isEditMode, post]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const apiEndpoint = isEditMode ? `/api/blog/${post.id}` : '/api/blog';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        // For simplicity, hardcoding authorId. In a real app, this would come from the logged-in user's session.
        body: JSON.stringify({ title, content, isPublished, authorId: 1 }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to ${isEditMode ? 'update' : 'create'} post`);
      }

      router.push('/admin/blog');
      router.refresh(); // Refresh the page to show the new/updated post
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 bg-red-100 p-2 rounded">{error}</p>}
      <div>
        <label htmlFor="title" className="block font-bold mb-1">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block font-bold mb-1">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border p-2 rounded h-64"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Markdown is supported.</p>
      </div>
      <div className="flex items-center">
        <input
          id="isPublished"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="isPublished">Publish this post</label>
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white py-2 px-4 rounded disabled:bg-gray-400"
        >
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Post' : 'Create Post')}
        </button>
      </div>
    </form>
  );
}
