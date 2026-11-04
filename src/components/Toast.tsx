import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { CheckCircle2, Info, Heart, X } from 'lucide-react';

export type ToastType = 'welcome' | 'info' | 'success' | 'heart';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  welcome: Heart,
  info: Info,
  success: CheckCircle2,
  heart: Heart,
};

const COLORS: Record<ToastType, string> = {
  welcome: 'bg-orange',
  info: 'bg-forest',
  success: 'bg-forest',
  heart: 'bg-orange',
};

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed right-4 top-20 z-[120] flex flex-col gap-3 sm:right-6 sm:top-24">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const duration = toast.duration ?? 4000;
  const Icon = ICONS[toast.type];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={isMobile ? { opacity: 0, y: 60, x: 0 } : { opacity: 0, x: 100, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={isMobile ? { opacity: 0, y: 60 } : { opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`pointer-events-auto flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-white/40 bg-white/80 p-4 shadow-float backdrop-blur-xl ${
        isMobile ? 'fixed bottom-4 left-4 right-4' : ''
      }`}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${COLORS[toast.type]}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </motion.div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-dark">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-xs text-dark/60">{toast.message}</p>}
      </div>
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-full bg-orange"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-dark/30 transition hover:bg-dark/5 hover:text-dark/60"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
