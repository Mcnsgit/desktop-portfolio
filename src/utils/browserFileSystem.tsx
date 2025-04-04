// src/utils/browserFileSystem.ts
import projects from "../data/project";

// Simple in-memory file system implementation for browser use
class BrowserFileSystem {
    private files: Map<string, string | Uint8Array>;
    private directories: Set<string>;
    private symlinks: Map<string, string>;
    private isInitialized: boolean;

    constructor() {
        this.files = new Map();
        this.directories = new Set();
        this.symlinks = new Map();
        this.isInitialized = false;

        // Add root directory by default
        this.directories.add('/');
    }

    // Initialize the file system with default structure
    async initialize(persistData: boolean = false): Promise<void> {
        if (this.isInitialized) return;

        try {
            // If persistence is enabled, try to load from localStorage
            if (persistData && typeof localStorage !== 'undefined') {
                try {
                    const savedData = localStorage.getItem('retroos-filesystem');
                    if (savedData) {
                        const parsed = JSON.parse(savedData);
                        this.files = new Map(parsed.files);
                        this.directories = new Set(parsed.directories);
                        this.symlinks = new Map(parsed.symlinks);

                        console.log('Loaded file system from localStorage');
                        this.isInitialized = true;
                        return;
                    }
                } catch (err) {
                    console.warn('Failed to load from localStorage, creating default structure', err);
                }
            }

            // Create default directory structure
            const directoryStructure = [
                "/home",
                "/home/guest",
                "/home/guest/Desktop",
                "/home/guest/Documents",
                "/home/guest/Pictures",
                "/projects",
                "/system",
                "/system/icons",
                "/system/wallpapers",
                "/tmp",
            ];

            for (const dir of directoryStructure) {
                this.mkdirSync(dir);
            }

            // Create README file
            this.writeFileSync(
                "/home/guest/README.txt",
                "Welcome to RetroOS!\n\n" +
                "This is your personal workspace where you can explore projects and create your own files.\n" +
                "Use the File Explorer to browse and manage files, or try the Text Editor to create new documents.\n\n" +
                "Note: Files created in guest mode will not be saved permanently unless you toggle persistence in the settings."
            );

            // Create shortcuts
            this.createShortcuts();

            // Create project files
            this.createProjectFiles();

            this.isInitialized = true;

            // If persistence is enabled, save to localStorage
            if (persistData) {
                this.persistToLocalStorage();
            }

            console.log('File system initialized with default structure');
        } catch (err) {
            console.error('Error initializing file system:', err);
            throw err;
        }
    }

    // Save current file system state to localStorage
    persistToLocalStorage(): boolean {
        try {
            if (typeof localStorage !== 'undefined') {
                const dataToSave = {
                    files: Array.from(this.files.entries())
                        .map(([key, value]) => {
                            // Convert Uint8Array to string for storage
                            if (value instanceof Uint8Array) {
                                return [key, String.fromCharCode(...value)];
                            }
                            return [key, value];
                        }),
                    directories: Array.from(this.directories),
                    symlinks: Array.from(this.symlinks.entries())
                };

                localStorage.setItem('retroos-filesystem', JSON.stringify(dataToSave));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error persisting file system to localStorage:', err);
            return false;
        }
    }

    // Reset the file system (clear all data)
    reset(): void {
        this.files.clear();
        this.directories.clear();
        this.symlinks.clear();
        this.directories.add('/'); // Always keep root
        this.isInitialized = false;

        // Clear localStorage if available
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('retroos-filesystem');
        }
    }

    // Synchronous directory creation
    mkdirSync(path: string, options?: { recursive?: boolean }): void {
        // Normalize path
        path = this.normalizePath(path);

        // Check if directory already exists
        if (this.directories.has(path)) {
            return;
        }

        // Create parent directories if recursive
        if (options?.recursive) {
            const parts = path.split('/').filter(Boolean);
            let currentPath = '';

            for (const part of parts) {
                currentPath += '/' + part;
                if (!this.directories.has(currentPath)) {
                    this.directories.add(currentPath);
                }
            }
        } else {
            // Check if parent directory exists
            const parentDir = path.substring(0, path.lastIndexOf('/'));
            if (parentDir && !this.directories.has(parentDir)) {
                throw new Error(`ENOENT: Parent directory does not exist: ${parentDir}`);
            }

            this.directories.add(path);
        }
    }

