
export enum ProjectType {
  UI_DESIGN = 'UI 设计',
  UX_RESEARCH = '用户体验研究',
  BRANDING = '品牌设计',
  FRONTEND = '前端开发',
}

export interface NotionBlock {
  id: string;
  type: 'paragraph' | 'heading_1' | 'heading_2' | 'image' | 'bullet_list';
  content: string;
  metadata?: {
    url?: string;
    caption?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  coverImage: string;
  summary: string;
  tags: ProjectType[];
  date: string;
  blocks: NotionBlock[]; 
  featured?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isThinking?: boolean;
}
