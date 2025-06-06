import { DesktopItemBase, IDesktopModel } from './DesktopItem';
// import { WindowModel } from './Window'; // Not directly used in App.ts

export class App extends DesktopItemBase {
    constructor(name: string, private appType: string, icon: string = '🚀', path?: string) { // Added appType, path; updated signature
        super(name, 'App', icon, path); // Pass path to super
        if (!path && appType !== 'calculator' && appType !== 'settings') { // Example: some apps might not have/need a path
            console.warn(`[App] App '${name}' of type '${appType}' created without a path.`);
        }
    }

    onDoubleClick(desktop: IDesktopModel): void {
        console.log(`[App] Double-clicked App: ${this.name} (Type: ${this.appType}). Launching...`);
        // Use createAndOpenWindowFromType for apps, passing the specific appType
        desktop.createAndOpenWindowFromType(this.appType, this.name, { sourceItemId: this.id, appPath: this.path });
    }

    renderIcon(): string { // Added missing renderIcon method
        return `${this.icon} ${this.name}`;
    }
} 