    // Check if file or directory exists
    existsSync(path: string): boolean {
        path = this.normalizePath(path);
        return this.directories.has(path) || this.files.has(path) || this.symlinks.has(path);
    }

    // Get file stats
    statSync(path: string): { isDirectory: () => boolean; isSymbolicLink: () => boolean; size: number; mtime: Date } {
        path = this.normalizePath(path);

        if (!this.existsSync(path)) {
            throw new Error(`ENOENT: No such file or directory: ${path}`);
        }

        const isDir = this.directories.has(path);
        const isLink = this.symlinks.has(path);
        const content = this.files.get(path);
        const size = content ? (typeof content === 'string' ? content.length : content.length) : 0;

        return {
            isDirectory: () => isDir,
            isSymbolicLink: () => isLink,
            size,
            mtime: new Date()
        };
    }

    // Get symlink target
    readlinkSync(path: string): string {
        path = this.normalizePath(path);

        if (!this.symlinks.has(path)) {
            throw new Error(`EINVAL: Invalid argument, not a symbolic link: ${path}`);
        }

        return this.symlinks.get(path) || '';
    }

    // Read directory contents
    readdirSync(path: string): string[] {
        path = this.normalizePath(path);

        if (!this.directories.has(path)) {
            throw new Error(`ENOTDIR: Not a directory: ${path}`);
        }

        const result: string[] = [];
        const prefix = path === '/' ? '/' : path + '/';

        // Collect direct children only
        for (const dir of this.directories) {
            if (dir !== path && dir.startsWith(prefix)) {
                const remaining = dir.substring(prefix.length);
                if (!remaining.includes('/')) {
                    result.push(remaining);
                }
            }
        }

        for (const file of this.files.keys()) {
            if (file.startsWith(prefix)) {
                const remaining = file.substring(prefix.length);
                if (!remaining.includes('/')) {
                    result.push(remaining);
                }
            }
        }

        for (const symlink of this.symlinks.keys()) {
            if (symlink.startsWith(prefix)) {
                const remaining = symlink.substring(prefix.length);
                if (!remaining.includes('/')) {
                    result.push(remaining);
                }
            }
        }

        return [...new Set(result)]; // Deduplicate
    }

    // Write file
    writeFileSync(path: string, data: string | Uint8Array): void {
        path = this.normalizePath(path);

        // Ensure parent directory exists
        const parentDir = path.substring(0, path.lastIndexOf('/'));
        if (parentDir && !this.directories.has(parentDir)) {
            throw new Error(`ENOENT: Parent directory does not exist: ${parentDir}`);
        }

        this.files.set(path, data);
    }

    // Read file
    readFileSync(path: string, options?: { encoding?: string }): string | Uint8Array {
        path = this.normalizePath(path);

        // Handle shortcuts (.lnk files)
        if (path.endsWith('.lnk')) {
            if (!this.files.has(path)) {
                throw new Error(`ENOENT: No such file: ${path}`);
            }

            const content = this.files.get(path);
            if (options?.encoding === 'utf8' || typeof content === 'string') {
                return content as string;
            }

            return content as Uint8Array;
        }

        // Check if it's a symbolic link
        if (this.symlinks.has(path)) {
            const target = this.symlinks.get(path) as string;
            return this.readFileSync(target, options);
        }

        if (!this.files.has(path)) {
            throw new Error(`ENOENT: No such file: ${path}`);
        }

        const content = this.files.get(path);
        if (options?.encoding === 'utf8' || typeof content === 'string') {
            return content as string;
        }

        return content as Uint8Array;
    }

    // Delete file
    unlinkSync(path: string): void {
        path = this.normalizePath(path);

        if (this.directories.has(path)) {
            throw new Error(`EISDIR: Is a directory: ${path}`);
        }

        if (!this.files.has(path) && !this.symlinks.has(path)) {
            throw new Error(`ENOENT: No such file: ${path}`);
        }

        if (this.files.has(path)) {
            this.files.delete(path);
        }

        if (this.symlinks.has(path)) {
            this.symlinks.delete(path);
        }
    }

    // Delete directory
    rmdirSync(path: string): void {
        path = this.normalizePath(path);

        if (!this.directories.has(path)) {
            throw new Error(`ENOTDIR: Not a directory: ${path}`);
        }

        // Check if directory is empty
        const prefix = path === '/' ? '/' : path + '/';
        for (const dir of this.directories) {
            if (dir !== path && dir.startsWith(prefix)) {
                throw new Error(`ENOTEMPTY: Directory not empty: ${path}`);
            }
        }

        for (const file of this.files.keys()) {
            if (file.startsWith(prefix)) {
                throw new Error(`ENOTEMPTY: Directory not empty: ${path}`);
            }
        }

        for (const symlink of this.symlinks.keys()) {
            if (symlink.startsWith(prefix)) {
                throw new Error(`ENOTEMPTY: Directory not empty: ${path}`);
            }
        }

        this.directories.delete(path);
    }

