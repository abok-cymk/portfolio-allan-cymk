/**
 * ProjectPage
 *
 * Lazy-loaded project detail page. Reads slug from URL params,
 * finds matching project, records in recentlyViewed, renders Markdown body.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import rehypeHighlight from 'rehype-highlight';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Code2 } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';
import NotFoundPage from './NotFoundPage';
import { useProject } from '@/hooks/useProjects';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useArticles } from '@/hooks/useArticles';
import { profile } from '@/data/profile';

export default function ProjectPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const project = useProject(slug);
  const { addRecentlyViewed } = useRecentlyViewed();
  const { articles } = useArticles(profile.mediumUsername);

  useEffect(() => {
    if (slug) {
      addRecentlyViewed(slug);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!project) {
    return <NotFoundPage />;
  }

  const relatedArticles = project.mediumPosts
    ? articles.filter((a) =>
        project.mediumPosts!.some((slug) => a.url.includes(slug)),
      )
    : [];

  return (
    <main id="main-content" className="flex flex-col flex-1">
      {/* Back link */}
      <div className="text-left px-6 pt-6">
        <Link
          to="/"
          className="text-sm underline"
          style={{ color: 'var(--color-accent)' }}
        >
          ← Back to projects
        </Link>
      </div>

      <article className="flex flex-col gap-6 px-6 py-8 --max-w-3xl mx-auto w-full text-left">
        {/* Header */}
        <header>
          <h1
            style={{
              color: 'var(--color-text-heading)',
              fontSize: '2rem',
              margin: '0 0 8px',
            }}
          >
            {project.title}
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text)' }}>
            {project.description}
          </p>
        </header>

        {/* Tech tags */}
        <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
          {project.technologies.map((tech) => (
            <li
              key={tech}
              className="text-sm px-3 py-1 rounded-full"
              style={{
                background: 'var(--color-accent-bg)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent-border)',
              }}
            >
              {tech}
            </li>
          ))}
        </ul>

        {/* Links */}
        <div className="flex gap-4">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} repository`}
            className="flex items-center gap-2 text-sm font-medium underline"
            style={{ color: 'var(--color-text-heading)' }}
          >
            <Code2 size={16} aria-hidden="true" /> Repository
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live demo`}
              className="flex items-center gap-2 text-sm font-medium underline"
              style={{ color: 'var(--color-accent)' }}
            >
              <ExternalLink size={16} aria-hidden="true" /> Live Demo
            </a>
          )}
        </div>

        {/* Markdown body */}
        <div
          className="prose max-w-none leading-relaxed"
          style={{ color: 'var(--color-text)' }}
        >
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
            {project.body}
          </ReactMarkdown>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section aria-label="Related articles">
            <h2
              className="text-lg font-medium mb-4"
              style={{ color: 'var(--color-text-heading)' }}
            >
              Related articles
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.url} article={article} />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
