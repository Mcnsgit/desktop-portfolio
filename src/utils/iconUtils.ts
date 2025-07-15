// src/utils/iconUtils.ts
import { FileType } from '@/types/fs';
import { FS } from '@/config/constants';

/**
 * Resolves the final icon path for a desktop item based on its type and name.
 * If the item has a specific icon, it will be used. Otherwise, it falls back
 * to icons based on the item's type or file extension.
 *
 * @param item - An object representing the item, requiring a `type` and `name`.
 *               An `icon` property can be provided to override default icons.
 * @returns A string path to the resolved icon.
 */
export function resolveItemIcon(item: { icon?: string; type: FileType; name: string }): string {
  // 1. Use the item's specific icon if it exists.
  if (item.icon) {
    return item.icon;
  }

  // 2. Fallback based on item type.
  switch (item.type) {
    case FileType.FOLDER:
      return FS.ICONS.FOLDER;
    case FileType.TEXT:
    case FileType.MARKDOWN:
      return FS.ICONS.TEXT_FILE;
    case FileType.HTML:
      return '/assets/icons/html-0.png'; // Specific icon for HTML
    case FileType.IMAGE:
      return FS.ICONS.IMAGE_FILE;
    case FileType.PROGRAM:
    case FileType.EXE:
      return FS.APP_ICON;
    case FileType.PROJECT:
    case FileType.PORTFOLIO:
      return FS.ICONS.PROJECTS;
    case FileType.CONTACT:
      return FS.ICONS.CONTACT;
    case FileType.ABOUT:
      return FS.ICONS.ABOUT_ME;
    case FileType.SETTINGS:
      return FS.ICONS.SETTINGS;
    case FileType.EDUCATION:
      return '/assets/icons/certificate_seal.png';
    case FileType.VIDEO:
      return '/assets/icons/video_mk-5.png';
    default:
      // For other file types, attempt to resolve by extension from the name.
      const extension = item.name.split('.').pop()?.toLowerCase() || '';
      if (FS.TEXT_EXTENSIONS.has(`.${extension}`)) {
        return FS.ICONS.TEXT_FILE;
      }
      if (FS.IMAGE_EXTENSIONS.has(`.${extension}`)) {
        return FS.ICONS.IMAGE_FILE;
      }
      // Default to a generic file icon if no other rule matches.
      return FS.ICONS.FILE;
  }
} 