    // Rename file or directory
    renameSync(oldPath: string, newPath: string): void {
        oldPath = this.normalizePath(oldPath);
        newPath = this.normalizePath(newPath);

        if (!this.existsSync(oldPath)) {
            throw new Error(`ENOENT: No such file or directory: ${oldPath}`);
        }

        // If it's a directory
        if (this.directories.has(oldPath)) {
            // Create new directory
            this.mkdirSync(newPath);

            // Move all contents
            const prefix = oldPath === '/' ? '/' : oldPath + '/';
            const newPrefix = newPath === '/' ? '/' : newPath + '/';

            // Move subdirectories
            for (const dir of this.directories) {
                if (dir !== oldPath && dir.startsWith(prefix)) {
                    const relativePath = dir.substring(prefix.length);
                    const newDirPath = newPrefix + relativePath;
                    this.mkdirSync(newDirPath, { recursive: true });
                }
            }

            // Move files
            for (const [filePath, content] of this.files.entries()) {
                if (filePath.startsWith(prefix)) {
                    const relativePath = filePath.substring(prefix.length);
                    const newFilePath = newPrefix + relativePath;
                    this.files.set(newFilePath, content);
                    this.files.delete(filePath);
                }
            }

            // Move symlinks
            for (const [linkPath, target] of this.symlinks.entries()) {
                if (linkPath.startsWith(prefix)) {
                    const relativePath = linkPath.substring(prefix.length);
                    const newLinkPath = newPrefix + relativePath;
                    this.symlinks.set(newLinkPath, target);
                    this.symlinks.delete(linkPath);
                }
            }

            // Remove old directory
            this.directories.delete(oldPath);
        } else if (this.files.has(oldPath)) {
            // It's a file
            const content = this.files.get(oldPath) as string | Uint8Array;
            this.files.set(newPath, content);
            this.files.delete(oldPath);
        } else if (this.symlinks.has(oldPath)) {
            // It's a symlink
            const target = this.symlinks.get(oldPath) as string;
            this.symlinks.set(newPath, target);
            this.symlinks.delete(oldPath);
        }
    }

    // Create a symbolic link
    symlinkSync(target: string, path: string): void {
        path = this.normalizePath(path);

        // Ensure parent directory exists
        const parentDir = path.substring(0, path.lastIndexOf('/'));
        if (parentDir && !this.directories.has(parentDir)) {
            throw new Error(`ENOENT: Parent directory does not exist: ${parentDir}`);
        }

        this.symlinks.set(path, target);
    }

    // Normalize path to ensure consistent format
    private normalizePath(path: string): string {
        // Handle empty path
        if (!path) return '/';

        // Ensure path starts with /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Remove trailing slash except for root
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        // Handle double slashes
        while (path.includes('//')) {
            path = path.replace('//', '/');
        }

        return path;
    }

    // Create shortcuts in Desktop
    private createShortcuts(): void {
        const desktopPath = "/home/guest/Desktop";

        // Create My Projects shortcut
        this.writeFileSync(`${desktopPath}/My Projects.lnk`, "/projects");

        // Create My Documents shortcut
        this.writeFileSync(`${desktopPath}/My Documents.lnk`, "/home/guest/Documents");

        // Create Text Editor shortcut
        this.writeFileSync(`${desktopPath}/Text Editor.lnk`, "app:texteditor");
    }

    // Create project files based on project data
    private createProjectFiles(): void {
        // Create folders for each project
        projects.forEach((project) => {
            const projectFolder = `/projects/${project.id}`;

            // Create project folder if it doesn't exist
            if (!this.existsSync(projectFolder)) {
                this.mkdirSync(projectFolder, { recursive: true });

                // Create README.md with project description
                this.writeFileSync(
                    `${projectFolder}/README.md`,
                    `# ${project.title}\n\n` +
                    `${project.description}\n\n` +
                    `## Technologies\n\n` +
                    project.technologies.map((tech) => `- ${tech}`).join("\n")
                );

                // Create sample files based on project type
                this.createSampleProjectFiles(project);
            }
        });
    }

