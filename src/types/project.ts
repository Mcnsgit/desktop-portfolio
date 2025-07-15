import { StaticImageData } from "next/image";

export interface Project {
    id: string;
    title: string;
    type: string;
    technologies: string[];
    description: string;
    repoUrl?: string;
    demoUrl?: string;
    image?: string | StaticImageData;
    content?: any;
} 