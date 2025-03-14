import { StaticImageData } from "next/image";

export type Project = {
  id: string;
  title: string;
  icon: string;
  description: string;
  type: 'code' | 'visual' | 'interactive';
  technologies: string[];
  repoUrl?: string;
  demoUrl?: string;
  content: React.ReactNode;
  parentId?: string | null;
  live_link?: string | null;
};

export type Folder = {
  id: string;
  title: string;
  icon: string;
  items: string[];
  position: { x: number; y: number };
  parentId?: string | null;
};

export type DesktopItem = {
  id: string;
  title: string;
  icon: string;
  type: "project" | "folder";
  position: { x: number; y: number };
  parentId: string | null;
};

export interface Window {
  id: string;
  title: string;
  content: React.ReactNode | string;
  minimized: boolean;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  type?: 'folder' | 'project'| 'defrault';
}