import React, { JSX } from "react";
import { StaticImageData } from "next/image";

export enum FileType {
    TEXT = 'text',
    DOCUMENT = 'document',
    RECENT = 'recent',
    FAVORITE = 'favorite',
    PROGRAM = 'program',
    IFRAME = 'iframe',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    COMPONENT = 'component',
    MARKDOWN = 'markdown',
    HTML = 'html',
    CSS = 'css',
    JS = 'js',
    JSON = 'json',
    XML = 'xml',
    YAML = 'yaml',
    PDF = 'pdf',
    EXE = 'exe',
    ZIP = 'zip',
    RAR = 'rar',
    PROJECT = 'project',
    CONTACT = 'contact',
    EDUCATION = 'education',
    SETTINGS = 'settings',
    ABOUT = 'about',
    PORTFOLIO = 'portfolio',
    SEPARATOR = 'separator',
    FOLDER = 'folder',    
}

 export interface DesktopFile {
    id: string;
    name: string;
    icon: string;
    type: FileType;
    x: number;
    y: number;
    data: {
        url?: string;
        content?: string | React.ReactNode;
        component?: () => JSX.Element;
        iframe?: () => JSX.Element;
        props?: Record<string, any>;
        children?: DesktopFile[];
        technologies?: string[];
        description?: string;
        demoUrl?: string;
        repoUrl?: string;
        image?: string | StaticImageData;
        folderId?: string;
        separator?: boolean;
    }
  
 }