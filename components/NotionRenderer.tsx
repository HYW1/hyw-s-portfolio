import React from 'react';
import { NotionBlock } from '../types';

interface NotionRendererProps {
  blocks: NotionBlock[];
}

const NotionRenderer: React.FC<NotionRendererProps> = ({ blocks }) => {
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        if (block.type === 'heading_1') {
          return (
            <h2 key={block.id} className="text-3xl font-bold tracking-tight">
              {block.content}
            </h2>
          );
        }

        if (block.type === 'heading_2') {
          return (
            <h3 key={block.id} className="text-2xl font-semibold tracking-tight">
              {block.content}
            </h3>
          );
        }

        if (block.type === 'image' && block.metadata?.url) {
          return (
            <figure key={block.id} className="space-y-2">
              <img className="w-full rounded-xl" src={block.metadata.url} alt={block.metadata.caption ?? 'Project image'} />
              {block.metadata.caption ? <figcaption className="text-sm text-dim">{block.metadata.caption}</figcaption> : null}
            </figure>
          );
        }

        return (
          <p key={block.id} className="leading-relaxed text-dim">
            {block.content}
          </p>
        );
      })}
    </div>
  );
};

export default NotionRenderer;
