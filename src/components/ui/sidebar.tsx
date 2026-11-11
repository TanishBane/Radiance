"use client";

import { cn } from "@/lib/utils/cn";
import React, { useState, createContext, useContext, useEffect, useRef } from "react";
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
  const { open, setOpen } = useSidebar();
  return (
    <motion.aside
      aria-label="Primary sidebar dock"
      className={cn(
        "relative h-full hidden md:flex md:flex-col bg-[var(--void)]/95 backdrop-blur-3xl border-r border-white/[0.08] shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)] shrink-0 z-30 transition-[width,padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none will-change-[width] overflow-hidden",
        open ? "w-[260px] px-3.5 py-4" : "w-[68px] px-3.5 py-4",
        className
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {/* Theme Ambient Radial Glass Sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/[0.03] via-transparent to-[var(--accent-c)]/[0.04] pointer-events-none" />
      {/* Optical Right Border Specular Hairline */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        {children as React.ReactNode}
      </div>
    </motion.aside>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const drawerRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Keyboard Escape dismissal, Accessible Focus Trap & Body scroll lock/restore
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Initial focus on close button
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }

      // Accessible Focus Trap: cycle Tab / Shift-Tab within drawer
      if (e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

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
            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation drawer"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={getMotionTransition("drawer", prefersReducedMotion)}
              className={cn(
                "fixed safe-h-screen h-[100dvh] w-[280px] max-w-[85vw] inset-y-0 left-0 bg-gradient-to-b from-[var(--surface-raised)]/98 via-[var(--deep)]/95 to-[var(--void)]/98 backdrop-blur-3xl border-r border-white/[0.10] p-5 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pl-[max(1.5rem,env(safe-area-inset-left,0px))] z-[100] flex flex-col justify-between shadow-[8px_0_36px_rgba(0,0,0,0.7),0_0_30px_-8px_var(--accent-g)] overflow-hidden",
                className
              )}
            >
              {/* Theme Ambient Radial Glass Sheen */}
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/[0.04] via-transparent to-[var(--accent-c)]/[0.05] pointer-events-none" />
              <div className="relative z-10 flex flex-col justify-between h-full w-full">
                <motion.button
                  ref={closeBtnRef}
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.1, rotate: 90 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  className="absolute right-0 top-0 z-50 text-[var(--txt-muted)] hover:text-[var(--txt)] cursor-pointer p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-white/[0.08] transition-colors touch-target shadow-xs"
                  onClick={() => setOpen(false)}
                  aria-label="Close drawer"
                >
                  <IconX className="h-4 w-4" />
                </motion.button>
                {children as React.ReactNode}
              </div>
            </motion.aside>
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
  const { open } = useSidebar();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isPrimary = link.label === "New Chat";

  const content = (
    <div className={cn("flex items-center w-full", open ? "gap-3" : "justify-center")}>
      <div className="shrink-0 flex items-center justify-center">
        {link.icon}
      </div>

      {open && (
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, x: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex items-center justify-between flex-1 min-w-0"
        >
          <span
            className={cn(
              "text-xs font-sans tracking-wide truncate",
              isPrimary
                ? "font-semibold text-[var(--txt)]"
                : link.active
                  ? "font-semibold text-[var(--accent-b)]"
                  : "font-medium text-[var(--txt-dim)] group-hover/sidebar:text-[var(--txt)] transition-colors"
            )}
          >
            {link.label}
          </span>

          {link.badge && (
            <span
              className={cn(
                "ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md border shadow-xs transition-colors shrink-0",
                link.badge === "Local"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-semibold flex items-center gap-1.5"
                  : "bg-[var(--surface)] text-[var(--txt-muted)] border-white/[0.08] group-hover/sidebar:border-[var(--accent)]/30 group-hover/sidebar:text-[var(--accent-b)]"
              )}
            >
              {link.badge === "Local" && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
              {link.badge}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );

  const baseClasses = cn(
    "group/sidebar flex items-center rounded-xl transition-all duration-200 cursor-pointer select-none",
    open ? "w-full h-10 px-2.5" : "w-10 h-10 mx-auto justify-center",
    isPrimary
      ? "bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-b)]/15 to-[var(--accent-c)]/20 hover:from-[var(--accent)]/30 hover:to-[var(--accent-c)]/30 border border-[var(--accent)]/35 hover:border-[var(--accent)]/65 text-[var(--txt)] shadow-[0_0_16px_-4px_var(--accent-g)]"
      : link.active
        ? "bg-white/[0.08] text-[var(--accent-b)] border border-[var(--accent)]/40 shadow-xs"
        : "text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06]",
    className
  );

  if (link.onClick) {
    return (
      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        onClick={link.onClick}
        className={baseClasses}
        title={link.label}
        aria-label={link.label}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.a
      href={link.href || "#"}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={baseClasses}
      title={link.label}
      aria-label={link.label}
    >
      {content}
    </motion.a>
  );
};
