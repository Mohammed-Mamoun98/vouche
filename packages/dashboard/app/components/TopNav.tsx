"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "../data";
import type { Project } from "../types";

interface TopNavProps {
  activeProject: Project;
  onProjectChange: (project: Project) => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/branches", label: "Branches" },
  { href: "/developers", label: "Developers" },
  { href: "/settings", label: "Settings" },
] as const;

export function TopNav({ activeProject, onProjectChange }: TopNavProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isActive(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  }

  return (
    <nav className="h-[44px] bg-surface border-b border-edge flex items-center px-4 shrink-0 sticky top-0 z-100">
      <Link
        href="/"
        className="flex items-center gap-2 mr-3 cursor-pointer no-underline"
      >
        <div className="w-[22px] h-[22px] bg-accent rounded-[5px] flex items-center justify-center">
          <svg
            viewBox="0 0 12 12"
            fill="none"
            width="12"
            height="12"
            aria-label="vouch logo"
          >
            <path d="M6 1L10.5 4v4L6 11 1.5 8V4L6 1z" fill="#0b0b0b" />
          </svg>
        </div>
        <span className="font-mono text-[13px] font-medium text-text tracking-tight">
          vouch
        </span>
      </Link>

      <div className="w-px h-5 bg-edge mx-3" />

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-edge-strong hover:bg-elevated transition-[border-color,background] duration-150 text-inherit text-[13px] cursor-pointer"
          onClick={() => setShowDropdown((v) => !v)}
        >
          <div
            className="w-[7px] h-[7px] rounded-full"
            style={{ background: activeProject.color }}
          />
          <span className="text-xs font-medium text-text">
            {activeProject.name}
          </span>
          <span className="text-dim text-[10px]">&#9662;</span>
        </button>
        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-elevated border border-edge-strong rounded-lg min-w-[200px] p-1 z-200 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            {PROJECTS.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] cursor-pointer text-xs text-muted hover:bg-subtle hover:text-text w-full text-left border-none ${
                  activeProject.id === project.id ? "text-text" : ""
                }`}
                onClick={() => {
                  onProjectChange(project);
                  setShowDropdown(false);
                }}
              >
                <div
                  className="w-[6px] h-[6px] rounded-full"
                  style={{ background: project.color }}
                />
                {project.name}
                {activeProject.id === project.id && (
                  <span className="ml-auto text-[10px] text-accent">
                    &#10003;
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex items-center gap-0.5 ml-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-2.5 py-1 rounded-md text-xs text-muted cursor-pointer no-underline transition-[color,background] duration-150 whitespace-nowrap ${
              isActive(item.href)
                ? "text-text bg-elevated"
                : "hover:text-text hover:bg-elevated"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div
          className="w-[26px] h-[26px] rounded-full bg-subtle border border-edge-strong flex items-center justify-center text-[11px] font-medium text-muted cursor-pointer overflow-hidden"
          title="You"
        >
          <span>YO</span>
        </div>
      </div>
    </nav>
  );
}
