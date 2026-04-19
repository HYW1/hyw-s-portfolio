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
      className="group block w-full text-left [perspective:1200px]"
      aria-label={`Open project ${project.title}`}
    >
      <article className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-3 group-hover:rotate-[0.35deg] group-hover:border-accent/45 group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.16)]">
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/50 to-transparent" />
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover grayscale transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-30" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white">
            <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-md">
              {index}
            </span>
            <span className="translate-x-4 text-[10px] font-bold uppercase tracking-[0.25em] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
              View Case
            </span>
          </div>
        </div>

        <div className="relative z-20 space-y-4 p-6 lg:p-7">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-dim">
            <span>{project.tags?.[0] ?? 'Case Study'}</span>
            <span>{project.date}</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight transition-colors duration-300 group-hover:text-accent">
              {project.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-dim">{project.summary}</p>
          </div>
          <div className="h-px w-12 bg-black/10 transition-all duration-500 group-hover:w-24 group-hover:bg-accent" />
        </div>
      </article>
    </button>
  );
};

export default ProjectCard;
