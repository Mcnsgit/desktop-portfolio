// src/utils/browserFileSystem.ts
// *** IMPORTANT: Make sure portfolioData is imported correctly ***
import { portfolioProjects } from "../config/data";
import { Project } from "../types/project";
// import { FS_ROOT, HOME_PATH, DESKTOP_PATH, PROJECTS_PATH, DOCUMENTS_PATH, PICTURES_PATH, SYSTEM_PATH, SYSTEM_ICONS_PATH } from './constants/fileSystemConstants';




export class BrowserFileSystem {
    private files: Map<string, string | Uint8Array>;
    private directories: Set<string>;
    private symlinks: Map<string, string>;
    private isInitialized: boolean;
    private persistEnabled: boolean; // Track persistence state internally

    constructor() {
        this.files = new Map();
        this.directories = new Set(['/']);
        this.symlinks = new Map();
        this.isInitialized = false;
        this.persistEnabled = false; // Default to false
        this.directories.add('/');
    }

    async initialize(persistData: boolean = false): Promise<void> {
        if (this.isInitialized) {
            console.log("FS Initialize: Already initialized.");
            return;
        }
        console.log(`FS Initialize: Starting initialization. Persistence requested: ${persistData}`);
        this.persistEnabled = persistData; // Store persistence setting

        let loadedFromStorage = false;
        if (this.persistEnabled && typeof localStorage !== 'undefined') {
            console.log("FS Initialize: Attempting load from localStorage...");
            try {
                const savedData = localStorage.getItem('retroos-filesystem');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    if (parsed && parsed.files && parsed.directories && parsed.symlinks) {
                        this.files = new Map(parsed.files);
                        this.directories = new Set(parsed.directories);
                        // Ensure root always exists after loading
                        if (!this.directories.has('/')) {
                            this.directories.add('/');
                        }
                        this.symlinks = new Map(parsed.symlinks);
                        console.log(`FS Initialize: Loaded ${this.files.size}f/${this.directories.size}d/${this.symlinks.size}l from localStorage.`);
                        loadedFromStorage = true;
                    } else { console.warn("FS Initialize: Invalid localStorage data format."); }
                } else { console.log("FS Initialize: No saved data in localStorage."); }
            } catch (err) {
                console.warn('FS Initialize: Failed loading from localStorage.', err);
                localStorage.removeItem('retroos-filesystem');
            }
        }

        if (!loadedFromStorage) {
            console.log("FS Initialize: Creating default structure...");
            this.resetFileSystemState(false); // Reset state without clearing localStorage yet

            const directoryStructure = [
                "/home", "/home/guest", "/home/guest/Desktop", "/home/guest/Documents",
                "/home/guest/Pictures", "/projects", "/system", "/system/icons",
                "/system/wallpapers", "/tmp",
            ];
            directoryStructure.forEach(dir => this.mkdirSync(dir, { recursive: true }, true)); // Pass internal flag

            this.writeFileSync("/home/guest/README.txt", "Welcome to RetroOS!...", true);
            this.createShortcuts(true);
            this.createProjectFiles(true);
            console.log("FS Initialize: Default structure created.");

            if (this.persistEnabled) {
                console.log("FS Initialize: Attempting initial save...");
                this.persistToLocalStorage();
            }
        }

