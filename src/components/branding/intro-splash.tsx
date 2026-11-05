"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RadianceLogo } from "./radiance-logo";

export function IntroSplash({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9000] flex flex-col items-center justify-center bg-[var(--void)] pointer-events-none"
        >
          {/* Letterbox Bars */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 left-0 right-0 h-[12vh] bg-[var(--void)] z-10"
          />
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-0 right-0 h-[12vh] bg-[var(--void)] z-10"
          />

          {/* Logo & Tagline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <div className="text-[var(--accent)] drop-shadow-[0_4px_28px_rgba(0,0,0,0.8)] mb-1">
              <RadianceLogo
                variant="symbol"
                size="hero"
                showWordmark={false}
                animated
                glow
                className="w-24 h-21 text-[var(--accent)]"
              />
            </div>
            <div className="font-serif text-2xl md:text-3xl tracking-[0.24em] font-bold uppercase text-[var(--txt)]">
              RADIANCE
            </div>
            <div className="font-serif italic text-xs tracking-wider text-[var(--txt-dim)]">
              Illuminate what is possible
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
