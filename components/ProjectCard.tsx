import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  index: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, index }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(project)}
      className="group block w-full text-left"
      aria-label={`Open project ${project.title}`}
    >
      <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-3 p-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-dim">
            <span>{index}</span>
            <span>{project.date}</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">{project.title}</h3>
          <p className="line-clamp-3 text-sm text-dim">{project.summary}</p>
        </div>
      </article>
    </button>
  );
};

export default ProjectCard;
