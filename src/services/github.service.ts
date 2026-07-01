/**
 * GitHub_Service
 *
 * Fetches public repository data from the GitHub REST API v3.
 * Uses ghchart.rshah.org for the contribution graph (no token required).
 *
 * Requirements: 7.1, 7.2, 7.3
 */

export interface RepoData {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  updatedAt: string;  // ISO string (pushed_at from GitHub)
  topics: string[];
}

export interface GitHubData {
  featuredRepos: RepoData[];     // up to 6 repos with topic "featured"
  recentRepos: RepoData[];       // up to 6 most recently pushed
  contributionGraphUrl: string;  // https://ghchart.rshah.org/:username
}

const GITHUB_API = 'https://api.github.com';

/**
 * Fetches all public repos (up to 100), filters and sorts them,
 * then returns the GitHubData shape.
 *
 * Throws on any fetch or parse error so callers can handle via try/catch.
 */
export async function fetchGitHubData(username: string): Promise<GitHubData> {
  const url =
    `${GITHUB_API}/users/${encodeURIComponent(username)}/repos` +
    `?sort=pushed&per_page=100`;

  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await response.json();

  if (!Array.isArray(raw)) {
    throw new Error('GitHub API returned unexpected shape');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repos: RepoData[] = raw.map((r: any) => ({
    name: r.name ?? '',
    description: r.description ?? null,
    language: r.language ?? null,
    stars: r.stargazers_count ?? 0,
    url: r.html_url ?? '',
    updatedAt: r.pushed_at ?? '',
    topics: Array.isArray(r.topics) ? r.topics : [],
  }));

  const featuredRepos = repos
    .filter((r) => r.topics.includes('featured'))
    .slice(0, 6);

  // Already sorted by pushed desc from the API; take first 6
  const recentRepos = [...repos]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 6);

  const contributionGraphUrl = `https://ghchart.rshah.org/${encodeURIComponent(username)}`;

  return { featuredRepos, recentRepos, contributionGraphUrl };
}
