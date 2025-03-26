// types.ts
import { StaticImageData } from "next/image";
import React from "react";

export type Project = {
  id: string;
  title: string;
  icon: string;
  description: string;
  type: "code" | "visual" | "interactive";
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

// Define specific content type interfaces
export interface AboutContent {
  type: "about";
}

export interface TextEditorContent {
  type: "texteditor";
  filePath?: string;
}

export interface ImageViewerContent {
  type: "imageviewer";
  filePath?: string;
}

export interface FileExplorerContent {
  type: "fileexplorer";
  initialPath?: string;
}

export interface WeatherAppContent {
  type: "weatherapp";
}

export interface ProjectContent {
  type: "project";
  projectId?: string;
  description?: string;
  technologies?: string[];
  repoUrl?: string;
  demoUrl?: string;
}

export interface FolderContent {
  type: "folder";
  folderId: string;
}

export interface ContactContent {
  type: "contact";
}

// Settings content
export interface SettingsContent {
  type: "settings";
  section?: "display" | "sound" | "general";
}

// Union type for all window content types
export type WindowContent =
  | AboutContent
  | TextEditorContent
  | ImageViewerContent
  | FileExplorerContent
  | WeatherAppContent
  | ProjectContent
  | FolderContent
  | ContactContent
  | SettingsContent
  | string
  | Record<string, any>;

// Window type
export interface Window {
  id: string;
  title: string;
  content: WindowContent;
  minimized: boolean;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  type?:
    | "folder"
    | "project"
    | "about"
    | "fileexplorer"
    | "imageviewer"
    | "texteditor"
    | "weatherapp"
    | "contact"
    | "skills"
    | "settings";
}
