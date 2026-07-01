/**
 * VideosSection
 *
 * Displays a grid of YouTube video thumbnail cards. Each card shows the
 * video thumbnail (via img.youtube.com — no API key required), title fetched
 * via YouTube oEmbed, and opens the video in a new tab on click.
 *
 * Thumbnails are loaded lazily. The oEmbed fetch runs once per video on mount.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VideoMeta {
  id: string;
  title: string;
}

interface VideoCardProps {
  videoId: string;
  index: number;
}

function VideoCard({ videoId, index }: VideoCardProps) {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [imgError, setImgError] = useState(false);
  const reducedMotion = useReducedMotion();

  // Fetch title via YouTube oEmbed (public, no API key, CORS-safe)
  useEffect(() => {
    const url =
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.title) setMeta({ id: videoId, title: data.title });
        else setMeta({ id: videoId, title: 'Watch on YouTube' });
      })
      .catch(() => setMeta({ id: videoId, title: 'Watch on YouTube' }));
  }, [videoId]);

  const thumbnailUrl = imgError
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const enterProps = {
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true as const },
    transition: { duration: reducedMotion ? 0.15 : 0.4, delay: index * 0.06 },
  };

  return (
    <motion.a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={meta?.title ?? `YouTube video ${videoId}`}
      {...enterProps}
      whileHover={reducedMotion ? {} : { scale: 1.03, boxShadow: 'var(--shadow-card)' }}
      className="flex flex-col text-left rounded-lg overflow-hidden no-underline group"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={thumbnailUrl}
          alt={meta?.title ?? ''}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          aria-hidden="true"
        >
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full"
            style={{ background: 'rgba(255,0,0,0.9)' }}
          >
            <Play size={24} fill="white" color="white" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="p-3">
        <p
          className="text-sm font-medium leading-snug line-clamp-2"
          style={{ color: 'var(--color-text-heading)' }}
        >
          {meta ? meta.title : (
            <span
              className="inline-block rounded"
              style={{
                width: '80%',
                height: '1em',
                background: 'var(--color-border)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          )}
        </p>
      </div>
    </motion.a>
  );
}

interface VideosSectionProps {
  videoIds: string[];
  channelHandle?: string;
}

export default function VideosSection({ videoIds, channelHandle }: VideosSectionProps) {
  if (videoIds.length === 0) {
    return (
      <section aria-label="Videos" className="p-8 text-center">
        <p style={{ color: 'var(--color-text)' }}>No videos added yet.</p>
      </section>
    );
  }

  return (
    <section aria-label="Videos" className="p-6">
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {videoIds.map((id, i) => (
          <VideoCard key={id} videoId={id} index={i} />
        ))}
      </div>

      {channelHandle && (
        <div className="mt-6 text-center">
          <a
            href={`https://www.youtube.com/${channelHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-heading)',
              textDecoration: 'none',
            }}
            aria-label={`View all videos on YouTube ${channelHandle}`}
          >
            <Play size={14} aria-hidden="true" />
            View channel on YouTube
          </a>
        </div>
      )}
    </section>
  );
}
