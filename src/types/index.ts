import { StaticImageData } from "next/image";

export interface Project{
    id: string;
    title: string;
    icon:string ;
    description: string;
    type:'code'|'visual'|'interactive';
    technologies: string[];
    repoUrl?: string;
    demoUrl?: string;
    content: React.ReactNode | string;
}

export interface Window {
  id: string;
  title: string;
  content: React.ReactNode | string;
  minimized: boolean;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}