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
  youtubeHandle?: string;        // e.g. "@allanabok2236"
  youtubeVideoIds?: string[];    // curated list of 11-char video IDs
}

export const profile: ProfileData = {
  name: 'Allan Abok',
  title: 'Software Engineer',
  intro:
    'Full-stack developer with a passion for building clean, performant web applications. I enjoy solving hard problems and shipping products that people love to use.',
  photoSrc: 'allan-profile-2.jpeg',
  resumeUrl: 'https://1drv.ms/w/c/a2a012b55e737010/IQBvC8D_1H0sTahKagBG5573AXRiZOXPR9r75YBNYThhkAE?e=rEDQuF',
  socialLinks: [
    {
      platform: 'email',
      url: 'mailto:abokallan22@gmail.com',
      label: 'Email abokallan22@gmail.com',
    },
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/in/allan-abok-28945a330/',
      label: 'LinkedIn profile',
    },
    {
      platform: 'medium',
      url: 'https://medium.com/@abokallan22',
      label: 'Medium profile',
    },
    {
      platform: 'twitter',
      url: 'https://x.com/abokallan22',
      label: 'X (Twitter) profile',
    },
    {
      platform: 'github',
      url: 'https://github.com/abok-cymk',
      label: 'GitHub profile',
    },
  ],
  githubUsername: 'abok-cymk',
  mediumUsername: '@abokallan22',
  youtubeHandle: '@allanabok2236',
  youtubeVideoIds: [
    'DH69VsNc3ow',  // your first video — add more IDs below
    'BcvAFL3MXoU',
    '6qGDYgqPt18',
    'laAMIy2fCkE',
  ],
};
