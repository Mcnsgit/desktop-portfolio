// src/utils/constants/fileSystemConstants.ts
// File System
export const FS_ROOT = "/";
export const HOME_PATH = "/home/guest";
export const DESKTOP_PATH = `${HOME_PATH}/Desktop`;
export const DOCUMENTS_PATH = `${HOME_PATH}/Documents`;
export const PICTURES_PATH = `${HOME_PATH}/Pictures`;
export const PROJECTS_PATH = "/projects";
export const SYSTEM_PATH = "/system";
export const SYSTEM_ICONS_PATH = `${SYSTEM_PATH}/icons`;
export const SYSTEM_WALLPAPERS_PATH = `${SYSTEM_PATH}/wallpapers`;
export const TMP_PATH = "/tmp";

export const DEFAULT_TEXT_FILE_SAVE_PATH = `${DESKTOP_PATH}/Untitled.txt`;

// File types and extensions
export const TEXT_FILE_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".html",
  ".htm",
  ".css",
  ".js",
  ".json",
  ".xml",
  ".csv",
]);

export const IMAGE_FILE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".svg",
  ".webp",
]);

export const AUDIO_FILE_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".aac",
  ".flac",
  ".ogg",
]);

export const VIDEO_FILE_EXTENSIONS = new Set([".mp4", ".webm", ".ogg", ".mov"]);

export const SHORTCUT_EXTENSION = ".lnk";

// Icons paths
export const DEFAULT_ICON = "/assets/icons/file_lines-0.png";
export const FOLDER_ICON = "/assets/icons/directory_closed-1.png";
export const OPEN_FOLDER_ICON = "/assets/icons/directory_open_file_mydocs_cool-3.png";
export const FILE_ICON = "/assets/icons/file_win_shortcut-2.png";
export const TEXT_FILE_ICON = "/assets/icons/notepad_file-0.png";
export const IMAGE_FILE_ICON = "/assets/icons/kodak_imaging-0.png";
export const SHORTCUT_ICON = "/assets/icons/users_key-0.png";

export const APP_ICONS = {
  TEXT_EDITOR: "/assets/icons/notepad_file-0.png",
  FILE_EXPLORER: "/assets/icons/directory_explorer-0.png",
  ABOUT: "/assets/icons/address_book_user.png",
  WEATHER: "/assets/icons/sun-0.png",
  PROJECTS: "/assets/icons/briefcase-0.png",
  SKILLS: "/assets/icons/card_reader-3.png",
  CONTACT: "/assets/icons/msn3-5.png",
  EDUCATION: "/assets/icons/certificate_seal.png",
  TODO_LIST: "/assets/icons/wia_img_check-1.png",
  SETTINGS: "/assets/icons/settings_gear-0.png",
}; 