// src/constants/index.ts
import { Position, Size } from "../../types";

// Environment information
export const PACKAGE_DATA = {
  name: "RetroOS",
  version: "1.0.0",
  description: "Retro-styled desktop environment in the browser",
  author: {
    name: "Miguel Cardiga",
    email: "cardigamiguel221@gmail.com",
    url: "https://github.com/miguelcardiga",
  },
  license: "MIT",
};

// Base UI Configuration
export const DEFAULT_THEME = "win98";
export const TASKBAR_HEIGHT = 30;
export const DEFAULT_SCROLLBAR_WIDTH = 17;
export const THIN_SCROLLBAR_WIDTH = 13;
export const START_MENU_WIDTH = 250;
export const ICON_SIZE = 32;
export const ICON_SPACING = 20;
export const DESKTOP_ICON_WIDTH = 80;
export const DESKTOP_ICON_HEIGHT = 90;

// Animation and Transition Timings
export const TRANSITIONS_IN_MILLISECONDS = {
  WINDOW: 200,
  TASKBAR_ITEM: 300,
  MENU: 150,
  DOUBLE_CLICK: 500,
  LONG_PRESS: 750,
  MOUSE_IN_OUT: 300,
};

export const TRANSITIONS_IN_SECONDS = {
  WINDOW: TRANSITIONS_IN_MILLISECONDS.WINDOW / 1000,
  TASKBAR_ITEM: TRANSITIONS_IN_MILLISECONDS.TASKBAR_ITEM / 1000,
};

// Window Management
export const DEFAULT_WINDOW_SIZE: Size = {
  width: 500,
  height: 400,
};

export const DEFAULT_WINDOW_POSITION: Position = {
  x: 100,
  y: TASKBAR_HEIGHT + 30,
};

export const WINDOW_TYPES = {
  ABOUT: "about",
  TEXT_EDITOR: "texteditor",
  FILE_EXPLORER: "fileexplorer",
  IMAGE_VIEWER: "imageviewer",
  WEATHER_APP: "weatherapp",
  PROJECT: "project",
  FOLDER: "folder",
  CONTACT: "contact",
  SKILLS: "skills",
  SETTINGS: "settings",
  BROWSER: "browser",
  TODO_LIST: "todolist",
};

export const WINDOW_SIZES: Record<string, Size> = {
  fileexplorer: { width: 600, height: 450 },
  texteditor: { width: 550, height: 400 },
  imageviewer: { width: 500, height: 450 },
  about: { width: 480, height: 400 },
  project: { width: 600, height: 500 },
  contact: { width: 500, height: 400 },
  skills: { width: 550, height: 450 },
  weatherapp: { width: 500, height: 460 },
  todolist: { width: 450, height: 500 },
  default: { width: 500, height: 400 },
};

export const DEFAULT_CASCADE_OFFSET = {
  X: 20,
  Y: 20,
};

export const MIN_VISIBLE_WINDOW_EDGE = 100;

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

// Sound effects
export const SOUNDS = {
  CLICK: "click",
  ERROR: "error",
  WINDOW_OPEN: "windowOpen",
  WINDOW_CLOSE: "windowClose",
  STARTUP: "startup",
  ALERT: "alert",
};

// Icons paths
export const DEFAULT_ICON = "/assets/icons/win98/png/file_lines-0.png";
export const FOLDER_ICON = "/assets/icons/win98/png/directory_closed-1.png";
export const OPEN_FOLDER_ICON = "/assets/icons/win98/png/directory_open_file_mydocs_cool-3.png";
export const FILE_ICON = "/assets/icons/win98/png/file_win_shortcut-2.png";
export const TEXT_FILE_ICON = "/assets/icons/win98/png/notepad_file-0.png";
export const IMAGE_FILE_ICON = "/assets/icons/win98/png/kodak_imaging-0.png";
export const SHORTCUT_ICON = "/assets/icons/win98/png/users_key-0.png";

export const APP_ICONS = {
  TEXT_EDITOR: "/assets/win98-icons/png/notepad_file-0.png",
  FILE_EXPLORER: "/assets/win98-icons/png/directory_explorer-0.png",
  ABOUT: "/assets/win98-icons/png/address_book_user.png",
  WEATHER: "/assets/win98-icons/png/sun-0.png",
  PROJECTS: "/assets/win98-icons/png/briefcase-0.png",
  SKILLS: "/assets/win98-icons/png/card_reader-3.png",
  CONTACT: "/assets/win98-icons/png/msn3-5.png",
};

