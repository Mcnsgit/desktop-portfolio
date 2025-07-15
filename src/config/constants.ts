// src/config/constants.ts

// --- Enums and Derived Types ---
export const Enums = {
  ItemType: { APP: 'app', FILE: 'file', FOLDER: 'folder' },
  WindowState: { OPEN: 'open', MINIMIZED: 'minimized', MAXIMIZED: 'maximized' },
} as const;

export type ItemType = typeof Enums.ItemType[keyof typeof Enums.ItemType];
export type WindowState = typeof Enums.WindowState[keyof typeof Enums.WindowState];

export const UI = {
    DEFAULT_THEME: "win98",
    ICON_SIZE: 32,
    DESKTOP_ICON_GRID: { width: 80, height: 90 },
    DEFAULT_WALLPAPER: "/backgrounds/bg1.jpg",
    WALLPAPERS: [
      "/backgrounds/bg1.jpg",
      "/backgrounds/bg2.jpg",
      "/backgrounds/bg3.jpg",
    ],
    Colors: {
      primary: "#050816",
      secondary: "#151030",
      textPrimary: "#ffffff",
      textSecondary: "#aaa6c3",
      accent: "#0078d7",
      background: "#ffffff",
      foreground: "#171717",
    },
    win98Colors: {
      win98Bg: "#c0c0c0",
      win98BorderLight: "#dfdfdf",
      win98BorderDark: "#808080",
      win98BorderActiveLight: "#efefef",
      win98BorderActiveDark: "#505050",
      win98ContentBg: "#c0c0c0",
      win98TitleActiveBg: "#000080",
      win98TitleInactiveBg: "#808080",
      win98TitleTextColor: "#ffffff",
      win98ButtonFace: "#c0c0c0",
      win98ButtonHighlight: "#ffffff",
      win98TextDark: "#000000",
      win98TextLight: "#ffffff",
      win98ShadowColor: "rgba(0, 0, 0, 0.3)",
    },
  } as const;

  // Animation timings
  export const TIMINGS = {
    DOUBLE_CLICK_MS: 500,
    FADE_DURATION_S: 0.15,
    WINDOW_ANIMATION_DURATION_S: 0.2,
  } as const;


// --- File System & Icons ---
export const FS = {
  ROOT: "/",
  DESKTOP_PATH: "/home/guest/Desktop",

  DEFAULT_ICON: "/assets/icons/file_lines-0.png",
  FOLDER_ICON: "/assets/icons/directory_closed-1.png",
  APP_ICON: "/assets/icons/executable-0.png",

  TEXT_EXTENSIONS: new Set([".txt", ".md"]),
  IMAGE_EXTENSIONS: new Set([".jpg", ".jpeg", ".png", ".gif"]),
  ICONS: {
    DEFAULT: "/assets/icons/default-application.png",
    FOLDER: "/assets/icons/directory_closed-1.png",
    FOLDER_OPEN: "/assets/icons/directory_open_file_mydocs_cool-3.png",
    TEXT_FILE: "/assets/icons/notepad_file-0.png",
    FILE: "/assets/icons/file_lines-0.png",
    ABOUT_ME: "/assets/icons/address_book_user.png",
    PROJECTS: "/assets/icons/briefcase-0.png",
    CONTACT: "/assets/icons/msn3-5.png",
    TEXT_EDITOR: "/assets/icons/notepad_file-0.png",
    FILE_EXPLORER: "/assets/icons/computer_explorer-3.png",
    BROWSER: "/assets/icons/internet_connection_wiz-4.png",
    SETTINGS: "/assets/icons/settings_gear-0.png",
    TODO_LIST: "/assets/icons/checklist-.png",
    WEATHER_APP: "/assets/icons/world-5.png",
    IMAGE_FILE: "/assets/icons/kodak_imaging-0.png",
    APP_TEXT_EDITOR: "/assets/icons/notepad_file-0.png",
    APP_PROJECTS: "/assets/icons/briefcase-0.png",
    START_MENU: "/assets/icons/start-menu.png",
    WINDOW_GAME: "/assets/icons/joystick-5.png",
    WINDOW_EXPLORER: "/assets/icons/directory_explorer-0.png",
    WINDOW_START: "/assets/icons/start-menu.png",
    BACKEND: "/assets/icons/backend-dev.png",
    CREATOR: "/assets/icons/creator-icon.png",
    MOBILE: "/assets/icons/mobile-icon-removebg-preview.png",
    MINIMIZE: "/assets/icons/minimize-24px.png",
    MAXIMIZE: "/assets/icons/maximize-24px.png",
    CLOSE: "/assets/icons/close-24px.png",
    VOLUME_ON: "/assets/icons/Loudspeaker-on.png",
    VOLUME_OFF: "/assets/icons/loudspeaker-Muted.png",
    INTERNET_CONNECTION: "/assets/icons/internet_connection_wiz-4.png",
    CAMERA: "/assets/icons/camera-0.png",
  },
} as const;

