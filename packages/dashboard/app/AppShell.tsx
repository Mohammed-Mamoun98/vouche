"use client";

import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { PROJECTS } from "./data";
import type { Project } from "./types";

const defaultProject = PROJECTS[0] ?? {
  id: "vouch",
  name: "vouch",
  color: "#c8f135",
};

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [activeProject, setActiveProject] = useState<Project>(defaultProject);

  return (
    <div className="h-full flex flex-col">
      <TopNav
        activeProject={activeProject}
        onProjectChange={setActiveProject}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
