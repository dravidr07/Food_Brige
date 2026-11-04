import { useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface InfoPopoverProps {
  content: ReactNode;
  title?: string;
  children?: ReactNode;
  iconClassName?: string;
  className?: string;
}

/** Animated hover popover that reveals content with a smooth scale + fade transition. */
export function InfoPopover({ content, title, children, iconClassName = '', className = '' }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children ?? (
        <button
          className={`flex h-5 w-5 items-center justify-center rounded-full text-dark/30 transition hover:bg-dark/5 hover:text-forest ${iconClassName}`}
          aria-label="More info"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        >
          <Info className="h-4 w-4" />
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-dark/8 bg-white/90 p-4 shadow-float backdrop-blur-xl">
              {title && (
                <p className="mb-1.5 text-sm font-bold text-dark">{title}</p>
              )}
              <div className="text-xs leading-relaxed text-dark/60">
                {content}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-dark/8 bg-white/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
