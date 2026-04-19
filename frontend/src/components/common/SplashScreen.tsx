import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { useEffect } from 'react';

export default function SplashScreen() {
  const { splashDone, setSplashDone } = useUIStore();

  useEffect(() => {
    if (!splashDone) {
      const timer = setTimeout(() => setSplashDone(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [splashDone, setSplashDone]);

  return (
    <AnimatePresence>
      {!splashDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[400] bg-primary flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <h1 className="font-display text-7xl text-primary-foreground tracking-[0.05em]">
              TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mt-2">
              STREETWEAR.
            </p>
            <div className="mt-8 w-7 h-7 border-2 border-highlight/25 border-t-highlight animate-spin-slow" style={{ borderRadius: '50%' }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
