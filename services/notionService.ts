import { NotionBlock, Project, ProjectType } from '../types';

const API_BASE = '/api/notion';

type Avatar = { type: 'url' | 'emoji'; value: string };

const fallbackProjects: Project[] = [
  {
    id: 'local-demo-1',
    title: 'Notion integration pending',
    coverImage:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop',
    summary:
      'Set VITE_NOTION_TOKEN and VITE_NOTION_DATABASE_ID in Vercel project settings to load live data.',
    tags: [ProjectType.UI_DESIGN, ProjectType.FRONTEND],
    date: '2026',
    blocks: [
      {
        id: 'local-block-1',
        type: 'paragraph',
        content: 'Live content will appear here after Notion environment variables are configured.',
      },
    ],
    featured: true,
  },
];

const fallbackAvatar: Avatar = {
  type: 'emoji',
  value: '👋',
};

async function safeJson<T>(input: Response): Promise<T | null> {
  try {
    return (await input.json()) as T;
  } catch {
    return null;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE}?action=projects`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.warn(`Projects API failed: ${response.status}`);
      return fallbackProjects;
    }

    const data = await safeJson<{ projects?: Project[] }>(response);
    if (!data?.projects?.length) return fallbackProjects;
    return data.projects;
  } catch (error) {
    console.warn('Could not fetch projects from API:', error);
    return fallbackProjects;
  }
}

export async function getProfileIcon(): Promise<Avatar> {
  try {
    const response = await fetch(`${API_BASE}?action=profile-icon`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return fallbackAvatar;

    const data = await safeJson<{ avatar?: Avatar }>(response);
    return data?.avatar ?? fallbackAvatar;
  } catch (error) {
    console.warn('Could not fetch avatar from API:', error);
    return fallbackAvatar;
  }
}

export function normalizeBlocks(blocks: NotionBlock[]): NotionBlock[] {
  return blocks.filter((block) => block.content?.trim().length || block.metadata?.url);
}