    // Create sample files based on project type
    private createSampleProjectFiles(project: any): void {
        const projectFolder = `/projects/${project.id}`;

        switch (project.type) {
            case "code":
                // Create sample code files
                this.writeFileSync(
                    `${projectFolder}/index.html`,
                    `<!DOCTYPE html>\n<html>\n<head>\n  <title>${project.title}</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>${project.title}</h1>\n  <div id="app"></div>\n  <script src="app.js"></script>\n</body>\n</html>`
                );

                this.writeFileSync(
                    `${projectFolder}/styles.css`,
                    `body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}`
                );

                this.writeFileSync(
                    `${projectFolder}/app.js`,
                    `// ${project.title} Application\n\ndocument.addEventListener('DOMContentLoaded', function() {\n  console.log('${project.title} initialized');\n  // Initialize application\n});\n`
                );
                break;

            case "interactive":
                // Create interactive demo files
                this.writeFileSync(
                    `${projectFolder}/index.html`,
                    `<!DOCTYPE html>\n<html>\n<head>\n  <title>${project.title} Demo</title>\n  <link rel="stylesheet" href="demo.css">\n</head>\n<body>\n  <h1>${project.title} Interactive Demo</h1>\n  <div class="demo-container">\n    <div id="interactive-demo"></div>\n    <div class="controls">\n      <button id="start-demo">Start Demo</button>\n      <button id="reset-demo">Reset</button>\n    </div>\n  </div>\n  <script src="demo.js"></script>\n</body>\n</html>`
                );

                this.writeFileSync(
                    `${projectFolder}/demo.css`,
                    `body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\n.demo-container {\n  border: 1px solid #ccc;\n  padding: 20px;\n  border-radius: 5px;\n}\n\n.controls {\n  margin-top: 20px;\n  display: flex;\n  gap: 10px;\n}\n\nbutton {\n  padding: 8px 16px;\n  background-color: #0078d7;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background-color: #0063b1;\n}`
                );

                this.writeFileSync(
                    `${projectFolder}/demo.js`,
                    `// ${project.title} Interactive Demo\n\ndocument.getElementById('start-demo').addEventListener('click', function() {\n  console.log('Starting demo...');\n  // Demo initialization logic\n});\n\ndocument.getElementById('reset-demo').addEventListener('click', function() {\n  console.log('Resetting demo...');\n  // Reset demo logic\n});\n`
                );
                break;

            case "visual":
                // Create files for visual projects
                this.writeFileSync(
                    `${projectFolder}/overview.md`,
                    `# ${project.title} Visual Overview\n\n` +
                    `${project.description}\n\n` +
                    `## Screenshots\n\n` +
                    `- screenshot1.png: Main page\n` +
                    `- screenshot2.png: Features page\n` +
                    `- screenshot3.png: Mobile view\n\n` +
                    `## Design Elements\n\n` +
                    `The design focuses on ${project.technologies.join(
                        ", "
                    )} with an emphasis on user experience and accessibility.`
                );

                // Create placeholder for screenshots
                this.mkdirSync(`${projectFolder}/screenshots`, { recursive: true });
                this.writeFileSync(
                    `${projectFolder}/screenshots/PLACEHOLDER.txt`,
                    `This folder would contain screenshots of the ${project.title} project.`
                );
                break;

            default:
                // Default project files
                this.writeFileSync(
                    `${projectFolder}/notes.txt`,
                    `${project.title}\n` +
                    `=================\n\n` +
                    `${project.description}\n\n` +
                    `Technologies used: ${project.technologies.join(", ")}\n\n` +
                    `This file contains notes about the project.`
                );
        }
    }
}

// Create and export a singleton instance
export const browserFS = new BrowserFileSystem();

// Export individual utility functions that mimic the Node.js fs API
export async function initFileSystem(useLocalStorage = false): Promise<typeof browserFS> {
    await browserFS.initialize(useLocalStorage);
    return browserFS;
}

export async function loadDefaultFiles(): Promise<void> {
    // This is now handled by the initialize method
    return;
}

export function existsSync(path: string): boolean {
    return browserFS.existsSync(path);
}

export function mkdirSync(path: string, options?: { recursive?: boolean }): void {
    return browserFS.mkdirSync(path, options);
}

export function readdirSync(path: string): string[] {
    return browserFS.readdirSync(path);
}

export function readFileSync(path: string, options?: { encoding?: string }): string | Uint8Array {
    return browserFS.readFileSync(path, options);
}

