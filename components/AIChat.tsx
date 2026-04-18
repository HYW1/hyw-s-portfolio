import React from 'react';
import { Project } from '../types';

interface AIChatProps {
  projects: Project[];
}

const AIChat: React.FC<AIChatProps> = ({ projects }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 rounded-full border border-black/15 bg-white/90 px-4 py-2 text-xs font-semibold backdrop-blur">
      AI Chat · {projects.length} projects loaded
    </div>
  );
};

export default AIChat;
