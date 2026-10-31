"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-400 group-hover/sidebar:text-[var(--accent)]" />
      ),
    },
    {
      label: "Profile",
      href: "#",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-400 group-hover/sidebar:text-[var(--accent)]" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-400 group-hover/sidebar:text-[var(--accent)]" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-400 group-hover/sidebar:text-[var(--danger)]" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] md:flex-row",
        "h-[60vh]"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Radiance User",
                href: "#",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-b)] flex items-center justify-center text-xs font-bold text-black">
                    RD
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-[var(--txt)]"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-[var(--accent-b)] to-[var(--accent)] shadow-[0_0_15px_var(--accent-g)]" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium tracking-wide text-xs whitespace-pre text-[var(--txt)] font-mono"
      >
        RADIANCE AI
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-[var(--txt)]"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-gradient-to-br from-[var(--accent-b)] to-[var(--accent)] shadow-[0_0_15px_var(--accent-g)]" />
    </a>
  );
};

// Dashboard preview component
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-tl-2xl border-l border-[var(--border)] bg-[var(--void)] p-4 md:p-8">
        <div className="flex gap-3">
          {[...new Array(4)].map((_, idx) => (
            <div
              key={"first-array-demo-" + idx}
              className="h-20 w-full animate-pulse rounded-xl bg-[var(--surface)] border border-[var(--border)]"
            />
          ))}
        </div>
        <div className="flex flex-1 gap-3">
          {[...new Array(2)].map((_, idx) => (
            <div
              key={"second-array-demo-" + idx}
              className="h-full w-full animate-pulse rounded-xl bg-[var(--surface)] border border-[var(--border)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