export function writeFileSync(path: string, data: string | Uint8Array): void {
    return browserFS.writeFileSync(path, data);
}

export function unlinkSync(path: string): void {
    return browserFS.unlinkSync(path);
}

export function rmdirSync(path: string): void {
    return browserFS.rmdirSync(path);
}

export function renameSync(oldPath: string, newPath: string): void {
    return browserFS.renameSync(oldPath, newPath);
}

export function statSync(path: string): { isDirectory: () => boolean; isSymbolicLink: () => boolean; size: number; mtime: Date } {
    return browserFS.statSync(path);
}

export function lstatSync(path: string): { isDirectory: () => boolean; isSymbolicLink: () => boolean; size: number; mtime: Date } {
    return browserFS.statSync(path); // Use statSync as they're the same in this implementation
}

export function readlinkSync(path: string): string {
    return browserFS.readlinkSync(path);
}

export function symlinkSync(target: string, path: string): void {
    return browserFS.symlinkSync(target, path);
}

// Export file system interface to match expected API
export const fs = {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    writeFileSync,
    unlinkSync,
    rmdirSync,
    renameSync,
    statSync,
    lstatSync,
    readlinkSync,
    symlinkSync
};

// Additional utility functions
export function listFiles(path: string) {
    try {
        return browserFS.readdirSync(path).map((name) => {
            const fullPath = `${path}/${name}`.replace(/\/\//g, "/");
            let isLink = false;
            let linkTarget = "";

            try {
                const stats = browserFS.statSync(fullPath);
                const isDirectory = stats.isDirectory();
                isLink = stats.isSymbolicLink();

                if (isLink) {
                    linkTarget = browserFS.readlinkSync(fullPath);
                }

                if (name.endsWith('.lnk')) {
                    isLink = true;
                    try {
                        const content = browserFS.readFileSync(fullPath, { encoding: 'utf8' });
                        linkTarget = content as string;
                    } catch (error) {
                        console.warn(`Error reading shortcut ${fullPath}:`, error);
                    }
                }

                return {
                    name,
                    isDirectory,
                    isLink,
                    ...(isLink && { linkTarget })
                };
            } catch (error) {
                console.warn(`Error checking file status for ${fullPath}:`, error);
                return { name, isDirectory: false, isLink: false };
            }
        });
    } catch (error) {
        console.error("Error listing files:", error);
        return [];
    }
}

export function readFileContent(path: string) {
    try {
        if (path.endsWith('.lnk')) {
            return browserFS.readFileSync(path, { encoding: 'utf8' }) as string;
        }

        return browserFS.readFileSync(path, { encoding: 'utf8' }) as string;
    } catch (error) {
        console.error(`Error reading file ${path}:`, error);
        return null;
    }
}

export function writeFileContent(path: string, content: string) {
    try {
        // Ensure parent directory exists
        const parentDir = path.substring(0, path.lastIndexOf("/"));
        if (parentDir && !browserFS.existsSync(parentDir)) {
            browserFS.mkdirSync(parentDir, { recursive: true });
        }

        browserFS.writeFileSync(path, content);
        return true;
    } catch (error) {
        console.error(`Error writing file ${path}:`, error);
        return false;
    }
}

export function deleteFileOrDir(path: string) {
    try {
        const stats = browserFS.statSync(path);
        if (stats.isDirectory()) {
            browserFS.rmdirSync(path);
        } else {
            browserFS.unlinkSync(path);
        }
        return true;
    } catch (error) {
        console.error(`Error deleting ${path}:`, error);
        return false;
    }
}

export function createDirectory(path: string) {
    try {
        browserFS.mkdirSync(path, { recursive: true });
        return true;
    } catch (error) {
        console.error(`Error creating directory ${path}:`, error);
        return false;
    }
}

export function renameFileOrDir(oldPath: string, newPath: string) {
    try {
        browserFS.renameSync(oldPath, newPath);
        return true;
    } catch (error) {
        console.error(`Error renaming ${oldPath} to ${newPath}:`, error);
        return false;
    }
}

export function getFileStats(path: string) {
    try {
        return browserFS.statSync(path);
    } catch (error) {
        console.error(`Error getting stats for ${path}:`, error);
        return null;
    }
}

export function createShortcut(path: string, target: string) {
    try {
        browserFS.writeFileSync(path, target);
        return true;
    } catch (error) {
        console.error(`Error creating shortcut ${path} to ${target}:`, error);
        return false;
    }
}