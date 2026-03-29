export interface GitHubLanguageDatum {
  name: string;
  value: number;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GitHubStats {
  username: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalContributions: number;
  languages: GitHubLanguageDatum[];
  heatmap: GitHubContributionDay[];
}

interface GitHubUserResponse {
  login: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepoResponse {
  fork: boolean;
  language: string | null;
  owner: { login: string };
}

interface GitHubContributionPayload {
  heatmap: GitHubContributionDay[];
  totalContributions: number | null;
}

interface GitHubProfileFallback {
  username: string;
  publicRepos: number;
  followers: number;
  following: number;
}

interface GitHubFetchResult<T> {
  data: T | null;
  status: number;
}

function parseNumericToken(raw: string | null | undefined): number {
  if (!raw) {
    return 0;
  }

  const clean = raw.trim().toLowerCase().replace(/,/g, '');
  const match = clean.match(/^([\d.]+)([km]?)$/);

  if (!match) {
    const num = Number.parseInt(clean, 10);
    return Number.isNaN(num) ? 0 : num;
  }

  const value = Number.parseFloat(match[1]);
  const suffix = match[2];

  if (Number.isNaN(value)) {
    return 0;
  }

  if (suffix === 'k') return Math.round(value * 1000);
  if (suffix === 'm') return Math.round(value * 1000000);
  return Math.round(value);
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'coding-tracker',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubJsonWithStatus<T>(url: string): Promise<GitHubFetchResult<T>> {
  try {
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { data: null, status: response.status };
    }

    return {
      data: (await response.json()) as T,
      status: response.status,
    };
  } catch {
    return { data: null, status: 0 };
  }
}

async function fetchOwnedRepos(username: string): Promise<GitHubRepoResponse[] | null> {
  const repos: GitHubRepoResponse[] = [];

  for (let page = 1; page <= 3; page++) {
    const chunkResult = await fetchGitHubJsonWithStatus<GitHubRepoResponse[]>(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`
    );

    if (chunkResult.status === 404) {
      return [];
    }

    if (chunkResult.status !== 200 || !chunkResult.data) {
      // Likely rate-limited or transient failure.
      return null;
    }

    const chunk = chunkResult.data;

    if (chunk.length === 0) {
      break;
    }

    repos.push(
      ...chunk.filter(
        (repo) => !repo.fork && repo.owner.login.toLowerCase() === username.toLowerCase()
      )
    );

    if (chunk.length < 100) {
      break;
    }
  }

  return repos;
}

async function fetchProfileFallback(username: string): Promise<GitHubProfileFallback | null> {
  try {
    const response = await fetch(`https://github.com/${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'coding-tracker',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const text = stripHtmlToText(html);

    const canonicalUsername =
      html.match(/profile:username"\s+content="([^"]+)"/i)?.[1] || username;

    const repoToken =
      text.match(/has\s+([\d.,kKmM]+)\s+repositories?\s+available/i)?.[1] || '0';

    const followerToken =
      text.match(/([\d.,kKmM]+)\s+followers?/i)?.[1] || '0';

    const followingToken =
      text.match(/([\d.,kKmM]+)\s+following/i)?.[1] || '0';

    return {
      username: canonicalUsername,
      publicRepos: parseNumericToken(repoToken),
      followers: parseNumericToken(followerToken),
      following: parseNumericToken(followingToken),
    };
  } catch {
    return null;
  }
}

async function fetchRepoLanguagesFallback(username: string): Promise<GitHubLanguageDatum[]> {
  try {
    const response = await fetch(
      `https://github.com/${encodeURIComponent(username)}?tab=repositories`,
      {
        headers: {
          'User-Agent': 'coding-tracker',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const matches = [...html.matchAll(/itemprop="programmingLanguage">([^<]+)</g)];

    const languageCounts = new Map<string, number>();
    for (const match of matches) {
      const language = match[1].trim();
      if (!language) continue;
      languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
    }

    return Array.from(languageCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  } catch {
    return [];
  }
}

function buildLanguageDistribution(repos: GitHubRepoResponse[]): GitHubLanguageDatum[] {
  const languageCounts = new Map<string, number>();

  for (const repo of repos) {
    const language = repo.language || 'Unknown';
    languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
  }

  return Array.from(languageCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function fallbackHeatmap(): GitHubContributionPayload {
  const today = new Date().toISOString().split('T')[0];
  return {
    heatmap: [{ date: today, count: 0, level: 0 }],
    totalContributions: 0,
  };
}

async function fetchContributionHeatmap(username: string): Promise<GitHubContributionPayload> {
  const today = new Date();
  const from = new Date(today);
  from.setFullYear(today.getFullYear() - 1);

  const fromDate = from.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];

  const response = await fetch(
    `https://github.com/users/${encodeURIComponent(username)}/contributions?from=${fromDate}&to=${toDate}`,
    {
      headers: {
        'User-Agent': 'coding-tracker',
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    return fallbackHeatmap();
  }

  const markup = await response.text();
  const dayTags = markup.match(/<[^>]*data-date="[^"]+"[^>]*>/g) || [];

  const days: GitHubContributionDay[] = [];

  for (const tag of dayTags) {
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const levelRaw = tag.match(/data-level="(\d+)"/)?.[1] || '0';
    const countRaw = tag.match(/data-count="(\d+)"/)?.[1];

    if (!date) {
      continue;
    }

    const level = Number.parseInt(levelRaw, 10) || 0;
    const count = countRaw ? Number.parseInt(countRaw, 10) || 0 : level;

    days.push({
      date,
      count,
      level,
    });
  }

  if (days.length === 0) {
    return fallbackHeatmap();
  }

  days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const text = stripHtmlToText(markup);
  const totalToken = text.match(/([\d.,kKmM]+)\s+contributions?\s+in\s+the\s+last\s+year/i)?.[1];
  const parsedTotal = totalToken ? parseNumericToken(totalToken) : null;

  return {
    heatmap: days,
    totalContributions: parsedTotal,
  };
}

export async function getGitHubStats(username: string | null | undefined): Promise<GitHubStats | null> {
  const cleanUsername = username?.trim();
  if (!cleanUsername) {
    return null;
  }

  const [userResult, reposFromApi, contributionPayload] = await Promise.all([
    fetchGitHubJsonWithStatus<GitHubUserResponse>(
      `https://api.github.com/users/${encodeURIComponent(cleanUsername)}`
    ),
    fetchOwnedRepos(cleanUsername),
    fetchContributionHeatmap(cleanUsername),
  ]);

  // True not-found case: likely invalid handle.
  if (userResult.status === 404) {
    return null;
  }

  const [profileFallback, languagesFallback] = await Promise.all([
    userResult.data ? Promise.resolve(null) : fetchProfileFallback(cleanUsername),
    reposFromApi === null ? fetchRepoLanguagesFallback(cleanUsername) : Promise.resolve([]),
  ]);

  if (!userResult.data && !profileFallback) {
    return null;
  }

  const user = userResult.data;
  const totalContributions =
    contributionPayload.totalContributions ??
    contributionPayload.heatmap.reduce((sum, day) => sum + day.count, 0);

  const languages =
    reposFromApi === null
      ? languagesFallback
      : buildLanguageDistribution(reposFromApi);

  // Fallback for API failures/rate limits: still return a usable object.
  return {
    username: user?.login || profileFallback?.username || cleanUsername,
    publicRepos:
      user?.public_repos ??
      profileFallback?.publicRepos ??
      (reposFromApi && reposFromApi.length > 0 ? reposFromApi.length : 0),
    followers: user?.followers ?? profileFallback?.followers ?? 0,
    following: user?.following ?? profileFallback?.following ?? 0,
    totalContributions,
    languages,
    heatmap: contributionPayload.heatmap,
  };
}
