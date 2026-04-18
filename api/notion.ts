import { Project, ProjectType, NotionBlock } from '../types';

const NOTION_API_VERSION = '2022-06-28';
const NOTION_BASE = 'https://api.notion.com/v1';

const token = process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN || process.env.REACT_APP_NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID || process.env.REACT_APP_NOTION_DATABASE_ID;
const profilePageId = process.env.NOTION_PROFILE_PAGE_ID;

type Avatar = { type: 'url' | 'emoji'; value: string };

type VercelLikeRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelLikeResponse = {
  status: (code: number) => VercelLikeResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

function readRichText(richText?: Array<{ plain_text?: string }>): string {
  return richText?.map((item) => item.plain_text || '').join('').trim() || '';
}

function mapSelectArray(options?: Array<{ name?: string }>): ProjectType[] {
  if (!options?.length) return [ProjectType.UI_DESIGN];

  const map: Record<string, ProjectType> = {
    'UI 设计': ProjectType.UI_DESIGN,
    UI: ProjectType.UI_DESIGN,
    '用户体验研究': ProjectType.UX_RESEARCH,
    UX: ProjectType.UX_RESEARCH,
    Branding: ProjectType.BRANDING,
    '品牌设计': ProjectType.BRANDING,
    Frontend: ProjectType.FRONTEND,
    '前端开发': ProjectType.FRONTEND,
  };

  return options
    .map((option) => option.name?.trim() || '')
    .map((name) => map[name] ?? ProjectType.UI_DESIGN);
}

function defaultBlocks(summary: string): NotionBlock[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'paragraph',
      content: summary || 'No summary provided.',
    },
  ];
}

async function notionFetch(path: string, options: RequestInit = {}) {
  if (!token) {
    throw new Error('NOTION_TOKEN is missing.');
  }

  const response = await fetch(`${NOTION_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion API ${response.status}: ${text}`);
  }

  return response.json();
}

async function fetchProjects(): Promise<Project[]> {
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID is missing.');
  }

  const payload = {
    page_size: 50,
    sorts: [{ property: 'Date', direction: 'descending' }],
  };

  const data = await notionFetch(`/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const results = Array.isArray(data.results) ? data.results : [];

  return results.map((item: any): Project => {
    const properties = item.properties || {};
    const title = readRichText(properties?.Title?.title) || 'Untitled project';
    const summary = readRichText(properties?.Summary?.rich_text);
    const dateRaw = properties?.Date?.date?.start || item.created_time;
    const date = typeof dateRaw === 'string' ? dateRaw.slice(0, 10) : 'N/A';

    let coverImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop';
    const coverFile = properties?.Cover?.files?.[0];
    if (coverFile?.type === 'external') coverImage = coverFile.external?.url || coverImage;
    if (coverFile?.type === 'file') coverImage = coverFile.file?.url || coverImage;

    return {
      id: item.id,
      title,
      summary,
      date,
      coverImage,
      tags: mapSelectArray(properties?.Tags?.multi_select),
      blocks: defaultBlocks(summary),
      featured: Boolean(properties?.Featured?.checkbox),
    };
  });
}

async function fetchProfileIcon(): Promise<Avatar> {
  if (!profilePageId) {
    return { type: 'emoji', value: '👋' };
  }

  const page = await notionFetch(`/pages/${profilePageId}`);
  if (page?.icon?.type === 'external') {
    return { type: 'url', value: page.icon.external.url };
  }

  if (page?.icon?.type === 'file') {
    return { type: 'url', value: page.icon.file.url };
  }

  if (page?.icon?.type === 'emoji') {
    return { type: 'emoji', value: page.icon.emoji };
  }

  return { type: 'emoji', value: '👋' };
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const action = Array.isArray(req.query?.action) ? req.query?.action[0] : req.query?.action;

  try {
    if (action === 'profile-icon') {
      const avatar = await fetchProfileIcon();
      res.status(200).json({ avatar });
      return;
    }

    const projects = await fetchProjects();
    res.status(200).json({ projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
