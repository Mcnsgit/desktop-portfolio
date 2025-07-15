// src/utils/windowContentGenerator.tsx
import React from 'react';
import { DesktopFile, FileType } from "@/types/fs";
import { Project } from "@/types/project";

// Import all your window content components
import WebsiteViewer from "@/components/content/WebsiteViewer";
import AboutWindow from '@/components/content/AboutWindow';
import ContactWindow from '@/components/content/ContactWindow';
import EducationWindow from '@/components/content/EducationWindow';
import SettingsWindow from '@/components/content/SettingsWindow';
import ProjectWindow from '@/components/content/ProjectWindow';

import GameOfLife from "@/components/content/GameOfLife";
import TextFileViewer from "@/components/content/TextFileViewer";
import ImageViewer from "@/components/content/ImageViewer";
import VideoPlayer from "@/components/content/VideoPlayer";

const generateWindowContent = (file: DesktopFile): React.ReactNode => {
    const { type, data } = file;
    switch (type) {
        case FileType.TEXT:
            return <TextFileViewer content={data.content as string} />;
        case FileType.IMAGE:
            return <ImageViewer src={data.url!} />
        case FileType.IFRAME:
            return <WebsiteViewer url={data.url!} />
        case FileType.VIDEO:
            return <VideoPlayer src={data.url!} />;
        case FileType.COMPONENT:
            const Component = data.component!;
            return <Component {...data.props} />;
        case FileType.ABOUT:
            return <AboutWindow />;
        case FileType.CONTACT:
            return <ContactWindow />;
        case FileType.EDUCATION:
            return <EducationWindow />;
        case FileType.SETTINGS:
            return <SettingsWindow />;
        case FileType.COMPONENT:
            return <GameOfLife />;
        case FileType.PROJECT:
            const project: Project = {
                id: file.id,
                title: file.name,
                type: 'visual',
                technologies: data.technologies || [],
                description: data.description || '',
                repoUrl: data.repoUrl,
                demoUrl: data.demoUrl,
                image: data.image,
                content: data.content,
            };
            return <ProjectWindow project={project} />;
        default:
            return <p>Error: File type "{type}" is not supported.</p>;
    }
};

export default generateWindowContent;  