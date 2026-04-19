import React, { useEffect, useRef, useState } from 'react';

const interactiveSelector = 'a, button, [role="button"], input, textarea, select, .cursor-pointer';

const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canUseCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canUseCursor) return;

    document.body.classList.add('custom-cursor-enabled');

    let cursorX = -100;
    let cursorY = -100;
    let ringX = -100;
    let ringY = -100;
    let frame = 0;

    const render = () => {
      ringX += (cursorX - ringX) * 0.18;
      ringY += (cursorY - ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      frame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      setIsVisible(true);
    };

    const updateHoverState = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      setIsHovering(Boolean(target?.closest(interactiveSelector)));
    };

    const hide = () => setIsVisible(false);

    frame = window.requestAnimationFrame(render);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerover', updateHoverState, { passive: true });
    window.addEventListener('pointerout', updateHoverState, { passive: true });
    document.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', updateHoverState);
      window.removeEventListener('pointerout', updateHoverState);
      document.removeEventListener('mouseleave', hide);
      window.removeEventListener('blur', hide);
    };
  }, []);

  return (
    <>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          body.custom-cursor-enabled,
          body.custom-cursor-enabled * {
            cursor: none !important;
          }
        }
      `}</style>
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-[9999] h-10 w-10 rounded-full border border-black/35 mix-blend-difference transition-[opacity,scale,border-color] duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${isHovering ? 'scale-[1.85] border-white/80 bg-white/10' : 'scale-100'}`}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-[10000] h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_22px_rgba(255,62,0,0.85)] transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
};

export default CustomCursor;
