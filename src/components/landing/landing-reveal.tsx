"use client";

import { motion, useReducedMotion } from "motion/react";
import { getMotionTransition } from "@/lib/motion/presets";

export function LandingReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -40px 0px" }}
      transition={getMotionTransition("entrance", Boolean(reduce))}
    >
      {children}
    </motion.div>
  );
}
