import { IDesktopItem, ItemType } from './DesktopItem';
import { File } from './File';
import { Folder } from './Folder';
import { App } from './App';
import { WindowManager } from './WindowManager';
import { WindowModel } from './Window';
// import { generateId } from './utils'; // Not used in current implementation
import { BrowserFileSystem } from '../utils/browserFileSystem';
import { portfolioProjects } from '../data/portfolioData';
import { DESKTOP_PATH, APP_ICONS, DEFAULT_ICON } from '../utils/constants';

export class Desktop {
    public items: IDesktopItem[] = [];
    public readonly windowManager: WindowManager;
    public readonly id: string = "desktop";
    private readonly fileSystem: BrowserFileSystem;

    constructor(fileSystem: BrowserFileSystem) {
        this.windowManager = new WindowManager();
        this.fileSystem = fileSystem;
        console.log("Desktop Environment Initialized with FileSystem.");
    }

    addItem(item: IDesktopItem): void {
        item.setParent(this.id);
        if (!this.items.find(i => i.id === item.id)) {
            this.items.push(item);
        }
        console.log(`[Desktop] Item '${item.name}' added to Desktop.`);
    }

    // Helper to recursively find an item within a list of items (and their subfolders)
    private _findItemRecursive(items: IDesktopItem[], itemId: string): IDesktopItem | undefined {
        for (const item of items) {
            if (item.id === itemId) {
                return item;
            }
            if (item.type === 'Folder') {
                const foundInSubfolder = this._findItemRecursive((item as Folder).children, itemId);
                if (foundInSubfolder) {
                    return foundInSubfolder;
                }
            }
        }
        return undefined;
    }

    findItemById(itemId: string): IDesktopItem | undefined {
        if (itemId === this.id) return undefined; 
        return this._findItemRecursive(this.items, itemId);
    }
    
