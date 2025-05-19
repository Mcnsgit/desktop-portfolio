import { DesktopItem } from '../types';

/**
 * Reconstructs the full file system path for a DesktopItem.
 * @param itemId The ID of the DesktopItem.
 * @param allDesktopItems Array of all DesktopItems to resolve parentage.
 * @param rootPath The base path for items at the root (parentId is null), e.g., '/Desktop'. Defaults to '/'.
 * @returns The reconstructed file system path, e.g., /Desktop/MyFolder/MyFile.txt.
 */
export function getDesktopItemPath(
  itemId: string | null,
  allDesktopItems: DesktopItem[],
  rootPath: string = '' // Assuming desktop items with parentId: null are at FS root e.g. /filename.txt
): string {
  if (!itemId) return rootPath || '/'; // Return root if no itemId

  let currentItem = allDesktopItems.find(item => item.id === itemId);
  if (!currentItem) {
    console.warn(`getDesktopItemPath: Item with ID ${itemId} not found.`);
    return rootPath || '/'; // Should not happen if itemId is valid and from the list
  }

  // If the item itself has a path, prefer that (it's canonical)
  if (currentItem.path) {
    return currentItem.path;
  }

  // Fallback: reconstruct path from titles if item.path is not set
  console.warn(`getDesktopItemPath: Reconstructing path for ${itemId} based on titles. Consider populating item.path directly.`);
  const pathSegments: string[] = [];
  let tempItem: DesktopItem | undefined = currentItem;

  while (tempItem) {
    pathSegments.unshift(tempItem.title);
    if (!tempItem.parentId) break; // Reached an item with null parentId
    tempItem = allDesktopItems.find(item => item.id === tempItem!.parentId);
    if (!tempItem && currentItem.parentId) {
        // This case means a parentId was specified, but the parent item isn't in allDesktopItems
        // This could indicate an orphaned item or incomplete data.
        // Prepending just '...' to indicate a broken path part.
        pathSegments.unshift('...'); 
        console.warn(`getDesktopItemPath: Parent item with ID ${currentItem.parentId} not found for item ${currentItem.id}.`);
        break; 
    }
  }
  
  // Join segments. If rootPath is '/', ensure we don't get '//segment'.
  // If rootPath is empty (meaning items at desktop are true FS root), prepend '/'.
  let finalPath = pathSegments.join('/');
  if (rootPath === '/') {
    finalPath = `/${finalPath}`.replace('//', '/');
  } else if (rootPath) {
    finalPath = `${rootPath}/${finalPath}`.replace('//', '/');
  } else {
    finalPath = `/${finalPath}`.replace('//', '/');
  }

  return finalPath;
} 