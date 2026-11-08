"use client";

import { cn } from "@/lib/utils/cn";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconX } from "@tabler/icons-react";
import { getMotionTransition } from "@/lib/motion/presets";

export interface SidebarLinkItem {
  label: string;
  href?: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  badge?: string;
}

export interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  const prefersReducedMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      className={cn(
        "relative h-full px-3 py-4 hidden md:flex md:flex-col bg-gradient-to-b from-[var(--surface-raised)]/95 via-[var(--deep)]/90 to-[var(--void)]/95 backdrop-blur-3xl border-r border-white/[0.08] shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5),0_0_20px_-6px_var(--accent-g)] shrink-0 z-30 transition-[background-color,border-color] duration-300 overflow-hidden",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "68px") : "260px",
      }}
      transition={getMotionTransition("drawer", prefersReducedMotion)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {/* Theme Ambient Radial Glass Sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/[0.04] via-transparent to-[var(--accent-c)]/[0.05] pointer-events-none" />
      {/* Optical Right Border Specular Hairline */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--accent-b)]/30 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        {children as React.ReactNode}
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  const prefersReducedMotion = useReducedMotion() ?? false;
  return (
    <div className="md:hidden" {...props}>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={getMotionTransition("interaction", prefersReducedMotion)}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={getMotionTransition("drawer", prefersReducedMotion)}
              className={cn(
                "fixed h-[100dvh] w-[280px] max-w-[85vw] inset-y-0 left-0 bg-gradient-to-b from-[var(--surface-raised)]/95 via-[var(--deep)]/95 to-[var(--void)]/98 backdrop-blur-3xl border-r border-white/[0.10] p-6 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pl-[max(1.5rem,env(safe-area-inset-left,0px))] z-[100] flex flex-col justify-between shadow-[8px_0_36px_rgba(0,0,0,0.7),0_0_30px_-8px_var(--accent-g)] overflow-hidden",
                className
              )}
            >
              {/* Theme Ambient Radial Glass Sheen */}
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/[0.05] via-transparent to-[var(--accent-c)]/[0.06] pointer-events-none" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.1, rotate: 90 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  className="absolute right-0 top-0 z-50 text-[var(--txt-muted)] hover:text-[var(--txt)] cursor-pointer p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-white/[0.08] transition-colors touch-target shadow-xs"
                  onClick={() => setOpen(false)}
                  aria-label="Close drawer"
                >
                  <IconX className="h-4 w-4" />
                </motion.button>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
}: {
  link: SidebarLinkItem;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  const prefersReducedMotion = useReducedMotion() ?? false;

  const content = (
    <>
      <div className="shrink-0">{link.icon}</div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
          x: animate ? (open ? 0 : -4) : 0,
        }}
        transition={getMotionTransition("feedback", prefersReducedMotion)}
        className="text-[var(--txt-dim)] group-hover/sidebar:text-[var(--txt)] text-xs font-medium tracking-wide group-hover/sidebar:translate-x-0.5 transition duration-150 whitespace-pre inline-block !p-0 !m-0 font-sans"
      >
        {link.label}
      </motion.span>

      {link.badge && open && (
        <span
          className={cn(
            "ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md border shadow-xs transition-colors",
            link.badge === "Local"
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-semibold flex items-center gap-1.5"
              : "bg-[var(--surface)]/90 text-[var(--txt-muted)] border-white/[0.08] group-hover/sidebar:border-[var(--accent)]/30 group-hover/sidebar:text-[var(--accent-b)]"
          )}
        >
          {link.badge === "Local" && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          {link.badge}
        </span>
      )}
    </>
  );

  const isPrimary = link.label === "New Chat";
  const baseClasses = cn(
    "flex items-center justify-start gap-3 group/sidebar py-2 px-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none",
    isPrimary
      ? "bg-gradient-to-r from-[var(--accent)]/15 via-[var(--accent-b)]/10 to-[var(--accent-c)]/15 hover:from-[var(--accent)]/25 hover:via-[var(--accent-b)]/20 hover:to-[var(--accent-c)]/25 border border-[var(--accent)]/30 hover:border-[var(--accent)]/60 text-[var(--txt)] shadow-[0_0_16px_-4px_var(--accent-g)] font-semibold"
      : link.active
        ? "bg-gradient-to-r from-[var(--accent-d)] to-transparent text-[var(--accent-b)] border-l-2 border-l-[var(--accent)] border-y-transparent border-r-transparent font-medium shadow-xs"
        : "text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-white/[0.06]",
    className
  );

  if (link.onClick) {
    return (
      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { x: 2, scale: 1.01 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        onClick={link.onClick}
        className={baseClasses}
        title={link.label}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.a
      href={link.href || "#"}
      whileHover={prefersReducedMotion ? undefined : { x: 2, scale: 1.01 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={baseClasses}
      title={link.label}
    >
      {content}
    </motion.a>
  );
};
