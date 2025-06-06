import { generateId } from './utils';
import { IDesktopItem } from './DesktopItem';

export interface IWindow {
    id: string;
    title: string;
    content: any; // Allow any content for now, can be a specific union type later
    isOpen: boolean;
    isMinimized: boolean;
    isFocused: boolean;
    isMaximized?: boolean;
    sourceItem?: IDesktopItem;
    position: { x: number; y: number }; // Added from your existing types
    size: { width: number; height: number }; // Added from your existing types

    open(): void;
    close(): void;
    minimize(): void;
    restore(): void;
    focus(): void;
    unfocus(): void;
    render(): string; // For console simulation, can be adapted for UI
    toggleMaximize(): void;
}

export class WindowModel implements IWindow {
    public readonly id: string;
    public isOpen: boolean = false;
    public isMinimized: boolean = false;
    public isFocused: boolean = false;
    public isMaximized: boolean = false;
    public position: { x: number; y: number };
    public size: { width: number; height: number };

    constructor(
        public title: string,
        public content: any, // Allow any content
        public sourceItem?: IDesktopItem,
        initialPosition: { x: number; y: number } = { x: 100, y: 100 },
        initialSize: { width: number; height: number } = { width: 600, height: 400 }
    ) {
        this.id = generateId('window');
        this.position = initialPosition;
        this.size = initialSize;
    }

    open(): void {
        this.isOpen = true;
        this.isMinimized = false;
        console.log(`[WindowModel] '${this.title}' opened.`);
    }

    close(): void {
        this.isOpen = false;
        console.log(`[WindowModel] '${this.title}' closed.`);
    }

    minimize(): void {
        if (!this.isOpen) return;
        this.isMinimized = true;
        this.isFocused = false;
        console.log(`[WindowModel] '${this.title}' minimized.`);
    }

    restore(): void {
        if (!this.isOpen) return;
        this.isMinimized = false;
        console.log(`[WindowModel] '${this.title}' restored.`);
    }

    focus(): void {
        if (!this.isOpen || this.isMinimized) return;
        this.isFocused = true;
        console.log(`[WindowModel] '${this.title}' focused.`);
    }

    unfocus(): void {
        this.isFocused = false;
    }

    render(): string {
        if (!this.isOpen) return "";
        let status = "";
        if (this.isMinimized) status = " [Minimized]";
        if (this.isFocused) status += " [*Focused*]";

        // Adjust rendering for potentially complex content
        const contentString = typeof this.content === 'string' ? this.content : JSON.stringify(this.content, null, 2);

        return `\n--- Window: ${this.title}${status} ---\n` +
               (this.isMinimized ? "(Content hidden)" : contentString) +
               `\n--- End Window: ${this.title} ---`;
    }

    toggleMaximize(): void {
        if (!this.isOpen || this.isMinimized) return;
        this.isMaximized = !this.isMaximized;
        console.log(`[WindowModel] '${this.title}' ${this.isMaximized ? 'maximized' : 'restored from maximize'}.`);
    }
} 