export interface SkillCategory {
  name: 'Frontend' | 'Backend' | 'Languages' | 'Tools';
  skills: string[]; // max 12 items
}

export const skills: SkillCategory[] = [
  {
    name: 'Frontend',
    skills: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'Vite',
      'HTML5',
      'CSS3',
      'Next.js',
    ],
  },
  {
    name: 'Backend',
    skills: [
      'Node.js',
      'Express',
      'PostgreSQL',
      'REST APIs',
      'GraphQL',
      'Redis',
    ],
  },
  {
    name: 'Languages',
    skills: [
      'TypeScript',
      'JavaScript',
      'Python',
      'SQL',
    ],
  },
  {
    name: 'Tools',
    skills: [
      'Git',
      'GitHub Actions',
      'Docker',
      'Vitest',
      'ESLint',
      'Figma',
      'VS Code',
    ],
  },
];
