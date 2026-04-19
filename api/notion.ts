const NOTION_API_VERSION = '2022-06-28';
const NOTION_BASE = 'https://api.notion.com/v1';
const DEFAULT_PROFILE_PAGE_ID = '306c8f7e494f80fe9e07db59d9d4005f';

const token = readEnv('NOTION_TOKEN', 'NOTION_API_KEY', 'NOTION_SECRET', 'VITE_NOTION_TOKEN', 'REACT_APP_NOTION_TOKEN');
const databaseId = readEnv('NOTION_DATABASE_ID', 'VITE_NOTION_DATABASE_ID', 'REACT_APP_NOTION_DATABASE_ID');
const profilePageId = readEnv('NOTION_PROFILE_PAGE_ID', 'VITE_NOTION_PROFILE_PAGE_ID', 'REACT_APP_NOTION_PROFILE_PAGE_ID') || DEFAULT_PROFILE_PAGE_ID;
const databaseTitleProperty = readEnv('NOTION_TITLE_PROPERTY') || 'Title';
const databaseSummaryProperty = readEnv('NOTION_SUMMARY_PROPERTY') || 'Summary';
const databaseDateProperty = readEnv('NOTION_DATE_PROPERTY') || 'Date';
const databaseCoverProperty = readEnv('NOTION_COVER_PROPERTY') || 'Cover';
const databaseTagsProperty = readEnv('NOTION_TAGS_PROPERTY') || 'Tags';
const databaseFeaturedProperty = readEnv('NOTION_FEATURED_PROPERTY') || 'Featured';
const databasePublishedProperty = readEnv('NOTION_PUBLISHED_PROPERTY') || 'Published';

type Avatar = { type: 'url' | 'emoji'; value: string };

type NotionBlock = {
  id: string;
  type: 'paragraph' | 'heading_1' | 'heading_2' | 'image' | 'bullet_list';
  content: string;
  metadata?: {
    url?: string;
    caption?: string;
  };
};

type Project = {
  id: string;
  title: string;
  coverImage: string;
  summary: string;
  tags: string[];
  date: string;
  blocks: NotionBlock[];
  featured?: boolean;
};

type VercelLikeRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelLikeResponse = {
  status: (code: number) => VercelLikeResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

function normalizeEnvValue(value: string) {
  return value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .trim()
    .replace(/^authorization:\s*bearer\s+/i, '')
    .replace(/^bearer\s+/i, '')
    .trim();
}

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key] ? normalizeEnvValue(process.env[key] || '') : undefined;
    if (value) return value;
  }

  return undefined;
}

function readRichText(richText?: Array<{ plain_text?: string }>): string {
  return richText?.map((item) => item.plain_text || '').join('').trim() || '';
}

function readPropertyText(property: any): string {
  if (!property) return '';
  if (property.type === 'title') return readRichText(property.title);
  if (property.type === 'rich_text') return readRichText(property.rich_text);
  if (property.type === 'select') return property.select?.name || '';
  if (property.type === 'status') return property.status?.name || '';
  if (property.type === 'url') return property.url || '';
  if (property.type === 'email') return property.email || '';
  if (property.type === 'number') return property.number?.toString() || '';
  if (property.type === 'date') return property.date?.start || '';
  return '';
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

  return readPropertyText(titleProp) || 'Untitled project';
}

function readSummary(properties: Record<string, any>): string {
  const summaryProp = findFirstExistingProperty(properties, [
    databaseSummaryProperty,
    'Summary',
    'Description',
    '摘要',
    '简介',
  ]);

  return readPropertyText(summaryProp);
}

function readDate(properties: Record<string, any>, createdTime: string): string {
  const dateProp = findFirstExistingProperty(properties, [
    databaseDateProperty,
    'Date',
    'Timeline',
    '日期',
    '时间',
    'Year',
  ]);

  const dateRaw = readPropertyText(dateProp) || createdTime;
  return typeof dateRaw === 'string' ? dateRaw.slice(0, 10) : 'N/A';
}

function readCoverImage(page: any, properties: Record<string, any>) {
  const fallback = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop';
  const coverProp = findFirstExistingProperty(properties, [
    databaseCoverProperty,
    'Cover',
    '封面',
    'Image',
    'Photo',
  ]);

  const coverFile = coverProp?.files?.[0];
  if (coverFile?.type === 'external') return coverFile.external?.url || fallback;
  if (coverFile?.type === 'file') return coverFile.file?.url || fallback;
  if (page?.cover?.type === 'external') return page.cover.external?.url || fallback;
  if (page?.cover?.type === 'file') return page.cover.file?.url || fallback;
  return fallback;
}