        this.isInitialized = true;
        console.log('FS Initialize: Complete.');
    }

    persistToLocalStorage(): boolean {
        if (!this.persistEnabled || typeof localStorage === 'undefined') return false;
        console.log("FS Persist: Saving...");
        try {
            const dataToSave = {
                files: Array.from(this.files.entries()).map(([key, value]) => [key, value instanceof Uint8Array ? `base64:${btoa(String.fromCharCode(...value))}` : value]), // Encode binary
                directories: Array.from(this.directories),
                symlinks: Array.from(this.symlinks.entries())
            };
            localStorage.setItem('retroos-filesystem', JSON.stringify(dataToSave));
            // console.log(`FS Persist: Saved ${dataToSave.files.length}f/${dataToSave.directories.length}d/${dataToSave.symlinks.size}l.`);
            return true;
        } catch (err) {
            console.error('FS Persist: Error:', err);
            return false;
        }
    }

    reset(clearStorage = true): void {
        console.log(`FS Reset: Resetting state. Clear storage: ${clearStorage}`);
        this.resetFileSystemState(clearStorage);
    }

    private resetFileSystemState(clearStorage: boolean): void {
        this.files.clear();
        this.directories.clear();
        this.symlinks.clear();
        this.directories.add('/');
        this.isInitialized = false;
        this.persistEnabled = false;
        if (clearStorage && typeof localStorage !== 'undefined') {
            localStorage.removeItem('retroos-filesystem');
            console.log("FS Reset: Cleared localStorage item.");
        }
    }

    // Internal flag prevents persist loop during initialization
    mkdirSync(path: string, options?: { recursive?: boolean }, internalCall = false): void {
        path = this.normalizePath(path);
        if (this.directories.has(path)) return;
        let created = false;

        if (options?.recursive) {
            const parts = path.split('/').filter(Boolean);
            let currentPath = '';
            for (const part of parts) {
                currentPath += '/' + part;
                if (!this.directories.has(currentPath)) {
                    this.directories.add(currentPath);
                    created = true;
                }
            }
        } else {
            const parentDir = path.substring(0, path.lastIndexOf('/')) || '/';
            if (!this.directories.has(parentDir)) throw new Error(`ENOENT: ${parentDir}`);
            this.directories.add(path);
            created = true;
        }
        if (created && !internalCall) this.persistToLocalStorage();
    }

    existsSync(path: string): boolean {
        path = this.normalizePath(path);
        return this.directories.has(path) || this.files.has(path) || this.symlinks.has(path);
    }

    statSync(path: string): { isDirectory: () => boolean; isSymbolicLink: () => boolean; size: number; mtime: Date } {
        path = this.normalizePath(path);
        if (!this.existsSync(path)) throw new Error(`ENOENT: ${path}`);
        const isDir = this.directories.has(path);
        const isLink = this.symlinks.has(path);
        const content = this.files.get(path);
        const size = content ? (typeof content === 'string' ? new TextEncoder().encode(content).length : content.byteLength) : 0; // Correct size calculation
        return { isDirectory: () => isDir, isSymbolicLink: () => isLink, size, mtime: new Date() };
    }

    readlinkSync(path: string): string {
        path = this.normalizePath(path);
        if (!this.symlinks.has(path)) throw new Error(`EINVAL: ${path}`);
        return this.symlinks.get(path) || '';
    }

    readdirSync(path: string): string[] {
        path = this.normalizePath(path);
        if (!this.directories.has(path)) throw new Error(`ENOTDIR: ${path}`);
        const prefix = path === '/' ? '/' : path + '/';
        const children = new Set<string>();
        this.directories.forEach(dir => { if (dir !== path && dir.startsWith(prefix) && !dir.substring(prefix.length).includes('/')) children.add(dir.substring(prefix.length)) });
        this.files.forEach((_, file) => { if (file.startsWith(prefix) && !file.substring(prefix.length).includes('/')) children.add(file.substring(prefix.length)) });
        this.symlinks.forEach((_, link) => { if (link.startsWith(prefix) && !link.substring(prefix.length).includes('/')) children.add(link.substring(prefix.length)) });
        return Array.from(children);
    }

    // Internal flag prevents persist loop during initialization
    writeFileSync(path: string, data: string | Uint8Array, internalCall = false): void {
        path = this.normalizePath(path);
        const parentDir = path.substring(0, path.lastIndexOf('/')) || '/';
        if (!this.directories.has(parentDir)) {
            this.mkdirSync(parentDir, { recursive: true }, true); // Create parent internally first
        }
        this.files.set(path, data);
        if (!internalCall) this.persistToLocalStorage();
    }

    readFileSync(path: string, options?: { encoding?: string }): string | Uint8Array {
        path = this.normalizePath(path);
        let targetPath = path;
        let visitedLinks = new Set<string>(); // Prevent link loops

        // Resolve symlink chain first
        while (this.symlinks.has(targetPath)) {
            if (visitedLinks.has(targetPath)) throw new Error(`ELOOP: Too many symbolic links: ${path}`);
            visitedLinks.add(targetPath);
            targetPath = this.symlinks.get(targetPath) as string;
            targetPath = this.normalizePath(targetPath); // Normalize target
        }

        // Handle .lnk file directly (contains the target string)
        if (path.endsWith('.lnk')) { // Check original path for .lnk
            if (!this.files.has(path)) throw new Error(`ENOENT: ${path}`);
            const content = this.files.get(path);
            // .lnk files always store string targets
            return typeof content === 'string' ? content : new TextDecoder().decode(content);
        }


        if (!this.files.has(targetPath)) throw new Error(`ENOENT: ${targetPath}`);

        const content = this.files.get(targetPath);
        if (options?.encoding === 'utf8') {
            if (typeof content === 'string') return content;
            if (content instanceof Uint8Array) return new TextDecoder().decode(content);
        }
        return content!; // Should exist based on check above
    }

    unlinkSync(path: string): void {
        path = this.normalizePath(path);
        if (this.directories.has(path)) throw new Error(`EISDIR: ${path}`);
        let deleted = false;
        if (this.files.delete(path)) deleted = true;
        if (this.symlinks.delete(path)) deleted = true;
        if (!deleted) throw new Error(`ENOENT: ${path}`);
        this.persistToLocalStorage();
    }

    rmdirSync(path: string, options?: { recursive?: boolean }): void {
        path = this.normalizePath(path);
        if (!this.directories.has(path)) throw new Error(`ENOTDIR: ${path}`);

        const prefix = path === '/' ? '/' : path + '/';
        const childrenDirs = Array.from(this.directories).filter(d => d !== path && d.startsWith(prefix));
        const childrenFiles = Array.from(this.files.keys()).filter(f => f.startsWith(prefix));
        const childrenLinks = Array.from(this.symlinks.keys()).filter(l => l.startsWith(prefix));

        if (childrenDirs.length > 0 || childrenFiles.length > 0 || childrenLinks.length > 0) {
            if (options?.recursive) {
                // Delete children first
                childrenDirs.forEach(dir => this.rmdirSync(dir, { recursive: true }));
                childrenFiles.forEach(file => this.unlinkSync(file));
                childrenLinks.forEach(link => this.unlinkSync(link));
            } else {
                throw new Error(`ENOTEMPTY: ${path}`);
            }
        }
        this.directories.delete(path);
        this.persistToLocalStorage();
    }

    renameSync(oldPath: string, newPath: string): void {
        oldPath = this.normalizePath(oldPath);
        newPath = this.normalizePath(newPath);
        if (!this.existsSync(oldPath)) throw new Error(`ENOENT: ${oldPath}`);
        if (oldPath === newPath) return; // No-op
        if (this.existsSync(newPath)) throw new Error(`EEXIST: ${newPath}`);

        const newParentDir = newPath.substring(0, newPath.lastIndexOf('/')) || '/';
        if (!this.directories.has(newParentDir)) {
            this.mkdirSync(newParentDir, { recursive: true });
        }

        if (this.directories.has(oldPath)) { // Rename Directory
            const prefix = oldPath === '/' ? '/' : oldPath + '/';
            const newPrefix = newPath === '/' ? '/' : newPath + '/';

            // Update file paths
            Array.from(this.files.entries()).forEach(([p, content]) => {
                if (p.startsWith(prefix)) {
                    this.files.set(p.replace(prefix, newPrefix), content);
                    this.files.delete(p);
                }
            });
            // Update link paths
            Array.from(this.symlinks.entries()).forEach(([p, target]) => {
                if (p.startsWith(prefix)) {
                    this.symlinks.set(p.replace(prefix, newPrefix), target);
                    this.symlinks.delete(p);
                }
            });
            // Update directory paths
            const dirsToUpdate = Array.from(this.directories).filter(d => d.startsWith(prefix));
            dirsToUpdate.forEach(d => this.directories.delete(d));
            this.directories.delete(oldPath);
            this.directories.add(newPath);
            dirsToUpdate.forEach(d => this.directories.add(d.replace(prefix, newPrefix)));

        } else if (this.files.has(oldPath)) { // Rename File
            this.files.set(newPath, this.files.get(oldPath)!);
            this.files.delete(oldPath);
        } else if (this.symlinks.has(oldPath)) { // Rename Link
            this.symlinks.set(newPath, this.symlinks.get(oldPath)!);
            this.symlinks.delete(oldPath);
        }
        this.persistToLocalStorage();
    }

    symlinkSync(target: string, path: string, internalCall = false): void {
        path = this.normalizePath(path);
        const parentDir = path.substring(0, path.lastIndexOf('/')) || '/';
        if (!this.directories.has(parentDir)) throw new Error(`ENOENT: Parent ${parentDir}`);
        this.symlinks.set(path, target);
        if (!internalCall) this.persistToLocalStorage();
    }

    normalizePath(path: string): string {
        if (!path) return '/';
        if (!path.startsWith('/')) path = '/' + path;
        const parts = path.split('/').filter(part => part && part !== '.');
        const stack: string[] = [];
        for (const part of parts) {
            if (part === '..') { if (stack.length > 0) stack.pop(); }
            else { stack.push(part.replace(/[\\:*?"<>|]/g, '')); } // Sanitize
        }
        const result = '/' + stack.join('/');
        return result === '/' ? '/' : result; // Ensure root is '/' not '/ '
    }

    private createShortcuts(internalCall = false): void {
        const desktop = "/home/guest/Desktop";
        
        // Core CV sections
        this.writeFileSync(`${desktop}/About Me.lnk`, "app:about", internalCall);
        this.writeFileSync(`${desktop}/Contact.lnk`, "app:contact", internalCall);
        this.writeFileSync(`${desktop}/Education.lnk`, "app:education", internalCall);
        
        // Interactive demo apps
        this.writeFileSync(`${desktop}/Todo List.lnk`, "app:todolist", internalCall);
        this.writeFileSync(`${desktop}/Weather App.lnk`, "app:weatherapp", internalCall);
        
        // Project shortcuts from portfolioData (featured projects on desktop)
        if (portfolioProjects && portfolioProjects.length > 0) {
            portfolioProjects.forEach(project => {
                if (project?.id && project?.name) {
                    const shortcutName = `${project.id}.lnk`;
                    const appTarget = `app:project-${project.id}`;
                    this.writeFileSync(`${desktop}/${shortcutName}`, appTarget, internalCall);
                }
            });
        }
        
        // Legacy shortcuts (keeping for compatibility)
        this.writeFileSync(`${desktop}/My Projects.lnk`, "/projects", internalCall);
        this.writeFileSync(`${desktop}/My Documents.lnk`, "/home/guest/Documents", internalCall);
        this.writeFileSync(`${desktop}/Text Editor.lnk`, "app:texteditor", internalCall);
    }

    private createProjectFiles(internalCall = false): void {
        if (!portfolioProjects || portfolioProjects.length === 0) return;
        portfolioProjects.forEach((project) => {
            if (!project?.id) return;
            const folder = `/projects/${project.id}`;
            if (!this.existsSync(folder)) {
                this.mkdirSync(folder, { recursive: true }, internalCall);
                this.writeFileSync(`${folder}/README.md`, `# ${project.id}\n...`, internalCall);
                this.createSampleProjectFiles(project as unknown as Project, internalCall);
            }
        });
    }

private createSampleProjectFiles(project: Project, internalCall = false): void {
        const folder = `/projects/${project.id}`;
        // Ensure project.technologies is an array before joining
        const techList = Array.isArray(project.technologies) ? project.technologies.join(", ") : 'N/A';

        switch (project.type) {
            case "code":
                this.writeFileSync(`${folder}/index.html`, `... ${project.title} ...`, internalCall);
                this.writeFileSync(`${folder}/styles.css`, `...`, internalCall);
                this.writeFileSync(`${folder}/app.js`, `... ${project.title} ...`, internalCall);
                break;
            case "interactive":
                this.writeFileSync(`${folder}/index.html`, `... ${project.title} Demo ...`, internalCall);
                this.writeFileSync(`${folder}/demo.css`, `...`, internalCall);
                this.writeFileSync(`${folder}/demo.js`, `... ${project.title} ...`, internalCall);
                break;
            case "visual":
                this.writeFileSync(
                    `${folder}/overview.md`,
                    `# ${project.title} Visual Overview\n\n...\n\nTechnologies: ${techList}`, // Safely use techList
                    internalCall
                );
                this.mkdirSync(`${folder}/screenshots`, { recursive: true }, internalCall);
                this.writeFileSync(`${folder}/screenshots/PLACEHOLDER.txt`, `... ${project.title} ...`, internalCall);
                break;
            default:
                this.writeFileSync(
                    `${folder}/notes.txt`,
                    `${project.title}\n...\nTechnologies used: ${techList}`, // Safely use techList
                    internalCall
                );
        }
    }
}

export const browserFS = new BrowserFileSystem();

// --- Exported Utility Functions --- (Fixes applied)
export async function initFileSystem(useLocalStorage = false): Promise<typeof browserFS> {
    await browserFS.initialize(useLocalStorage); return browserFS;
}
export function existsSync(path: string): boolean { return browserFS.existsSync(path); }
export function mkdirSync(path: string, options?: { recursive?: boolean }): void { browserFS.mkdirSync(path, options); } // Corrected: Calls internal mkdirSync
export function readdirSync(path: string): string[] { return browserFS.readdirSync(path); }
export function readFileSync(path: string, options?: { encoding?: string }): string | Uint8Array { return browserFS.readFileSync(path, options); }
export function writeFileSync(path: string, data: string | Uint8Array): void { browserFS.writeFileSync(path, data); }
export function unlinkSync(path: string): void { browserFS.unlinkSync(path); }
export function rmdirSync(path: string, options?: { recursive?: boolean }): void { browserFS.rmdirSync(path, options); }
export function renameSync(oldPath: string, newPath: string): void { browserFS.renameSync(oldPath, newPath); }
export function statSync(path: string): { /*...*/ } { return browserFS.statSync(path); }
export function lstatSync(path: string): { /*...*/ } { return browserFS.statSync(path); }
export function readlinkSync(path: string): string { return browserFS.readlinkSync(path); }
export function symlinkSync(target: string, path: string): void { browserFS.symlinkSync(target, path); }

export const fs = {
    existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync,
    rmdirSync, renameSync, statSync, lstatSync, readlinkSync, symlinkSync
};

// --- Additional Helper Functions --- (Fixes applied)
export function listFiles(path: string): Array<{ name: string, isDirectory: boolean, isLink: boolean, linkTarget?: string }> { // Added return type
    try {
        return browserFS.readdirSync(path).map((name) => {
            const fullPath = path === '/' ? `/${name}` : `${path}/${name}`; // Fix root path join
            let isLink = false;
            let linkTarget: string | undefined = undefined; // Initialize explicitly
            let isDirectory = false;

            try {
                const stats = browserFS.statSync(fullPath); // Use corrected statSync if needed
                isDirectory = stats.isDirectory();
                isLink = stats.isSymbolicLink();

                if (isLink) { linkTarget = browserFS.readlinkSync(fullPath); }
                if (name.endsWith('.lnk')) { // Check original name for .lnk
                    isLink = true;
                    try {
                        linkTarget = browserFS.readFileSync(fullPath, { encoding: 'utf8' }) as string;
                    } catch (error) { console.warn(`Err reading shortcut ${fullPath}:`, error); linkTarget = '!error'; }
                }
                // *** FIX for Error 5: Return full object structure ***
                return { name, isDirectory, isLink, linkTarget };
            } catch (error) {
                console.warn(`Err checking status for ${fullPath}:`, error);
                // *** FIX for Error 5: Return full default object structure on error ***
                return { name, isDirectory: false, isLink: false, linkTarget: undefined };
            }
        });
    } catch (error) {
        console.error(`Error listing files in ${path}:`, error);
        return [];
    }
}

export function readFileContent(path: string): string | null {
    try {
        // Reading .lnk directly gives the target, which might be desired sometimes,
        // but usually, you want the content of the target.
        // This implementation reads the .lnk content (the target path).
        // If you need the target's content, you'd resolve the link first.
        return browserFS.readFileSync(path, { encoding: 'utf8' }) as string;
    } catch (error) {
        console.error(`Error reading file content ${path}:`, error);
        return null;
    }
}

export function writeFileContent(path: string, content: string): boolean {
    try {
        // No need to manage parent dir here, writeFileSync handles it.
        browserFS.writeFileSync(path, content); // This calls persist internally
        return true;
    } catch (error) { console.error(`Error writing file ${path}:`, error); return false; }
}

export function deleteFileOrDir(path: string): boolean {
    try {
        const stats = browserFS.statSync(path);
        if (stats.isDirectory()) {
            browserFS.rmdirSync(path, { recursive: true }); // Allow recursive delete
        } else {
            browserFS.unlinkSync(path);
        }
        return true; // Persist is called internally
    } catch (error) { console.error(`Error deleting ${path}:`, error); return false; }
}

export function createDirectory(path: string): boolean {
    try {
        browserFS.mkdirSync(path, { recursive: true }); // This calls persist internally
        return true;
    } catch (error) { console.error(`Error creating directory ${path}:`, error); return false; }
}

export function renameFileOrDir(oldPath: string, newPath: string): boolean {
    try { browserFS.renameSync(oldPath, newPath); return true; } // Persist called internally
    catch (error) { console.error(`Error renaming ${oldPath}:`, error); return false; }
}
export function getFileStats(path: string): { size: number; mtime: Date; isDirectory: () => boolean; isSymbolicLink: () => boolean; } | null {
    try { return browserFS.statSync(path); }
    catch (error) { console.error(`Error getting stats ${path}:`, error); return null; }
}
export function createShortcut(path: string, target: string): boolean {
    try { browserFS.writeFileSync(path.endsWith('.lnk') ? path : `${path}.lnk`, target); return true; } // Persist called internally
    catch (error) { console.error(`Error creating shortcut ${path}:`, error); return false; }
}