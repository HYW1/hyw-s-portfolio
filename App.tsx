
import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectType } from './types';
import { getProjects, getProfileIcon } from './services/notionService';
import ProjectCard from './components/ProjectCard';
import NotionRenderer from './components/NotionRenderer';
import AIChat from './components/AIChat';
import CustomCursor from './components/CustomCursor';
import ExperienceJourney from './components/ExperienceJourney';
import InteractiveName from './components/InteractiveName';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [avatar, setAvatar] = useState<{ type: 'url' | 'emoji', value: string }>({ 
    type: 'url', 
    value: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop" 
  });
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const refreshAvatar = async () => {
    try {
      const iconData = await getProfileIcon();
      if (iconData) setAvatar(iconData);
    } catch (e) {
      console.warn("Avatar sync failed:", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projectsData, iconData] = await Promise.all([
            getProjects(),
            getProfileIcon()
        ]);
        
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
        }
        if (iconData) setAvatar(iconData);
      } catch (error) {
        console.error("Failed to sync with Notion:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const onFocus = () => refreshAvatar();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        const isBurger = (target as HTMLElement).closest('.burger-btn');
        if (!isBurger) setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('focus', onFocus);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 布局逻辑：严格的双列，右侧列下沉错位
  const getProjectLayout = (index: number) => {
    const isRightColumn = index % 2 !== 0;
    return { 
      // 移动端全宽，桌面端半宽；右侧列在桌面端增加顶部边距形成错落感
      className: `col-span-12 md:col-span-6 ${isRightColumn ? 'md:mt-32' : ''}`, 
      variant: 'normal' as const, 
      delay: index * 100 
    };
  };

  useEffect(() => {
    if (selectedProject || showContact || mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [selectedProject, showContact, mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen selection:bg-accent selection:text-white bg-bg font-sans text-primary relative overflow-x-hidden">
      <CustomCursor />
      
      {/* Navbar - 已移除 About */}
      <nav 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled ? 'py-4 px-6 lg:px-12 bg-white/95 backdrop-blur-md border-b border-black/5' : 'py-6 px-6 lg:px-12 bg-transparent'
        }`}
      >
        <div className="max-w-[1800px] mx-auto flex justify-between items-center relative">
          <div 
            className="flex items-center gap-4 group cursor-pointer" 
            onClick={() => {
              window.scrollTo({top: 0, behavior: 'smooth'});
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-sm rounded-full transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12 border-2 border-transparent group-hover:border-accent group-hover:bg-white group-hover:text-black">H</div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tighter leading-none uppercase">Heyiwen</span>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-40 mt-1 group-hover:text-accent group-hover:opacity-100 transition-colors">Portfolio</span>
            </div>
          </div>

          <div className="hidden md:flex gap-12 items-center">
            {['Works', 'Contact'].map((item) => (
               <button 
                  key={item}
                  onClick={() => item === 'Contact' ? setShowContact(true) : scrollToSection(item.toLowerCase())} 
                  className="text-[11px] font-bold tracking-[0.3em] hover:text-accent transition-colors relative group uppercase"
               >
                 {item}
                 <span className="absolute -bottom-2 left-1/2 w-0 h-[2px] bg-accent transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-full"></span>
               </button>
            ))}
          </div>

          <div className="md:hidden relative z-[110]">
            <button className="burger-btn flex flex-col gap-1.5 p-2 group" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
              <div className={`w-6 h-[2px] bg-black transition-all duration-500 group-hover:bg-accent ${mobileMenuOpen ? 'rotate-45 translate-y-[7.5px]' : ''}`}></div>
              <div className={`w-6 h-[2px] bg-black transition-all duration-300 group-hover:bg-accent ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-[2px] bg-black transition-all duration-500 group-hover:bg-accent ${mobileMenuOpen ? '-rotate-45 -translate-y-[7.5px]' : ''}`}></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-[90] bg-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="h-full flex flex-col justify-center px-10 gap-12" ref={mobileMenuRef}>
            <div className="space-y-6">
                <span className="text-[10px] font-bold tracking-[0.4em] text-accent uppercase">Navigation</span>
                <nav className="flex flex-col gap-6">
                    <button onClick={() => scrollToSection('works')} className="text-5xl font-bold tracking-tighter text-left hover:text-dim transition-colors">Selected Works</button>
                    <button onClick={() => { setMobileMenuOpen(false); setShowContact(true); }} className="text-5xl font-bold tracking-tighter text-left hover:text-dim transition-colors">Contact</button>
                </nav>
            </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full pt-24 lg:pt-32 px-6 lg:px-12 pb-12 lg:pb-20">
        <div className="max-w-[1800px] mx-auto w-full relative">
            
            {/* Top Label */}
            <div className="mb-4 lg:mb-6 animate-reveal flex items-center gap-4">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <h2 className="text-[10px] lg:text-xs font-bold tracking-[0.4em] text-accent uppercase">Creative Experience Designer</h2>
            </div>

            {/* Name + Avatar Row - 紧凑重叠布局 */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center relative z-10 mb-8 lg:mb-10">
                {/* 名字：降低 z-index 允许头像盖在上面，或者提高 z-index 让名字在头像上，这里选择头像盖在名字边缘 */}
                <div className="relative z-10">
                    <InteractiveName name="HEYIWEN" />
                </div>
                
                {/* 
                  Avatar 调整: 
                  1. 尺寸: w-32 lg:w-60 (增大，240px 宽)
                  2. 比例: aspect-[3/4]
                  3. 位置: lg:-ml-20 (调整负边距为-20，比-32往右移了一些), lg:mt-4
                  4. 层级: z-20 (盖在文字上)
                */}
                <div className="relative shrink-0 animate-fade-up z-20 mt-[-20px] ml-[20px] lg:mt-4 lg:-ml-20 pointer-events-none lg:pointer-events-auto" style={{ animationDelay: '0.6s' }}>
                    <div className="relative w-32 lg:w-60 aspect-[3/4] shadow-xl rounded-xl lg:rounded-2xl bg-white ring-4 ring-bg lg:ring-[6px] rotate-6 hover:rotate-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group cursor-pointer">
                        {avatar.type === 'url' ? (
                          <img key={avatar.value} src={avatar.value} className="w-full h-full object-cover grayscale brightness-110 contrast-105 hover:grayscale-0 transition-all duration-[1s] rounded-xl lg:rounded-2xl" alt="HEYIWEN" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface text-4xl lg:text-6xl rounded-xl lg:rounded-2xl">{avatar.value}</div>
                        )}
                        
                        {/* 状态标签 - 迷你版 */}
                        <div className="absolute -bottom-2 -right-4 lg:-bottom-3 lg:-right-6 bg-black text-white py-1 px-2 lg:py-1.5 lg:px-3 rounded-md shadow-lg flex items-center gap-1.5 border border-white/10 group-hover:scale-105 transition-transform">
                             <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_#FF3E00]"></div>
                             <span className="text-[6px] lg:text-[8px] font-bold tracking-widest uppercase whitespace-nowrap">Open</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Introduction & Experience (Grid layout for bottom part) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-start relative">
                <div className="lg:col-span-8 relative z-0">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start animate-reveal" style={{animationDelay: '0.3s'}}>
                       <div className="flex flex-col gap-2 border-l-2 border-black/10 pl-6">
                           <span className="text-[10px] font-bold tracking-[0.3em] opacity-40 uppercase">Role</span>
                           {/* 确保这个标题在第一屏显眼位置 */}
                           <h3 className="text-xl lg:text-2xl font-bold text-primary whitespace-nowrap">UI/UX Designer</h3>
                       </div>
                       <div className="flex flex-col gap-4 max-w-lg">
                           <p className="text-sm lg:text-lg leading-relaxed font-light text-pretty text-dim">
                               致力于在繁复逻辑中挖掘纯粹直觉。通过细腻的交互叙事与严谨的系统架构，重构数字体验的边界。
                           </p>
                       </div>
                    </div>

                    <div className="mt-12 lg:mt-16 animate-reveal" style={{animationDelay: '0.5s'}}>
                        <ExperienceJourney />
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* Selected Works */}
      <main id="works" className="px-6 lg:px-12 py-20 lg:py-32 bg-white relative z-20">
        <div className="max-w-[1800px] mx-auto">
            <div className="flex items-end justify-between border-b border-black/10 pb-8 mb-20 lg:mb-28">
                <h2 className="text-4xl lg:text-8xl font-bold tracking-tighter leading-none">Selected<br/><span className="text-dim/20">Works</span></h2>
                <div className="text-right hidden sm:block">
                    <span className="block text-3xl font-bold text-accent">2024</span>
                    <span className="text-[10px] tracking-[0.3em] opacity-40 uppercase">Portfolio Collection</span>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-[60vh] bg-surface rounded-[2rem] animate-pulse"></div>
            ) : (
              <div className="grid grid-cols-12 gap-x-6 lg:gap-x-12 gap-y-16 lg:gap-y-0">
                {projects.map((project, index) => {
                  const layout = getProjectLayout(index);
                  return (
                      <div 
                        key={project.id} 
                        className={`${layout.className} relative`}
                        style={{ transitionDelay: `${layout.delay}ms` }}
                      >
                        <ProjectCard project={project} onClick={setSelectedProject} index={(index + 1).toString().padStart(2, '0')} />
                      </div>
                  );
                })}
              </div>
            )}
        </div>
      </main>

      {/* Footer */}
      <footer id="contact-footer" className="bg-bg py-24 lg:py-40 border-t border-black/5 relative z-20">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div>
                    <h2 className="text-5xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-12">
                        Let's build<br/>
                        <span className="text-dim/20">something real.</span>
                    </h2>
                    <a 
                        href="mailto:heyiwen1109@163.com" 
                        className="inline-block text-2xl lg:text-4xl font-serif italic border-b-2 border-black/10 hover:border-accent pb-2 transition-all duration-300 group"
                    >
                        <span className="group-hover:text-accent transition-colors">heyiwen1109@163.com</span>
                    </a>
                </div>
                <div className="flex flex-col justify-end lg:items-end">
                    <div className="flex gap-8 lg:gap-16">
                        {['ZCOOL', 'BEHANCE', 'LINKEDIN'].map(link => (
                            <a key={link} href="#" className="text-[10px] font-bold tracking-[0.3em] uppercase hover:text-accent transition-colors">{link}</a>
                        ))}
                    </div>
                    <p className="mt-12 text-[10px] text-dim tracking-[0.2em] uppercase">© 2024 HEYIWEN. All Rights Reserved.</p>
                </div>
            </div>
        </div>
      </footer>
      
      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[120] bg-white overflow-y-auto no-scrollbar">
            <div className="min-h-screen flex flex-col bg-white">
                <div className="fixed top-0 left-0 w-full p-6 lg:p-10 flex justify-between items-center z-50 mix-blend-difference text-white pointer-events-none">
                    <div className="font-bold tracking-[0.2em] uppercase text-[10px]">CASE STUDY</div>
                    <button onClick={() => setSelectedProject(null)} className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300">
                        <span className="text-lg">✕</span>
                    </button>
                </div>
                
                {/* Hero Image */}
                <div className="w-full h-[60vh] lg:h-[70vh] relative">
                    <img src={selectedProject.coverImage} className="w-full h-full object-cover grayscale brightness-90" alt="Cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-10 left-6 lg:left-12 lg:bottom-16 text-white max-w-4xl">
                        <h1 className="text-4xl lg:text-8xl font-bold tracking-tighter mb-6">{selectedProject.title}</h1>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 border border-white/30 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">{selectedProject.date}</span>
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-80">{selectedProject.tags?.join(' / ')}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-[1200px] mx-auto w-full px-6 lg:px-12 py-20 lg:py-32">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-20 border-b border-black/5 pb-20">
                         <div className="lg:col-span-8">
                            <h3 className="text-2xl font-bold mb-6 text-accent">Overview</h3>
                            <p className="text-lg lg:text-xl text-dim font-light leading-relaxed">{selectedProject.summary}</p>
                         </div>
                         <div className="lg:col-span-4 space-y-8 border-l border-black/5 pl-8 lg:pl-12">
                             <div>
                                 <span className="text-[9px] font-bold tracking-[0.3em] text-black/40 uppercase block mb-2">Year</span>
                                 <span className="text-base font-bold">{selectedProject.date}</span>
                             </div>
                             <div>
                                 <span className="text-[9px] font-bold tracking-[0.3em] text-black/40 uppercase block mb-2">Services</span>
                                 <span className="text-base font-bold">UI/UX, Research</span>
                             </div>
                         </div>
                     </div>
                     <div className="max-w-4xl mx-auto">
                        <NotionRenderer blocks={selectedProject.blocks} />
                     </div>
                </div>
                
                {/* Next Project Nav */}
                <div className="py-32 bg-primary text-white text-center cursor-pointer group relative overflow-hidden" onClick={() => setSelectedProject(null)}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-accent transition-opacity duration-500"></div>
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 block opacity-50">Close Project</span>
                    <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter group-hover:scale-105 transition-transform duration-500">Back to Home</h2>
                </div>
            </div>
        </div>
      )}

      {showContact && (
        <div className="fixed inset-0 z-[150] bg-black text-white overflow-hidden animate-[fadeIn_0.3s_ease-out]">
            <div className="h-full w-full flex flex-col relative justify-center items-center">
                <button onClick={() => setShowContact(false)} className="absolute top-8 right-8 z-[160] w-12 h-12 flex items-center justify-center rounded-full border border-white/20 hover:bg-white hover:text-black transition-all">✕</button>
                <div className="text-center">
                    <span className="text-[10px] font-bold tracking-[0.5em] text-accent uppercase mb-8 block">Inquiries</span>
                    <a href="mailto:heyiwen1109@163.com" className="text-4xl lg:text-8xl font-bold tracking-tighter hover:text-dim transition-colors">heyiwen1109@163.com</a>
                </div>
            </div>
        </div>
      )}
      <AIChat projects={projects} />
    </div>
  );
};

export default App;
