import React from 'react';

interface InteractiveNameProps {
  name: string;
}

const InteractiveName: React.FC<InteractiveNameProps> = ({ name }) => {
  const alternates = ['何', '艺', '文', '·', 'H', 'Y', 'W'];

  return (
    <div className="interactive-name group relative isolate w-full max-w-full select-none" aria-label={name}>
      <style>{`
        .interactive-name__word {
          background-image:
            repeating-linear-gradient(112deg, rgba(5,5,5,0.92) 0 1px, rgba(5,5,5,0.28) 1px 2px, transparent 2px 7px),
            linear-gradient(92deg, #050505 0%, #050505 35%, #ff3e00 48%, #050505 70%, #050505 100%);
          background-size: 18px 100%, 220% 100%;
          background-position: 0 0, 0 0;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 22px 70px rgba(0, 0, 0, 0.08);
          transition: background-position 900ms cubic-bezier(0.22, 1, 0.36, 1), filter 700ms ease, letter-spacing 700ms ease;
        }

        .interactive-name:hover .interactive-name__word {
          background-position: 72px 0, 100% 0;
          filter: saturate(1.15);
          letter-spacing: -0.085em;
        }

        .interactive-name__glyph-default,
        .interactive-name__glyph-alt {
          transition: opacity 420ms ease, transform 620ms cubic-bezier(0.22, 1, 0.36, 1), filter 420ms ease;
        }

        .interactive-name__glyph-alt {
          color: #ff3e00;
          opacity: 0;
          transform: translateY(0.42em) rotateX(-72deg);
          filter: blur(8px);
        }

        .interactive-name:hover .interactive-name__glyph-default {
          opacity: 0;
          transform: translateY(-0.36em) rotateX(72deg);
          filter: blur(8px);
        }

        .interactive-name:hover .interactive-name__glyph-alt {
          opacity: 1;
          transform: translateY(0) rotateX(0deg);
          filter: blur(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .interactive-name__word,
          .interactive-name__glyph-default,
          .interactive-name__glyph-alt {
            transition: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -inset-x-3 bottom-[4%] -z-10 h-[32%] rounded-full bg-[linear-gradient(90deg,rgba(255,62,0,0.15),rgba(5,5,5,0.04),rgba(255,62,0,0.12))] blur-2xl opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
      <h1 className="interactive-name__word flex max-w-full flex-wrap items-end text-[clamp(4.4rem,18vw,13.5rem)] font-black uppercase leading-[0.78] tracking-[-0.07em]">
        {name.split('').map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="relative inline-block [perspective:800px]"
            style={{ transitionDelay: `${index * 42}ms` }}
          >
            <span className="interactive-name__glyph-default inline-block">{letter}</span>
            <span className="interactive-name__glyph-alt absolute inset-0 inline-block">
              {alternates[index % alternates.length]}
            </span>
          </span>
        ))}
      </h1>
      <div className="mt-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.38em] text-black/35 transition-colors duration-500 group-hover:text-accent">
        <span className="h-px w-10 bg-current" />
        Hover to translate identity
      </div>
    </div>
  );
};

export default InteractiveName;