function mapSelectArray(options?: Array<{ name?: string }>): string[] {
  if (!options?.length) return ['UI 设计'];

  const aliases: Record<string, string> = {
    UI: 'UI 设计',
    UX: '用户体验研究',
    Branding: '品牌设计',
    '品牌设计': '品牌设计',
    Frontend: '前端开发',
  };

  return options.map((option) => {
    const name = option.name?.trim() || 'UI 设计';
    return aliases[name] || name;
  });
}

function shouldPublish(properties: Record<string, any>) {
  const property = findFirstExistingProperty(properties, [
    databasePublishedProperty,
    'Published',
    'Publish',
    'Visible',
    '公开',
    '发布',
  ]);

  if (!property) return true;
  if (property.type === 'checkbox') return property.checkbox;
  if (property.type === 'status') return !['draft', 'hidden', 'archived'].includes(String(property.status?.name || '').toLowerCase());
  return true;
}

function defaultBlocks(summary: string): NotionBlock[] {
  return [
    {
      id: 'summary-block',
      type: 'paragraph',
      content: summary || 'No summary provided.',
    },
  ];
}

async function notionFetch(path: string, options: RequestInit = {}) {
  if (!token) {
    throw new Error('NOTION_TOKEN is missing. Configure it in Vercel Project Settings > Environment Variables.');
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
    const hint = response.status === 401
      ? ' Check that NOTION_TOKEN is the Internal Integration Secret, not the integration id or database id.'
      : '';
    throw new Error(`Notion API ${response.status}: ${text}${hint}`);
  }

  return response.json();
}

function mapBlock(block: any): NotionBlock | null {
  if (block.type === 'paragraph') {
    return { id: block.id, type: 'paragraph', content: readRichText(block.paragraph?.rich_text) };
  }

  if (block.type === 'heading_1') {
    return { id: block.id, type: 'heading_1', content: readRichText(block.heading_1?.rich_text) };
  }

  if (block.type === 'heading_2' || block.type === 'heading_3') {
    return { id: block.id, type: 'heading_2', content: readRichText(block[block.type]?.rich_text) };
  }

  if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
    return { id: block.id, type: 'bullet_list', content: readRichText(block[block.type]?.rich_text) };
  }

  if (block.type === 'image') {
    const url = block.image?.type === 'external' ? block.image.external?.url : block.image?.file?.url;
    return {
      id: block.id,
      type: 'image',
      content: readRichText(block.image?.caption),
      metadata: {
        url,
        caption: readRichText(block.image?.caption),
      },
    };
  }

  return null;
}

async function fetchBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const query = new URLSearchParams({ page_size: '100' });
    if (cursor) query.set('start_cursor', cursor);

    const data = await notionFetch(`/blocks/${pageId}/children?${query.toString()}`);
    const nextBlocks = Array.isArray(data.results)
      ? data.results.map(mapBlock).filter((block: NotionBlock | null): block is NotionBlock => Boolean(block?.content?.trim() || block?.metadata?.url))
      : [];

    blocks.push(...nextBlocks);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

async function fetchProjects(): Promise<Project[]> {
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID is missing. Configure it in Vercel Project Settings > Environment Variables.');
  }

  const data = await notionFetch(`/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 50 }),
  });

  const results = Array.isArray(data.results) ? data.results : [];
  const publishedResults = results.filter((item: any) => shouldPublish(item.properties || {}));

  const projects = await Promise.all(
    publishedResults.map(async (item: any): Promise<Project> => {
      const properties = item.properties || {};
      const title = readTitle(properties);
      const summary = readSummary(properties);
      const date = readDate(properties, item.created_time);
      const coverImage = readCoverImage(item, properties);
      const tagsProp = findFirstExistingProperty(properties, [databaseTagsProperty, 'Tags', '标签']);
      const featuredProp = findFirstExistingProperty(properties, [databaseFeaturedProperty, 'Featured', '推荐', '首页精选']);
      const blocks = await fetchBlocks(item.id).catch(() => defaultBlocks(summary));

      return {
        id: item.id,
        title,
        summary,
        date,
        coverImage,
        tags: mapSelectArray(tagsProp?.multi_select),
        blocks: blocks.length ? blocks : defaultBlocks(summary),
        featured: featuredProp?.type === 'checkbox' ? Boolean(featuredProp.checkbox) : false,
      };
    }),
  );

  return projects.sort((left, right) => {
    if (left.featured !== right.featured) return left.featured ? -1 : 1;
    return right.date.localeCompare(left.date);
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
  res.setHeader('Cache-Control', 'no-store, max-age=0');

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
