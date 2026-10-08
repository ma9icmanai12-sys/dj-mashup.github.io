import React, { useRef, useState, useEffect } from 'react';

interface ScrollingSongTitleProps {
  title: string;
  className?: string;
  subTitle?: string;
  autoScroll?: boolean;
}

export const ScrollingSongTitle: React.FC<ScrollingSongTitleProps> = ({
  title,
  className = '',
  subTitle,
  autoScroll = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState('0px');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth) {
          setShouldScroll(true);
          const diff = textWidth - containerWidth + 24; // extra padding
          setScrollDistance(`-${diff}px`);
        } else {
          setShouldScroll(false);
          setScrollDistance('0px');
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title]);

  const isInstrumental = /instrumental|backing\s+track|karaoke/i.test(title);
  const isAccapella = /acc?app?ella|vocals?\s+only|isolated/i.test(title);

  return (
    <div
      ref={containerRef}
      className={`scrolling-title-container overflow-hidden relative max-w-full group/title ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
    >
      <div
        className="flex items-center gap-1.5 transition-transform"
        style={
          shouldScroll && autoScroll
            ? ({
                '--marquee-distance': scrollDistance,
              } as React.CSSProperties)
            : undefined
        }
      >
        <span
          ref={textRef}
          className={`font-mono text-white whitespace-nowrap text-xs sm:text-sm font-bold ${
            shouldScroll && autoScroll
              ? isHovered
                ? 'scrolling-title-inner'
                : 'scrolling-title-inner'
              : 'truncate'
          }`}
        >
          {title}
        </span>

        {/* Stem Badges */}
        {isInstrumental && (
          <span className="shrink-0 text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            INST
          </span>
        )}
        {isAccapella && (
          <span className="shrink-0 text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            ACAP
          </span>
        )}
      </div>

      {subTitle && (
        <div className="text-[10px] text-neutral-400 truncate mt-0.5">
          {subTitle}
        </div>
      )}
    </div>
  );
};
