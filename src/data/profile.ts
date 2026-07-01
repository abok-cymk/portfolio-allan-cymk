export interface SocialLink {
  platform: 'email' | 'linkedin' | 'medium' | 'twitter' | 'github';
  url: string;
  label: string; // aria-label
}

export interface ProfileData {
  name: string;
  title: string;
  intro: string; // ≤ 300 chars
  photoSrc?: string;
  resumeUrl?: string;
  socialLinks: SocialLink[];
  githubUsername: string;
  mediumUsername: string;
}

export const profile: ProfileData = {
  name: 'Your Name',
  title: 'Software Engineer',
  intro:
    'Full-stack developer with a passion for building clean, performant web applications. I enjoy solving hard problems and shipping products that people love to use.',
  photoSrc: undefined,
  resumeUrl: undefined,
  socialLinks: [
    {
      platform: 'email',
      url: 'mailto:your.email@example.com',
      label: 'Email your.email@example.com',
    },
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/in/your-username',
      label: 'LinkedIn profile',
    },
    {
      platform: 'medium',
      url: 'https://medium.com/@your-username',
      label: 'Medium profile',
    },
    {
      platform: 'twitter',
      url: 'https://twitter.com/your-username',
      label: 'X (Twitter) profile',
    },
    {
      platform: 'github',
      url: 'https://github.com/your-username',
      label: 'GitHub profile',
    },
  ],
  githubUsername: 'your-username',
  mediumUsername: 'your-username',
};
