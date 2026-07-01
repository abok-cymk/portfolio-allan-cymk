/**
 * HomePage
 *
 * Root page at #/. Composes all sections in order:
 * SkipNavLink → ChannelHeader → NavTabs → GitHubSection → ContactSection → ThemeToggle
 *
 * Requirements: 1.1, 2.1, 2.5, 12.6
 */

import { useState } from 'react';
import { Code2, Link, Mail, AtSign, BookOpen } from 'lucide-react';
import AboutSection from '@/components/AboutSection';
import ArticlesSection from '@/components/ArticlesSection';
import ChannelHeader from '@/components/ChannelHeader';
import ContactSection, { type ContactLink } from '@/components/ContactSection';
import GitHubSection from '@/components/GitHubSection';
import NavTabs, { type TabDefinition } from '@/components/NavTabs';
import ProjectsSection from '@/components/ProjectsSection';
import SkillsSection from '@/components/SkillsSection';
import SkipNavLink from '@/components/SkipNavLink';
import ThemeToggle from '@/components/ThemeToggle';
import VideosSection from '@/components/VideosSection';
import { profile } from '@/data/profile';
import { skills } from '@/data/skills';
import { useArticles } from '@/hooks/useArticles';
import { useProjects } from '@/hooks/useProjects';

const contactLinks: ContactLink[] = [
  { platform: 'Email', url: `mailto:${profile.socialLinks.find((s) => s.platform === 'email')?.url.replace('mailto:', '') ?? ''}`, ariaLabel: `Email ${profile.socialLinks.find((s) => s.platform === 'email')?.url.replace('mailto:', '') ?? ''}`, icon: Mail },
  { platform: 'LinkedIn', url: profile.socialLinks.find((s) => s.platform === 'linkedin')?.url ?? '#', ariaLabel: 'LinkedIn profile', icon: Link },
  { platform: 'Medium', url: profile.socialLinks.find((s) => s.platform === 'medium')?.url ?? '#', ariaLabel: 'Medium profile', icon: BookOpen },
  { platform: 'X (Twitter)', url: profile.socialLinks.find((s) => s.platform === 'twitter')?.url ?? '#', ariaLabel: 'X (Twitter) profile', icon: AtSign },
  { platform: 'GitHub', url: profile.socialLinks.find((s) => s.platform === 'github')?.url ?? '#', ariaLabel: 'GitHub profile', icon: Code2 },
];

export default function HomePage() {
  const projects = useProjects();
  const { articles, loading: articlesLoading, error: articlesError } = useArticles(profile.mediumUsername);
  const [activeTab, setActiveTab] = useState('projects');

  const tabs: TabDefinition[] = [
    {
      id: 'projects',
      label: 'Projects',
      panel: <ProjectsSection projects={projects} />,
    },
    {
      id: 'articles',
      label: 'Articles',
      panel: (
        <ArticlesSection
          articles={articles}
          loading={articlesLoading}
          error={articlesError}
        />
      ),
    },
    {
      id: 'videos',
      label: 'Videos',
      panel: (
        <VideosSection
          videoIds={profile.youtubeVideoIds ?? []}
          channelHandle={profile.youtubeHandle}
        />
      ),
    },
    {
      id: 'skills',
      label: 'Skills',
      panel: <SkillsSection categories={skills} />,
    },
    {
      id: 'about',
      label: 'About',
      panel: <AboutSection intro={profile.intro} name={profile.name} />,
    },
  ];

  return (
    <>
      <SkipNavLink />
      <ChannelHeader
        name={profile.name}
        title={profile.title}
        intro={profile.intro}
        photoSrc={profile.photoSrc}
        resumeUrl={profile.resumeUrl}
        socialLinks={profile.socialLinks}
      />

      <main id="main-content" className="flex flex-col flex-1">
        <NavTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <GitHubSection username={profile.githubUsername} />
        <ContactSection links={contactLinks} />
      </main>

      <ThemeToggle />
    </>
  );
}