// Desktop wallpapers
export const DEFAULT_WALLPAPER_INDEX = 0;
export const WALLPAPERS = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
];

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  CLOSE_WINDOW: "Escape",
  MINIMIZE_WINDOW: "Alt+Down",
  NEW_FILE: "Control+n",
  OPEN_FILE: "Control+o",
  SAVE_FILE: "Control+s",
  COPY: "Control+c",
  PASTE: "Control+v",
  CUT: "Control+x",
};

// App settings
export const DEFAULT_PERSIST_FILES = false;
export const MAX_RECENT_FILES = 10;
// export const PIXEL_RATIO = devicePixelRatio || 1;

// Utility constants
export const MILLISECONDS_IN_SECOND = 1000;
export const MILLISECONDS_IN_MINUTE = 60000;
export const MILLISECONDS_IN_HOUR = 3600000;
export const MILLISECONDS_IN_DAY = 86400000;

// Animation/UI constants for components
export const FADE_ANIMATION = {
  animate: { opacity: 1 },
  initial: { opacity: 0 },
  transition: { duration: 0.15 },
};

export const WINDOW_ANIMATION = {
  animate: { opacity: 1, scale: 1 },
  initial: { opacity: 0, scale: 0.95 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
};

// React Context related constants
export const CONTEXT_INITIALIZING = "initializing";
export const CONTEXT_READY = "ready";
export const CONTEXT_ERROR = "error";

// Browser compatibility
export const STORAGE_AVAILABLE = typeof localStorage !== "undefined";
// export const IS_TOUCH_DEVICE =
//   "ontouchstart" in window || navigator.maxTouchPoints > 0;

/**
 * Z-index constants for proper layering of UI elements
 */
export const Z_INDEX = {
  DESKTOP: 1,
  WINDOW_MINIMIZED: 100,
  TASKBAR: 500,
  WINDOW_NORMAL: 510,
  WINDOW_FOCUSED: 510,
  WINDOW_ACTIVE: 510,
  START_MENU: 600,
  MODAL: 650,
  CONTEXT_MENU: 700,
  DIALOG: 800,
  TOOLTIP: 900,
};

// Window sizing constraints
export const WINDOW_SIZE_CONSTRAINTS = {
  MIN_WIDTH: 300,
  MIN_HEIGHT: 200,
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 400,
  EDITOR_WIDTH: 550,
  EDITOR_HEIGHT: 400,
  EXPLORER_WIDTH: 600,
  EXPLORER_HEIGHT: 450,
  VIEWER_WIDTH: 500,
  VIEWER_HEIGHT: 450,
  ABOUT_WIDTH: 480,
  ABOUT_HEIGHT: 400,
  PROJECT_WIDTH: 600,
  PROJECT_HEIGHT: 500,
  WEATHER_WIDTH: 500,
  WEATHER_HEIGHT: 460,
};

/**
 * Animation timings for window transitions
 */
export const WINDOW_ANIMATIONS = {
  CLOSE_DURATION: 300,
  MINIMIZE_DURATION: 300,
  MAXIMIZE_DURATION: 300,
  RESTORE_DURATION: 250,
  OPEN_DURATION: 200,
  FOCUS_TRANSITION: 100,
};

/**
 * Class names for window states
 */
export const WINDOW_CLASSES = {
  WINDOW: "window",
  ACTIVE: "active",
  MINIMIZED: "minimized",
  MAXIMIZED: "maximized",
  RESTORING: "restoring",
  MINIMIZING: "minimizing",
  MAXIMIZING: "maximizing",
  DRAGGING: "dragging",
  RESIZING: "resizing",
  TITLE_BAR: "title-bar",
  CONTENT: "content",
  CONTROLS: "controls",
};

/**
 * Window control button identifiers
 */
export const WINDOW_CONTROLS = {
  MINIMIZE: "minimize",
  MAXIMIZE: "maximize",
  CLOSE: "close",
  RESTORE: "restore",
};

/**
 * Sound effects for window actions
 */
export const WINDOW_SOUNDS = {
  FOCUS: "click",
  CLOSE: "windowClose",
  MINIMIZE: "windowClose",
  MAXIMIZE: "windowOpen",
  RESTORE: "windowOpen",
};

/**
 * Timing constants for debounce and throttle functions
 */
export const TIMING = {
  POSITION_UPDATE_DEBOUNCE: 50,
  RESIZE_THROTTLE: 50,
  SAVE_DELAY: 200,
  ANIMATION_BUFFER: 50, // Extra buffer time after animations
  WINDOW_TRANSITION: 200, // Duration for window transitions
  MENU_TRANSITION: 150,
  DOUBLE_CLICK_THRESHOLD: 500, // Time threshold for double-click detection
};

