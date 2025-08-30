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
import FolderWindow from '@/components/content/FolderWindow';

import GameOfLife from "@/components/content/GameOfLife";
import TextFileViewer from "@/components/content/TextFileViewer";
import ImageViewer from "@/components/content/ImageViewer";
import VideoPlayer from "@/components/content/VideoPlayer";
import TodoList from '@/components/content/TodoList/TodoList';
import WeatherApp from '@/components/content/WeatherApp/WeatherApp';
import MediaPlayer from '@/components/content/WebVideo/MediaPlayer';

const generateWindowContent = (file: DesktopFile, openWindow?: (file: DesktopFile) => void): React.ReactNode => {
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
        case FileType.TODO:
            return <TodoList />;
        case FileType.WEATHER:
            return <WeatherApp />;
        case FileType.WEB_VIDEO:
            return <MediaPlayer appName={'Web Video'} videoUrl={''} title={''} description={''} />;
        case FileType.CONTACT:
            return <ContactWindow />;
        case FileType.EDUCATION:
            return <EducationWindow />;
        case FileType.SETTINGS:
            return <SettingsWindow />;
        case FileType.FOLDER:
            return <FolderWindow files={data.children || []} onOpenFile={openWindow!} />;
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
            return <p>Error: File type &ldquo;{type}&rdquo; is not supported.</p>;
    }
};

export default generateWindowContent;  