// --- Application Action Types (for Reducers) ---
export const ACTION_TYPES = {
  // Window Actions
  OPEN_WINDOW: 'OPEN_WINDOW',
  CLOSE_WINDOW: 'CLOSE_WINDOW',
  FOCUS_WINDOW: 'FOCUS_WINDOW',
  MINIMIZE_WINDOW: 'MINIMIZE_WINDOW',
  TOGGLE_MAXIMIZE: 'TOGGLE_MAXIMIZE',
  UPDATE_WINDOW_POSITION: 'UPDATE_WINDOW_POSITION',
  UPDATE_WINDOW_SIZE: 'UPDATE_WINDOW_SIZE',
  // Desktop Item Actions
  CREATE_ITEM: 'CREATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  UPDATE_ITEM_POSITION: 'UPDATE_ITEM_POSITION',
  // System Actions
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_BOOT_STATUS: 'SET_BOOT_STATUS',
  SET_MOBILE: 'SET_MOBILE',
} as const;


// --- Sounds ---
export const SOUNDS = {
    CLICK: "click",
    ERROR: "error",
    STARTUP: "startup",
    WINDOW_OPEN: "windowOpen",
    WINDOW_CLOSE: "windowClose",
    WINDOW_MINIMIZE: "windowMinimize",
  } as const;

// --- Actions ---
export const PACKAGE = {
    NAME: "RetroOS",
    VERSION: "1.0.0",
    AUTHOR: "Miguel Cardiga",
    EMAIL: "cardigamiguel221@gmail.com",
  } as const;

// --- Keyboard Shortcuts ---
export const KEYBOARD_SHORTCUTS = {
  CLOSE_WINDOW: "Escape",
  MINIMIZE_WINDOW: "Alt+Down",
  NEW_FILE: "Control+n",
  OPEN_FILE: "Control+o",
  SAVE_FILE: "Control+s",
  COPY: "Control+c",
  PASTE: "Control+v",
  CUT: "Control+x",
} as const;




// export const DEFAULT_PERSIST_FILES = false;
// export const MAX_RECENT_FILES = 10;

// export const MILLISECONDS_IN_SECOND = 1000;
// export const MILLISECONDS_IN_MINUTE = 60000;
// export const MILLISECONDS_IN_HOUR = 3600000;
// export const MILLISECONDS_IN_DAY = 86400000;
export const LOGOS = {
  WEB: "/assets/icons/web.png",
  MOBILE: "/assets/icons/mobile.png",
  CREATOR: "/assets/icons/creator.png",
  BACKEND: "/assets/icons/backend.png",
  PYTHON: "/assets/logos/tech-logos/python.png",
  REACTJS: "/assets/logos/tech-logos/reactjs.png",
  REDUX: "/assets/logos/tech-logos/redux.png",
  TAILWIND: "/assets/logos/tech-logos/tailwind.png",
  NODEJS: "/assets/logos/tech-logos/nodejs.png",
  MONGODB: "/assets/logos/tech-logos/mongodb.png",
  THREEJS: "/assets/logos/tech-logos/threejs.png",
  GIT: "/assets/logos/tech-logos/git.png",
  FIGMA: "/assets/logos/tech-logos/figma.png",
  DOCKER: "/assets/logos/tech-logos/docker.png",
  HTML: "/assets/logos/tech-logos/html.png",
  CSS: "/assets/logos/tech-logos/css.png",
  JAVASCRIPT: "/assets/logos/tech-logos/javascript.png",
  TYPESCRIPT: "/assets/logos/tech-logos/typescript.png",
  SHOPIFY: "/assets/logos/company/shopify.png",

} as const;