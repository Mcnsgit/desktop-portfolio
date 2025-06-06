import { DesktopItemBase, IDesktopItem, IDesktopModel } from './DesktopItem';
// import { WindowModel } from './Window'; // Not directly used in Folder.ts

export class Folder extends DesktopItemBase {
    public children: IDesktopItem[] = [];

    constructor(name: string, path?: string) { // Added path
        super(name, 'Folder', '📁', path); // Pass path to super
        if (!path) {
            console.warn(`[Folder] Folder '${name}' created without a path.`);
        }
    }

    addItem(item: IDesktopItem): void {
        if (item.id === this.id) {
            console.warn(`[Folder] Cannot add folder '${this.name}' to itself.`);
            return;
        }
        item.setParent(this.id);
        if (!this.children.find(c => c.id === item.id)) {
            this.children.push(item);
        }
        console.log(`[Folder] Item '${item.name}' (id: ${item.id}) added to folder '${this.name}' (id: ${this.id}). Child parentId set to ${item.parentId}`);
    }

    removeItem(itemId: string): IDesktopItem | undefined {
        const index = this.children.findIndex(child => child.id === itemId);
        if (index > -1) {
            const [item] = this.children.splice(index, 1);
            item.setParent(null);
            console.log(`[Folder] Item '${item.name}' removed from folder '${this.name}'.`);
            return item;
        }
        return undefined;
    }

    onDoubleClick(desktop: IDesktopModel): void {
        console.log(`[Folder] Double-clicked Folder: ${this.name}. Path: ${this.path}. Opening with folder view...`);
        if (!this.path) {
            console.error(`[Folder] Cannot open folder '${this.name}' because its path is not defined.`);
            // Optionally, open a default error window or a simple content display if path is missing
            return;
        }
        // The FolderWindow/FileExplorerWindow will use the desktopModel and folderId/folderPath to fetch contents
        desktop.createAndOpenWindowFromType('folder', this.name, { folderId: this.id, folderPath: this.path, sourceItemId: this.id });
    }

    renderIcon(): string { // Added missing renderIcon method
        return `📁 ${this.name}`;
    }
} 