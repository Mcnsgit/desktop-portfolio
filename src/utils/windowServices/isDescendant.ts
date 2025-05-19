import { DesktopItem } from '../../types';

/**
 * Checks if potentialChildId is a descendant of potentialParentId in the given items array.
 * @param items All desktop items (folders, files, etc)
 * @param potentialParentId The id of the potential parent
 * @param potentialChildId The id of the potential child
 * @returns true if potentialChildId is a descendant of potentialParentId
 */
export function isDescendant(
  items: DesktopItem[],
  potentialParentId: string,
  potentialChildId: string
): boolean {
  let currentId: string | null | undefined = potentialChildId;
  while (currentId) {
    const current = items.find(item => item.id === currentId);
    if (!current) break;
    if (current.parentId === potentialParentId) return true;
    currentId = current.parentId;
  }
  return false;
} 