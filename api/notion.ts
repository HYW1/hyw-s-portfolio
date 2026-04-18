import { NotionBlock, Project, ProjectType } from '../types';

const NOTION_API_VERSION = '2022-06-28';
const NOTION_BASE = 'https://api.notion.com/v1';

const token = process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN || process.env.REACT_APP_NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID || process.env.REACT_APP_NOTION_DATABASE_ID;
const profilePageId = process.env.NOTION_PROFILE_PAGE_ID;
const databaseTitleProperty = process.env.NOTION_TITLE_PROPERTY || 'Title';
const databaseSummaryProperty = process.env.NOTION_SUMMARY_PROPERTY || 'Summary';
const databaseDateProperty = process.env.NOTION_DATE_PROPERTY || 'Date';
const databaseCoverProperty = process.env.NOTION_COVER_PROPERTY || 'Cover';
const databaseTagsProperty = process.env.NOTION_TAGS_PROPERTY || 'Tags';
const databaseFeaturedProperty = process.env.NOTION_FEATURED_PROPERTY || 'Featured';

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

function findFirstExistingProperty(properties: Record<string, any>, candidates: string[]) {
  for (const key of candidates) {
    if (properties?.[key] !== undefined) return properties[key];
  }
  return undefined;
}

function readTitle(properties: Record<string, any>): string {
  const titleProp = findFirstExistingProperty(properties, [
    databaseTitleProperty,
    'Name',
    'Title',
    '标题',
    '项目名称',
  ]);

  return readRichText(titleProp?.title) || 'Untitled project';
}

function readSummary(properties: Record<string, any>): string {
  const summaryProp = findFirstExistingProperty(properties, [
    databaseSummaryProperty,
    'Summary',
    'Description',
    '摘要',
    '简介',
  ]);

  return readRichText(summaryProp?.rich_text);
}

function readDate(properties: Record<string, any>, createdTime: string): string {
  const dateProp = findFirstExistingProperty(properties, [
    databaseDateProperty,
    'Date',
    'Timeline',
    '日期',
    '时间',
  ]);

  const dateRaw = dateProp?.date?.start || createdTime;
  return typeof dateRaw === 'string' ? dateRaw.slice(0, 10) : 'N/A';
}

function readCoverImage(properties: Record<string, any>) {
  const fallback = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop';
  const coverProp = findFirstExistingProperty(properties, [
    databaseCoverProperty,
    'Cover',
    '封面',
    'Image',
  ]);

  const coverFile = coverProp?.files?.[0];
  if (coverFile?.type === 'external') return coverFile.external?.url || fallback;
  if (coverFile?.type === 'file') return coverFile.file?.url || fallback;
  return fallback;
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
    throw new Error('NOTION_DATABASE_ID is missing. Configure it in Vercel Project Settings > Environment Variables.');
  }

  const payload = {
    page_size: 50,
  };

  const data = await notionFetch(`/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const results = Array.isArray(data.results) ? data.results : [];

  return results.map((item: any): Project => {
    const properties = item.properties || {};
    const title = readTitle(properties);
    const summary = readSummary(properties);
    const date = readDate(properties, item.created_time);
    const coverImage = readCoverImage(properties);
    const tagsProp = findFirstExistingProperty(properties, [databaseTagsProperty, 'Tags', '标签']);
    const featuredProp = findFirstExistingProperty(properties, [databaseFeaturedProperty, 'Featured', '推荐']);

    return {
      id: item.id,
      title,
      summary,
      date,
      coverImage,
      tags: mapSelectArray(tagsProp?.multi_select),
      blocks: defaultBlocks(summary),
      featured: Boolean(featuredProp?.checkbox),
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    res.status(200).json({ ok: true });
    return;
  }

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
