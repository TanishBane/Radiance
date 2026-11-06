"use client";

import { cn } from "@/lib/utils/cn";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
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
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-[var(--void)]/85 backdrop-blur-2xl border-r border-[var(--border)] shrink-0 z-30 transition-[background-color,border-color] duration-300",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "64px") : "260px",
      }}
      transition={getMotionTransition("drawer", prefersReducedMotion)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
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
                "fixed h-[100dvh] w-[280px] max-w-[85vw] inset-y-0 left-0 bg-[var(--void)]/95 backdrop-blur-2xl border-r border-[var(--border)] p-6 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pl-[max(1.5rem,env(safe-area-inset-left,0px))] z-[100] flex flex-col justify-between shadow-2xl",
                className
              )}
            >
              <button
                type="button"
                className="absolute right-4 top-4 z-50 text-[var(--txt-muted)] hover:text-[var(--txt)] cursor-pointer p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--surface-hover)] transition-colors touch-target"
                onClick={() => setOpen(false)}
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
              {children}
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
  ...props
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
        }}
        transition={getMotionTransition("feedback", prefersReducedMotion)}
        className="text-[var(--txt-dim)] group-hover/sidebar:text-[var(--txt)] text-xs font-medium tracking-wide group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>

      {link.badge && open && (
        <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-d)] text-[var(--accent)] border border-[var(--accent)]/30">
          {link.badge}
        </span>
      )}
    </>
  );

  const baseClasses = cn(
    "flex items-center justify-start gap-3 group/sidebar py-2 px-2 rounded-xl transition-all duration-200 cursor-pointer select-none",
    link.active
      ? "bg-[var(--accent-d)] text-[var(--accent)] border border-[var(--accent)]/30 shadow-sm"
      : "text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] border border-transparent",
    className
  );

  if (link.onClick) {
    return (
      <button
        type="button"
        onClick={link.onClick}
        className={baseClasses}
        title={link.label}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={link.href || "#"}
      className={baseClasses}
      title={link.label}
      {...props}
    >
      {content}
    </a>
  );
};
