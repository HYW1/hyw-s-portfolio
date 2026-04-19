import React, { useEffect, useRef, useState } from 'react';
import { Project } from './types';
import { getProfileIcon, getProjects } from './services/notionService';
import AIChat from './components/AIChat';
import CustomCursor from './components/CustomCursor';
import ExperienceJourney from './components/ExperienceJourney';
import InteractiveName from './components/InteractiveName';
import NotionRenderer from './components/NotionRenderer';
import ProjectCard from './components/ProjectCard';

const fallbackAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState<{ type: 'url' | 'emoji'; value: string }>({
    type: 'url',
    value: fallbackAvatar,
  });

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const refreshAvatar = async () => {
    try {
      const iconData = await getProfileIcon();
      if (iconData) setAvatar(iconData);
    } catch (error) {
      console.warn('Avatar sync failed:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projectsData, iconData] = await Promise.all([getProjects(), getProfileIcon()]);
        if (projectsData?.length) setProjects(projectsData);
        if (iconData) setAvatar(iconData);
      } catch (error) {
        console.error('Failed to sync with Notion:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const handleFocus = () => refreshAvatar();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        const isBurger = (target as HTMLElement).closest('.burger-btn');
        if (!isBurger) setMobileMenuOpen(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedProject || showContact || mobileMenuOpen ? 'hidden' : 'auto';
  }, [selectedProject, showContact, mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const getProjectLayout = (index: number) => {
    const isRightColumn = index % 2 !== 0;
    return {
      className: `col-span-12 md:col-span-6 ${isRightColumn ? 'md:mt-32' : ''}`,
      delay: index * 100,
    };
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg font-sans text-primary selection:bg-accent selection:text-white">
      <CustomCursor />

      <nav
        className={`fixed left-0 top-0 z-[100] w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled ? 'border-b border-black/5 bg-white/95 px-6 py-4 backdrop-blur-md lg:px-12' : 'bg-transparent px-6 py-6 lg:px-12'
        }`}
      >
        <div className="relative mx-auto flex max-w-[1800px] items-center justify-between">
          <button
            type="button"
            className="group flex items-center gap-4 text-left"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-transparent bg-black text-sm font-bold text-white transition-transform duration-500 ease-out group-hover:-rotate-12 group-hover:scale-110 group-hover:border-accent group-hover:bg-white group-hover:text-black">
              H
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold uppercase leading-none tracking-tighter">Heyiwen</span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 transition-colors group-hover:text-accent group-hover:opacity-100">
                Portfolio
              </span>
            </div>
          </button>

          <div className="hidden items-center gap-12 md:flex">
            {['Works', 'Contact'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => (item === 'Contact' ? setShowContact(true) : scrollToSection(item.toLowerCase()))}
                className="group relative text-[11px] font-bold uppercase tracking-[0.3em] transition-colors hover:text-accent"
              >
                {item}
                <span className="absolute -bottom-2 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-accent transition-all duration-300 ease-out group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="relative z-[110] md:hidden">
            <button
              type="button"
              className="burger-btn group flex flex-col gap-1.5 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <div className={`h-[2px] w-6 bg-black transition-all duration-500 group-hover:bg-accent ${mobileMenuOpen ? 'translate-y-[7.5px] rotate-45' : ''}`} />
              <div className={`h-[2px] w-6 bg-black transition-all duration-300 group-hover:bg-accent ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <div className={`h-[2px] w-6 bg-black transition-all duration-500 group-hover:bg-accent ${mobileMenuOpen ? '-translate-y-[7.5px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[90] bg-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div ref={mobileMenuRef} className="flex h-full flex-col justify-center gap-12 px-10">
          <div className="space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Navigation</span>
            <nav className="flex flex-col gap-6">
              <button type="button" onClick={() => scrollToSection('works')} className="text-left text-5xl font-bold tracking-tighter transition-colors hover:text-dim">
                Selected Works
              </button>
              <button type="button" onClick={() => { setMobileMenuOpen(false); setShowContact(true); }} className="text-left text-5xl font-bold tracking-tighter transition-colors hover:text-dim">
                Contact
              </button>
            </nav>
          </div>
        </div>
      </div>

      <section className="relative w-full px-6 pb-16 pt-24 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="mb-6 flex animate-reveal items-center gap-4 lg:mb-8">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent lg:text-xs">Creative Experience Designer</h2>
          </div>

          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:gap-14">
            <div className="min-w-0">
              <InteractiveName name="HEYIWEN" />

              <div className="mt-8 grid gap-6 sm:grid-cols-[auto,minmax(0,34rem)] lg:mt-10">
                <div className="border-l-2 border-black/10 pl-5">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-black/35">Role</span>
                  <h3 className="mt-2 whitespace-nowrap text-xl font-bold text-primary lg:text-2xl">UI/UX Designer</h3>
                </div>
                <p className="max-w-xl text-sm font-light leading-relaxed text-dim sm:text-base lg:text-lg">
                  致力于在复杂逻辑中挖掘纯粹直觉，通过细腻的交互叙事与严谨的系统架构，重构数字体验的边界。
                </p>
              </div>
            </div>

            <div className="relative z-20 mx-auto w-[min(72vw,20rem)] animate-fade-up sm:w-[20rem] lg:mx-0 lg:w-full" style={{ animationDelay: '0.45s' }}>
              <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-[radial-gradient(circle_at_70%_20%,rgba(255,62,0,0.2),transparent_45%),linear-gradient(135deg,rgba(0,0,0,0.08),transparent)] blur-2xl" />
              <div className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-[0_28px_90px_rgba(0,0,0,0.16)] ring-1 ring-black/10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 lg:rotate-3 lg:hover:rotate-0">
                <div className="relative h-full overflow-hidden rounded-[1.35rem] bg-surface">
                  {avatar.type === 'url' ? (
                    <img
                      key={avatar.value}
                      src={avatar.value}
                      className="h-full w-full object-cover object-center grayscale brightness-110 contrast-105 transition-all duration-[1s] group-hover:scale-105 group-hover:grayscale-0"
                      alt="HEYIWEN profile"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface text-6xl">{avatar.value}</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-30" />
                </div>

                <div className="absolute -bottom-1 -right-1 flex items-center gap-2 rounded-tl-2xl bg-black px-4 py-3 text-white shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_#FF3E00]" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.24em]">Notion icon synced</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 animate-reveal lg:mt-16" style={{ animationDelay: '0.5s' }}>
            <ExperienceJourney />
          </div>
        </div>
      </section>

      <main id="works" className="relative z-20 bg-white px-6 py-20 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-20 flex items-end justify-between border-b border-black/10 pb-8 lg:mb-28">
            <h2 className="text-4xl font-bold leading-none tracking-tighter lg:text-8xl">
              Selected
              <br />
              <span className="text-dim/20">Works</span>
            </h2>
            <div className="hidden text-right sm:block">
              <span className="block text-3xl font-bold text-accent">2024</span>
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-40">Portfolio Collection</span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[60vh] w-full animate-pulse rounded-[2rem] bg-surface" />
          ) : (
            <div className="grid grid-cols-12 gap-x-6 gap-y-16 lg:gap-x-12 lg:gap-y-0">
              {projects.map((project, index) => {
                const layout = getProjectLayout(index);
                return (
                  <div key={project.id} className={`${layout.className} relative`} style={{ transitionDelay: `${layout.delay}ms` }}>
                    <ProjectCard project={project} onClick={setSelectedProject} index={(index + 1).toString().padStart(2, '0')} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer id="contact-footer" className="relative z-20 border-t border-black/5 bg-bg py-24 lg:py-40">
        <div className="mx-auto max-w-[1800px] px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
            <div>
              <h2 className="mb-12 text-5xl font-bold leading-[0.9] tracking-tighter lg:text-8xl">
                Let's build
                <br />
                <span className="text-dim/20">something real.</span>
              </h2>
              <a href="mailto:heyiwen1109@163.com" className="group inline-block border-b-2 border-black/10 pb-2 font-serif text-2xl italic transition-all duration-300 hover:border-accent lg:text-4xl">
                <span className="transition-colors group-hover:text-accent">heyiwen1109@163.com</span>
              </a>
            </div>
            <div className="flex flex-col justify-end lg:items-end">
              <div className="flex gap-8 lg:gap-16">
                {['ZCOOL', 'BEHANCE', 'LINKEDIN'].map((link) => (
                  <a key={link} href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] transition-colors hover:text-accent">
                    {link}
                  </a>
                ))}
              </div>
              <p className="mt-12 text-[10px] uppercase tracking-[0.2em] text-dim">© 2024 HEYIWEN. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {selectedProject && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-white no-scrollbar">
          <div className="flex min-h-screen flex-col bg-white">
            <div className="pointer-events-none fixed left-0 top-0 z-50 flex w-full items-center justify-between p-6 text-white mix-blend-difference lg:p-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em]">CASE STUDY</div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black"
              >
                <span className="text-lg">×</span>
              </button>
            </div>

            <div className="relative h-[60vh] w-full lg:h-[70vh]">
              <img src={selectedProject.coverImage} className="h-full w-full object-cover grayscale brightness-90" alt="Cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-10 left-6 max-w-4xl text-white lg:bottom-16 lg:left-12">
                <h1 className="mb-6 text-4xl font-bold tracking-tighter lg:text-8xl">{selectedProject.title}</h1>
                <div className="flex items-center gap-4">
                  <span className="rounded-full border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">{selectedProject.date}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">{selectedProject.tags?.join(' / ')}</span>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[1200px] px-6 py-20 lg:px-12 lg:py-32">
              <div className="mb-20 grid grid-cols-1 gap-12 border-b border-black/5 pb-20 lg:grid-cols-12 lg:gap-20">
                <div className="lg:col-span-8">
                  <h3 className="mb-6 text-2xl font-bold text-accent">Overview</h3>
                  <p className="text-lg font-light leading-relaxed text-dim lg:text-xl">{selectedProject.summary}</p>
                </div>
                <div className="space-y-8 border-l border-black/5 pl-8 lg:col-span-4 lg:pl-12">
                  <div>
                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">Year</span>
                    <span className="text-base font-bold">{selectedProject.date}</span>
                  </div>
                  <div>
                    <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">Services</span>
                    <span className="text-base font-bold">UI/UX, Research</span>
                  </div>
                </div>
              </div>
              <div className="mx-auto max-w-4xl">
                <NotionRenderer blocks={selectedProject.blocks} />
              </div>
            </div>

            <button
              type="button"
              className="group relative overflow-hidden bg-primary py-32 text-center text-white"
              onClick={() => setSelectedProject(null)}
            >
              <div className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-500 group-hover:opacity-10" />
              <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.4em] opacity-50">Close Project</span>
              <h2 className="text-4xl font-bold tracking-tighter transition-transform duration-500 group-hover:scale-105 lg:text-6xl">Back to Home</h2>
            </button>
          </div>
        </div>
      )}

      {showContact && (
        <div className="fixed inset-0 z-[150] overflow-hidden bg-black text-white animate-[fadeIn_0.3s_ease-out]">
          <div className="relative flex h-full w-full flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setShowContact(false)}
              className="absolute right-8 top-8 z-[160] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-all hover:bg-white hover:text-black"
            >
              ×
            </button>
            <div className="text-center">
              <span className="mb-8 block text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Inquiries</span>
              <a href="mailto:heyiwen1109@163.com" className="text-4xl font-bold tracking-tighter transition-colors hover:text-dim lg:text-8xl">
                heyiwen1109@163.com
              </a>
            </div>
          </div>
        </div>
      )}

      <AIChat projects={projects} />
    </div>
  );
};

export default App;
