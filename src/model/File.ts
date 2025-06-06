import { DesktopItemBase, IDesktopModel } from './DesktopItem';
// import { WindowModel } from './Window'; // Not directly used in File.ts

export class File extends DesktopItemBase {
    constructor(name: string, public content: string = "", path?: string) {
        super(name, 'File', '📄', path);
        if (!path) {
            console.warn(`[File] File '${name}' created without a path.`);
        }
    }

    onDoubleClick(desktop: IDesktopModel): void {
        console.log(`[File] Double-clicked File: ${this.name}. Path: ${this.path}. Opening with texteditor...`);
        if (!this.path) {
            console.error(`[File] Cannot open file '${this.name}' because its path is not defined.`);
            return;
        }
        desktop.createAndOpenWindowFromType('texteditor', this.name, { filePath: this.path, sourceItemId: this.id });
    }

    renderIcon(): string {
        return `📄 ${this.name}`;
    }
} 