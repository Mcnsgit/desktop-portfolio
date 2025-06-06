import { generateId } from './utils';

export type ItemType = 'File' | 'Folder' | 'App' | 'Shortcut' | 'Unknown';

// Forward declaration to avoid circular dependency
export interface IDesktopModel {
    handleDoubleClick: (itemId: string) => void;
    createAndOpenWindowFromType: (appType: string, title: string, payload?: any) => any;
    windowManager: any;
    // Add other methods as needed
}

export interface IDesktopItem {
    readonly id: string;
    name: string;
    readonly type: ItemType;
    icon: string;
    parentId: string | null;
    path?: string;
    onDoubleClick: (desktop: IDesktopModel) => void;
    renderIcon: () => string;
    setParent: (parentId: string | null) => void;
}

export abstract class DesktopItemBase implements IDesktopItem {
    public readonly id: string;
    public parentId: string | null = null;

    constructor(
        public name: string,
        public readonly type: ItemType,
        public icon: string,
        public path?: string
    ) {
        this.id = generateId(type.toLowerCase());
    }

    abstract onDoubleClick(desktop: IDesktopModel): void;

    renderIcon(): string {
        return `${this.icon} ${this.name}`;
    }

    setParent(parentId: string | null): void {
        this.parentId = parentId;
    }
} 