    // Helper to recursively remove an item from a list and subfolders
    private _removeItemRecursive(items: IDesktopItem[], itemId: string): IDesktopItem | undefined {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.id === itemId) {
                return items.splice(i, 1)[0]; // Remove and return the item
            }
            if (item.type === 'Folder') {
                const removedItem = this._removeItemRecursive((item as Folder).children, itemId);
                if (removedItem) {
                    return removedItem; // Item found and removed in a subfolder
                }
            }
        }
        return undefined; // Item not found in this list or its subfolders
    }

    removeItem(itemId: string): IDesktopItem | undefined {
        const itemToRemove = this.findItemById(itemId);
        if (!itemToRemove) return undefined;

        // FS operation FIRST, then model update
        if (this.fileSystem && itemToRemove.path) {
            try {
                const stats = this.fileSystem.statSync(itemToRemove.path);
                if (stats.isDirectory()) {
                    this.fileSystem.rmdirSync(itemToRemove.path, { recursive: true });
                    console.log(`[Desktop FS] Directory '${itemToRemove.path}' removed from file system.`);
                } else {
                    this.fileSystem.unlinkSync(itemToRemove.path);
                    console.log(`[Desktop FS] File '${itemToRemove.path}' removed from file system.`);
                }
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    console.error(`[Desktop FS] Critical error removing '${itemToRemove.path}':`, error);
                    return undefined; // Abort if critical FS error
                }
                console.warn(`[Desktop FS] Item '${itemToRemove.path}' not found on file system, proceeding with model removal.`);
            }
        }

        // Proceed with model removal only after successful FS operation
        const removedItem = this._removeItemRecursive(this.items, itemId);
        if (removedItem) {
            console.log(`[Desktop] Item '${removedItem.name}' (ID: ${itemId}) removed from model.`);
            // Remove from any open folder models
            this.findAllFolders().forEach(folder => folder.removeItem(itemId));
        }
        return removedItem;
    }

    findItemByPath(path: string): IDesktopItem | undefined {
        const search = (items: IDesktopItem[]): IDesktopItem | undefined => {
            for (const item of items) {
                if (item.path === path) {
                    return item;
                }
                if (item.type === 'Folder') {
                    const foundInChildren = search((item as Folder).children);
                    if (foundInChildren) return foundInChildren;
                }
            }
            return undefined;
        };
        return search(this.items);
    }

    // Changed to synchronous and to correctly use readdirSync and statSync
    listDirectorySync(path: string): { name: string; path: string; type: ItemType; icon: string; size?: number; dateModified?: Date }[] {
        if (!this.fileSystem) {
            console.error("[DesktopModel] FileSystem not available.");
            return [];
        }
        try {
            const names = this.fileSystem.readdirSync(path);
            return names.map(name => {
                const entryPath = `${path === '/' ? '' : path}/${name}`.replace(/\/\/+/g, '/');
                const stats = this.fileSystem.statSync(entryPath);
                const itemType: ItemType = stats.isDirectory() ? 'Folder' : 'File'; 
                const icon = itemType === 'Folder' ? '📁' : '📄'; // Placeholder icon string
                return { 
                    name, 
                    path: entryPath, 
                    type: itemType, 
                    icon, 
                    size: stats.size, 
                    dateModified: stats.mtime 
                }; 
            });
        } catch (error) {
            console.error(`[DesktopModel] Error listing directory ${path}:`, error);
            return [];
        }
    }

    handleDoubleClick(itemId: string): void {
        const item = this.findItemById(itemId);
        if (item) {
            console.log(`[Desktop] Double-clicked on: ${item.name} (Type: ${item.type})`);
            item.onDoubleClick(this);
        } else {
            console.warn(`[Desktop] No item found with ID: ${itemId} for double click.`);
        }
    }

    moveItem(itemId: string, newParentId: string, newPathPrefix?: string): void {
        const itemToMove = this.findItemById(itemId);
        if (!itemToMove) {
            console.warn(`[Desktop] Move failed: Item with ID '${itemId}' not found.`);
            return;
        }

        const oldPath = itemToMove.path;
        let newPath: string | undefined = undefined;

        // Determine new path
        const itemName = itemToMove.path?.split('/').pop() || itemToMove.name;
        if (newPathPrefix) {
            newPath = `${newPathPrefix}/${itemName}`.replace(/\/\/+/g, '/');
        } else if (newParentId === this.id) {
            // Moving to Desktop root
            newPath = `${DESKTOP_PATH}/${itemName}`.replace(/\/\/+/g, '/');
        } else {
            // Attempt to derive from parent folder's path if newPathPrefix is not given
            const parentFolder = this.findItemById(newParentId);
            if (parentFolder && parentFolder.path) {
                newPath = `${parentFolder.path}/${itemName}`.replace(/\/\/+/g, '/');
            } else {
                console.warn(`[Desktop] moveItem: Cannot determine new path for '${itemToMove.name}' without newPathPrefix or valid parent path.`);
                // Fallback or error, depending on desired behavior. For now, we'll proceed with model move but skip FS move.
            }
        }
        
        // Perform actual file system move operation BEFORE updating the model
        if (oldPath && newPath && oldPath !== newPath && this.fileSystem) {
            try {
                this.fileSystem.renameSync(oldPath, newPath);
                console.log(`[Desktop FS] Moved item from '${oldPath}' to '${newPath}' in file system.`);
                itemToMove.path = newPath; // Update model path only after successful FS operation
            } catch (error) {
                console.error(`[Desktop FS] Error moving item from '${oldPath}' to '${newPath}':`, error);
                // If FS operation fails, we should NOT update the model's path or parentage
                // to maintain consistency with the actual file system state.
                return; // Stop the move operation
            }
        } else if (oldPath && newPath && oldPath === newPath) {
            console.log(`[Desktop] Item '${itemToMove.name}' path remains the same: '${newPath}'. Only parent in model might change.`);
            // No FS operation needed if paths are the same, but model's parent might change.
        } else {
            console.warn(`[Desktop] File system move skipped for '${itemToMove.name}': oldPath or newPath invalid, or FileSystem not available.`);
            // If we can't perform FS move, should we prevent model move too?
            // For now, if FS move is intended but fails/skipped, we prevent model change by returning.
            if (oldPath && newPath && oldPath !== newPath) return;
        }


        // Remove from current parent in the model
        this._removeItemRecursive(this.items, itemId); // This removes from model, not FS

        // Update item's path if it changed (already done above after successful FS move)
        // itemToMove.path = newPath; // Not needed here, done above.

        // Add to new parent in the model
        if (newParentId === this.id) {
            itemToMove.setParent(this.id);
            this.items.push(itemToMove);
        } else {
            const targetFolder = this.findItemById(newParentId) as Folder | undefined;
            if (targetFolder && targetFolder.type === 'Folder') {
                itemToMove.setParent(targetFolder.id); // Set parent ID
                targetFolder.addItem(itemToMove);
            } else {
                console.warn(`[Desktop] Move failed: Target folder with ID '${newParentId}' not found or not a folder. Reverting to Desktop (model only).`);
                // This is a fallback if the target folder in the model doesn't exist.
                // The FS operation might have succeeded to a path, but the model parent is now Desktop.
                // This indicates a potential inconsistency if newPath was supposed to be inside targetFolder.
                itemToMove.setParent(this.id);
                // If newPath was defined based on a targetFolder that wasn't found in model,
                // itemToMove.path might now be inconsistent with its parent in model.
                // This state needs careful handling or prevention.
                // For now, we assume if FS move was to newPath, itemToMove.path reflects that.
                // If FS move was skipped/failed, path isn't updated.
                this.items.push(itemToMove);
            }
        }
        console.log(`[Desktop] Item '${itemToMove.name}' (model) moved to parent '${newParentId}'. Current path: ${itemToMove.path}`);
    }

    createFolderOnDesktop(name: string): Folder {
        const newFolder = new Folder(name);
        this.addItem(newFolder);
        console.log(`[Desktop] Created new folder '${name}' on Desktop.`);
        return newFolder;
    }

    private findAllFolders(): Folder[] {
        const folders: Folder[] = [];
        const search = (items: IDesktopItem[]) => {
            for (const item of items) {
                if (item.type === 'Folder') {
                    folders.push(item as Folder);
                    search((item as Folder).children);
                }
            }
        };
        search(this.items);
        return folders;
    }

    createAndOpenWindowFromType(appType: string, title: string, payload?: any): WindowModel | undefined {
        let windowContent: any = { type: appType, ...payload };
        let windowTitle = title;
        let sourceItem: IDesktopItem | undefined;

        // Ensure desktopModel is passed to relevant window types
        const requiresDesktopModel = ['fileexplorer', 'folder', 'texteditor']; // Add other types if they need access to desktopModel

        switch (appType) {
            case 'about':
                windowContent = { type: 'about', message: "About this application..." }; 
                break;
            case 'contact':
                windowContent = { type: 'contact' }; 
                break;
            case 'texteditor':
                windowTitle = payload?.filePath ? `Text Editor - ${payload.filePath}` : title;
                // File content should be loaded by the TextEditorWindow component itself using desktopModel.fileSystem
                windowContent = { type: 'texteditor', filePath: payload?.filePath, desktopModel: this }; // Pass desktopModel
                break;
            case 'fileexplorer':
                windowContent = { type: 'fileexplorer', initialPath: payload?.initialPath || "/", folderId: payload?.folderId, desktopModel: this }; 
                break;
            case 'folder':
                const folderItem = this.findItemById(payload?.folderId);
                if (folderItem && folderItem.type === 'Folder') {
                    sourceItem = folderItem;
                    windowTitle = sourceItem.name;
                    // Use 'fileexplorer' type, pass folderId and initialPath
                    windowContent = { 
                        type: 'fileexplorer', 
                        folderId: sourceItem.id, 
                        initialPath: sourceItem.path, 
                        desktopModel: this 
                    };
                    console.log(`[Desktop] Opening folder '${sourceItem.name}' with FileExplorer. ID: ${sourceItem.id}, Path: ${sourceItem.path}`);
                } else {
                    console.warn(`[Desktop] Folder with id ${payload?.folderId} not found for window. Cannot open with FileExplorer.`);
                    return undefined;
                }
                break;
            case 'weatherapp':
            case 'calculator':
            case 'mediaplayer':
            case 'calendar':
            case 'settings':
                windowContent = { type: appType, title: windowTitle }; 
                break; 
            case 'todolist':
                windowContent = { type: 'todolist', title: windowTitle };
                break;
            default:
                console.warn(`[Desktop] Unknown appType '${appType}' for createAndOpenWindowFromType.`);
                const existingApp = this.items.find(i => i.name.toLowerCase() === appType.toLowerCase() && i.type === 'App') as App;
                if (existingApp) {
                    existingApp.onDoubleClick(this);
                    return this.windowManager.getWindowsForUI().find(w => w.sourceItem?.id === existingApp.id);
                }
                windowContent = { type: 'unknown', message: `Application type '${appType}' not fully implemented.` };
                windowTitle = appType;
        }

        if (requiresDesktopModel.includes(appType) && windowContent) {
            windowContent.desktopModel = this;
        }

        const newWindow = new WindowModel(windowTitle, windowContent, sourceItem);
        this.windowManager.openWindow(newWindow);
        return newWindow;
    }

    render(): string {
        let output = "\n========== DESKTOP ==========\nIcons:\n";
        if (this.items.length === 0) {
            output += "(Desktop is empty)\n";
        } else {
            this.items.forEach(item => output += `- ${item.renderIcon()} (id: ${item.id}, parentId: ${item.parentId})\n`);
        }
        output += this.windowManager.renderAll();
        output += "\n=============================";
        return output;
    }

    /**
     * Creates a new directory in the file system and adds it to the DesktopModel.
     * @param parentPath The path of the parent directory. Use root ("/") for desktop.
     * @param directoryName The name of the new directory.
     * @returns The created Folder item, or undefined if creation failed.
     */
    createDirectory(parentPath: string, directoryName: string): Folder | undefined {
        if (!this.fileSystem) {
            console.error("[DesktopModel] FileSystem not available. Cannot create directory.");
            return undefined;
        }
        if (!directoryName || directoryName.includes('/') || directoryName.includes('\\')) {
            console.error(`[DesktopModel] Invalid directory name: ${directoryName}`);
            return undefined;
        }

        const normalizedParentPath = parentPath === '/' ? '' : parentPath; // Handle root path
        const newDirectoryPath = `${normalizedParentPath}/${directoryName}`.replace(/\/\/+/g, '/');
        
        try {
            // Create in file system
            this.fileSystem.mkdirSync(newDirectoryPath);
            console.log(`[Desktop FS] Directory '${newDirectoryPath}' created in file system.`);

            // Create model item
            const newFolder = new Folder(directoryName, newDirectoryPath);
            // ID is auto-generated by DesktopItemBase constructor

            // Add to model
            // Determine if parent is Desktop or another Folder
            if (parentPath === "/" || parentPath === "/home/guest/Desktop") { // Assuming "/home/guest/Desktop" is the root for desktop items in the model
                newFolder.setParent(this.id); // Parent is Desktop
                this.items.push(newFolder);
            } else {
                const parentFolderModel = this.findItemByPath(parentPath) as Folder | undefined;
                if (parentFolderModel && parentFolderModel.type === 'Folder') {
                    newFolder.setParent(parentFolderModel.id);
                    parentFolderModel.addItem(newFolder);
                } else {
                    console.warn(`[DesktopModel] Parent folder at path '${parentPath}' not found in model. Adding '${directoryName}' to Desktop root as fallback.`);
                    newFolder.setParent(this.id);
                    // Adjust path if it was meant to be nested but parent wasn't found
                    // This case implies a discrepancy between FS and model, or an attempt to create in a non-model-tracked path.
                    // For now, the FS path is newDirectoryPath, model path is also newDirectoryPath.
                    // If parentPath wasn't Desktop, this might visually appear on Desktop but have a deeper path.
                    this.items.push(newFolder);
                }
            }
            console.log(`[DesktopModel] Folder '${newFolder.name}' (path: ${newFolder.path}) added to model.`);
            return newFolder;
        } catch (error) {
            console.error(`[Desktop FS] Error creating directory '${newDirectoryPath}' in file system:`, error);
            return undefined;
        }
    }

    /**
     * Creates a new file in the file system and adds it to the DesktopModel.
     * @param filePath The full path where the file should be created (e.g., "/home/guest/Desktop/newFile.txt").
     * @param content Optional content for the new file.
     * @returns The created File item, or undefined if creation failed.
     */
    createFile(filePath: string, content: string = ''): File | undefined {
        if (!this.fileSystem) {
            console.error("[DesktopModel] FileSystem not available. Cannot create file.");
            return undefined;
        }
        if (!filePath || filePath.endsWith('/') || filePath.endsWith('\\')) {
            console.error(`[DesktopModel] Invalid file path: ${filePath}`);
            return undefined;
        }

        const fileName = filePath.split('/').pop();
        if (!fileName) {
            console.error(`[DesktopModel] Could not extract file name from path: ${filePath}`);
            return undefined;
        }
        
        // Determine parent path for model update
        const parentPath = filePath.substring(0, filePath.lastIndexOf('/')) || "/";


        try {
            // Create in file system
            this.fileSystem.writeFileSync(filePath, content);
            console.log(`[Desktop FS] File '${filePath}' created in file system.`);

            // Create model item
            // TODO: Determine icon based on file type more robustly
            const newFile = new File(fileName, filePath, '📄'); // Placeholder icon. Note: content is the second param for File constructor.
            // ID is auto-generated by DesktopItemBase constructor

            // Add to model
            if (parentPath === "/" || parentPath === "/home/guest/Desktop") { // Adjust as per your desktop root path
                newFile.setParent(this.id); // Parent is Desktop
                this.items.push(newFile);
            } else {
                const parentFolderModel = this.findItemByPath(parentPath) as Folder | undefined;
                if (parentFolderModel && parentFolderModel.type === 'Folder') {
                    newFile.setParent(parentFolderModel.id);
                    parentFolderModel.addItem(newFile);
                } else {
                    console.warn(`[DesktopModel] Parent folder at path '${parentPath}' not found in model for new file '${fileName}'. Adding to Desktop root as fallback.`);
                    newFile.setParent(this.id);
                    // Path is already absolute, so it's fine.
                    this.items.push(newFile);
                }
            }
            console.log(`[DesktopModel] File '${newFile.name}' (path: ${newFile.path}) added to model.`);
            return newFile;
        } catch (error) {
            console.error(`[Desktop FS] Error creating file '${filePath}' in file system:`, error);
            return undefined;
        }
    }

    // Public method to read file content
    readFileContent(filePath: string): string | null {
        if (!this.fileSystem) {
            console.error("[DesktopModel] FileSystem not available. Cannot read file.");
            return null;
        }
        try {
            const content = this.fileSystem.readFileSync(filePath, { encoding: 'utf8' });
            return content as string; // Assuming utf8 always returns string
        } catch (error) {
            console.error(`[DesktopModel] Error reading file '${filePath}':`, error);
            return null;
        }
    }

    // Public method to write file content
    writeFileContent(filePath: string, content: string): boolean {
        if (!this.fileSystem) {
            console.error("[DesktopModel] FileSystem not available. Cannot write file.");
            return false;
        }
        try {
            this.fileSystem.writeFileSync(filePath, content);
            console.log(`[DesktopModel] File '${filePath}' written successfully.`);
            return true;
        } catch (error) {
            console.error(`[DesktopModel] Error writing file '${filePath}':`, error);
            return false;
        }
    }

    /**
     * Load initial desktop items from the file system, interpreting .lnk files as portfolio content
     */
    async loadInitialDesktopItems(desktopPath: string = DESKTOP_PATH): Promise<void> {
        console.log(`[Desktop] Loading initial items from: ${desktopPath}`);
        
        try {
            const entries = this.listDirectorySync(desktopPath);
            
            for (const entry of entries) {
                if (entry.name.endsWith('.lnk')) {
                    // Read .lnk file target
                    const target = this.fileSystem.readFileSync(entry.path, { encoding: 'utf8' }) as string;
                    
                    if (target.startsWith('app:project-')) {
                        // Project shortcuts
                        const projectId = target.substring('app:project-'.length);
                        const projectData = portfolioProjects.find(p => p.id === projectId);
                        if (projectData) {
                            const app = new App(projectData.title, `project-${projectId}`, projectData.icon || this._getPortfolioAppIcon('project', projectId), entry.path);
                            (app as any).position = this._findPersistedPosition(app.id) || this._calculateNextGridPosition();
                            this.addItem(app);
                            console.log(`[Desktop] Added project shortcut: ${projectData.title}`);
                        }
                    } else if (target.startsWith('app:')) {
                        // CV section shortcuts (about, contact, education, todolist, weatherapp)
                        const appType = target.substring('app:'.length);
                        const appName = entry.name.replace('.lnk', '');
                        const icon = this._getPortfolioAppIcon(appType);
                        const app = new App(appName, appType, icon, entry.path);
                        (app as any).position = this._findPersistedPosition(app.id) || this._calculateNextGridPosition();
                        this.addItem(app);
                        console.log(`[Desktop] Added CV app shortcut: ${appName} (${appType})`);
                    }
                } else if (entry.type === 'Folder') {
                    // Regular folders
                    const folder = new Folder(entry.name, entry.path);
                    (folder as any).position = this._calculateNextGridPosition();
                    this.addItem(folder);
                    console.log(`[Desktop] Added folder: ${entry.name}`);
                } else {
                    // Regular files
                    const file = new File(entry.name, "", entry.path);
                    (file as any).position = this._calculateNextGridPosition();
                    this.addItem(file);
                    console.log(`[Desktop] Added file: ${entry.name}`);
                }
            }
            
            console.log(`[Desktop] Loaded ${this.items.length} items from ${desktopPath}`);
        } catch (error) {
            console.error(`[Desktop] Error loading initial desktop items from ${desktopPath}:`, error);
        }
    }

    /**
     * Get appropriate icon for portfolio app types
     */
    private _getPortfolioAppIcon(appType: string, projectId?: string): string {
        switch (appType) {
            case 'about': return APP_ICONS.ABOUT || DEFAULT_ICON;
            case 'contact': return APP_ICONS.CONTACT || DEFAULT_ICON;
            case 'education': return '/assets/win98-icons/png/book_blue_open-1.png';
            case 'todolist': return APP_ICONS.TEXT_EDITOR || DEFAULT_ICON;
            case 'weatherapp': return APP_ICONS.WEATHER || DEFAULT_ICON;
            case 'settings': return '/assets/win98-icons/png/settings_gear-0.png';
            case 'fileexplorer': return APP_ICONS.FILE_EXPLORER || DEFAULT_ICON;
            default:
                if (appType === 'project' && projectId) {
                    const project = portfolioProjects.find(p => p.id === projectId);
                    return project?.icon || APP_ICONS.PROJECTS || DEFAULT_ICON;
                }
                return DEFAULT_ICON;
        }
    }

    /**
     * Find persisted position for an item (placeholder for future localStorage integration)
     */
    private _findPersistedPosition(itemId: string): { x: number; y: number } | null {
        // TODO: Implement localStorage-based position persistence
        // For now, return null to use calculated grid position
        return null;
    }

    /**
     * Calculate next available grid position for desktop items
     */
    private _calculateNextGridPosition(): { x: number; y: number } {
        const padding = 16;
        const gridCellWidth = 80; // DESKTOP_ICON_WIDTH
        const gridCellHeight = 90; // DESKTOP_ICON_HEIGHT
        const gridGap = 8;
        const itemsPerRow = 8;
        
        // Count existing items to determine next position
        const existingItemsCount = this.items.filter(item => item.parentId === this.id).length;
        
        const columnIndex = existingItemsCount % itemsPerRow;
        const rowIndex = Math.floor(existingItemsCount / itemsPerRow);
        
        const x = padding + columnIndex * (gridCellWidth + gridGap);
        const y = padding + rowIndex * (gridCellHeight + gridGap);
        
        return { x, y };
    }
} 