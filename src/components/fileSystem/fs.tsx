export abstract class Item {
  #name: string = '';
  #parent: Directory | null = null;

  abstract get copy(): Item;
  constructor(name: string) {
    if (this.constructor.name === 'Item') {
      throw new Error('Item class is Abstract. It can only be extended');
    }
    this.name = name;
  }
  get path(): string {
    if (this.parent) {
      return `${this.parent.path}/${this.name}`;
    }
    return this.name;
  }
  get name(): string {
    return this.#name;
  }
  set name(newName: string) {
    if (!newName || typeof newName !== 'string' || !newName.trim().length) {
      throw new Error('Item name must be a non empty string');
    }
    if (newName.includes('/')) {
      throw new Error('Item name contains invalid symbol');
    }
    if (this.parent && this.parent.hasItem(newName)) {
      throw new Error(`Item with name of "${newName}" already exists in this directory`);
    }
    this.#name = newName.trim();
  }
  get parent(): Directory | null {
    return this.#parent;
  }
  set parent(newParent: Directory | null) {
    if (newParent !== this.#parent) {
      const prevParent = this.#parent;
      this.#parent = newParent;
      if (prevParent) {
        prevParent.removeItem(this.name);
      }
      if (newParent) {
        newParent.insertItem(this);
      }
    }
  }
}
export class File extends Item {
  #type: string = 'text';
  #mimeType: string = 'txt';
  #textContent: string = '';
  #source: any = null; // Define a type for source if known
  constructor(name: string = '', textContent: string = '', source: any = null) {
    super(name || 'un-named file');
    this.textContent = textContent;
    this.source = source;
  }
  get textContent(): string {
    return this.#textContent;
  }
  set textContent(content: string) {
    this.#textContent = `${content || ''}`;
  }
  get source(): any {
    return this.#source;
  }
  set source(newSource: any) {
    this.#source = newSource;
    if (newSource && newSource.type) {
      let [type, mime] = newSource.type.split('/');
      type = type.match(/[\w-]+/g);
      mime = mime.match(/[\w-]+/g);
      this.#type = type = 'text';
      this.#mimeType = !mime || mime[0] === 'plain' ? 'txt' : mime[0];
    }
  }
  get type(): string {
    return this.#type;
  }
  get mimeType(): string {
    return this.#mimeType;
  }
  get copy(): File {
    return new File(`${this.name} copy`, this.textContent, this.source);
  }
}
export const DIRECTORY_TYPE = {
  DEFAULT: 'DEFAULT'
};
export class Directory extends Item {
  #type: string = DIRECTORY_TYPE.DEFAULT;
  #children: Map<string, Item> = new Map();
  constructor(name: string = '', type: string = DIRECTORY_TYPE.DEFAULT) {
    super(name || 'un-named directory');
    this.#type = Object.keys(DIRECTORY_TYPE).includes(type) ? type : DIRECTORY_TYPE.DEFAULT;
  }
  get content(): Item[] {
    return Array.from(this.#children.values());
  }
  get type(): string {
    return this.#type;
  }
  get copy(): Directory {
    const dirCopy = new Directory(this.name, this.type);
    this.content.forEach(item => {
      const itemCopy = item.copy as Item;
      itemCopy.name = item.name;
      dirCopy.insertItem(itemCopy);
    });
    return dirCopy;
  }
  hasItem(itemName: string): boolean {
    return this.#children.has(itemName);
  }
  insertItem(item: Item): boolean {
    if (this.hasItem(item.name)) return false;
    if (item === this) throw new Error('Directory cannot contain itself');
    let parent = this.parent;
    while (parent !== null) {
      if (parent === item) {
        throw new Error('Directory cannot contain one of its ancestors');
      }
      parent = parent.parent;
    }
    this.#children.set(item.name, item);
    item.parent = this;
    return this.hasItem(item.name);
  }
  getItem(itemName: string): Item | null {
    return this.#children.get(itemName) || null;
  }
  removeItem(itemName: string): boolean {
    const item = this.getItem(itemName);
    if (item) {
      this.#children.delete(itemName);
      item.parent = null;
    }
    return !this.hasItem(itemName);
  }
}
export class FileSystem {
  #self: Directory = new Directory('root');
  #currentDirectory: Directory = this.#self;
  #currentDirectoryPath: Directory[] = [this.#currentDirectory];
  get currentDirectory(): Directory {
    return this.#currentDirectory;
  }
  get currentDirectoryPath(): string[] {
    return this.#currentDirectoryPath.map(dir => `${dir.name}`);
  }
  get root(): Directory {
    return this.#self;
  }
  get name(): string {
    return this.root.name;
  }
  get copy(): FileSystem {
    const fsCopy = new FileSystem();
    this.root.content.forEach(item => {
      const itemCopy = item.copy;
      itemCopy.name = item.name;
      fsCopy.insertItem(itemCopy);
    });
    return fsCopy;
  }
  get content(): Item[] {
    return this.currentDirectory.content;
  }
  createFile(fileName: string, ...options: any[]): File | null {
    const newFile = new File(fileName, ...options);
    const inserted = this.insertItem(newFile);
    return inserted ? newFile : null;
  }
  createDirectory(dirName: string, type: string = DIRECTORY_TYPE.DEFAULT): Directory | null {
    const newDir = new Directory(dirName, type);
    const inserted = this.currentDirectory.insertItem(newDir);
    return inserted ? newDir : null;
  }
  insertItem(item: Item): boolean {
    return this.currentDirectory.insertItem(item);
  }
  getItem(itemName: string): Item | null {
    return this.currentDirectory.getItem(itemName);
  }
  hasItem(itemName: string): boolean {
    return this.currentDirectory.hasItem(itemName);
  }
  removeItem(itemName: string): boolean {
    return this.currentDirectory.removeItem(itemName);
  }
  renameItem(currentName: string, newName: string): Item | null {
    const item = this.getItem(currentName);
    if (item) {
      item.name = newName;
      this.removeItem(currentName);
      this.insertItem(item);
      return item;
    }
    return null;
  }
  copyItem(itemName: string): Item | null {
    const item = this.getItem(itemName);
    if (item) {
      const itemCopy = item.copy;
      this.insertItem(itemCopy);
      return itemCopy;
    }
    return null;
  }
  printCurrentDirectory(): void {
    console.log(
      `\n[${this.currentDirectoryPath.join('/')}]:` +
      (this.currentDirectory.content.map(item =>
        `\n[${item.constructor.name.substring(0, 1)}]-> ${item.name}`).join('') || '\n(empty)')
    );
  }
  openDirectory(path: string): Directory | null {
    if (!path) return null;
    let dir = this.#getDirectoryFromPath(path);
    if (!(dir && dir instanceof Directory)) return null;
    const dirPath = [dir];
    let parent = dir.parent;
    while (parent) {
      dirPath.unshift(parent);
      parent = parent.parent;
    }
    this.#currentDirectory = dir;
    this.#currentDirectoryPath = dirPath;
    return dir;
  }
  goBack(steps: number = 1): Directory | null {
    if (isNaN(steps) || steps <= 0 || steps >= this.currentDirectoryPath.length) return null;
    let dir = this.currentDirectory;
    let stepsMoved = steps;
    while (dir && stepsMoved > 0) {
      if (dir.parent) {
        dir = dir.parent;
      }
      stepsMoved -= 1;
    }
    if (dir && dir !== this.currentDirectory) {
      this.#currentDirectory = dir;
      this.#currentDirectoryPath = this.#currentDirectoryPath
        .slice(0, this.#currentDirectoryPath.length - (steps - stepsMoved));
    }
    return dir;
  }
  goBackToDirectory(dirName: string): Directory | null {
    const dirIndex = this.currentDirectoryPath.lastIndexOf(dirName, this.currentDirectoryPath.length - 2);
    if (dirIndex < 0) return null;
    const dir = dirIndex === 0 ? this.root : this.#currentDirectoryPath[dirIndex];
    this.#currentDirectory = dir;
    this.#currentDirectoryPath = this.#currentDirectoryPath.slice(0, dirIndex + 1);
    return dir;
  }
  findItem(itemNameOrValidatorFunc: string | ((item: Item) => boolean), fromDirectory: Directory = this.root): Item | null {
    return this.#setupAndFind(itemNameOrValidatorFunc, fromDirectory, false) as Item | null;
  }
  findAllItems(itemNameOrValidatorFunc: string | ((item: Item) => boolean), fromDirectory: Directory = this.root): Item[] {
    const result = this.#setupAndFind(itemNameOrValidatorFunc, fromDirectory, true);
    return Array.isArray(result) ? result : [];
  }
  moveItemTo(itemName: string, dirPath: string): Directory | null {
    const item = this.getItem(itemName);
    if (item) {
      const dir = this.#getDirectoryFromPath(dirPath);
      if (dir && dir instanceof Directory) {
        dir.insertItem(item);
        return dir;
      }
    }
    return null;
  }
  #setupAndFind = (itemNameOrValidatorFunc: string | ((item: Item) => boolean), fromDirectory: Directory, multiple?: boolean) => {
    if (typeof itemNameOrValidatorFunc === 'function') {
      return this.#findItem(itemNameOrValidatorFunc, fromDirectory, multiple);
    }
    const func = (item: Item) => item.name === itemNameOrValidatorFunc;
    return this.#findItem(func, fromDirectory, multiple);
  }
  #findItem = (isItem: (item: Item) => boolean, dir: Directory, multiple: boolean = false): Item | Item[] | null => {
    let match: Item | Item[] | null = multiple ? [] : null;
    let directories: Directory[] = [];
    for (const item of dir.content) {
      if (isItem(item)) {
        if (multiple) {
          (match as Item[]).push(item);
        } else {
          match = item;
          break;
        }
      }
      if (item instanceof Directory) {
        directories.push(item);
      }
    }
    if ((match === null || multiple) && directories.length) {
      for (const subDir of directories) {
        const found = this.#findItem(isItem, subDir, multiple);
        if (multiple) {
          (match as Item[]).push(...(found as Item[]));
        } else if (found) {
          match = found;
          break;
        }
      }
    }
    return match;
  }
  #getDirectoryFromPath = (dirPath: string): Directory | null => {
    if (dirPath.match(/^(root\/?|\/)$/g)) {
      return this.root;
    }
    if (dirPath.match(/^\.\/?$/g)) {
      return this.currentDirectory;
    }
    let dir = dirPath.match(/^(root\/?|\/)/g) ? this.root : this.currentDirectory;
    const paths = dirPath.replace(/^(root\/|\.\/|\/)/g, '').split('/');
    while (paths.length) {
      const item = dir.getItem(paths.shift() as string);
      if (item instanceof Directory) {
        dir = item;
      } else {
        return null;
      }
      if (!dir || !(dir instanceof Directory)) {
        return null;
      }
    }
    if (paths.length === 0) {
      return dir;
    }
    return null;
  }
}