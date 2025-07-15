

// Base UI Configuration for Windows
export const TASKBAR_HEIGHT = 30;
export const DEFAULT_SCROLLBAR_WIDTH = 17;
export const THIN_SCROLLBAR_WIDTH = 13;
export const START_MENU_WIDTH = 250;

// Animation and Transition Timings
export const TRANSITIONS_IN_MILLISECONDS = {
  WINDOW: 200,
  TASKBAR_ITEM: 300,
  MENU: 150,
};

// TRANSITIONS IN SECONDS
export const TRANSITIONS_IN_SECONDS = {
  WINDOW: TRANSITIONS_IN_MILLISECONDS.WINDOW / 1000,
  TASKBAR_ITEM: TRANSITIONS_IN_MILLISECONDS.TASKBAR_ITEM / 1000,
};

// DEFAULT WINDOW SIZE
export const DEFAULT_WINDOW_SIZE: { width: number; height: number } = {
  width: 500,
  height: 400,
};

export const DEFAULT_WINDOW_POSITION: { x: number; y: number } = {
  x: 100,
  y: TASKBAR_HEIGHT + 30,
};

// WINDOW TYPES
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

export const WINDOW_SIZES: Record<string, { width: number; height: number }> = {
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
export const WINDOW_STATES = {
  OPEN: "open",
  MINIMIZED: "minimized",
  MAXIMIZED: "maximized",
};

// export const WINDOW_ANIMATIONS = {
//   CLOSE_DURATION: 300,
//   MINIMIZE_DURATION: 300,
//   MAXIMIZE_DURATION: 300,
//   RESTORE_DURATION: 250,
//   OPEN_DURATION: 200,
//   FOCUS_TRANSITION: 100,
// };

// /**
//  * Class names for window states
//  */
// export const WINDOW_CLASSES = {
//   WINDOW: "window",
//   ACTIVE: "active",
//   MINIMIZED: "minimized",
//   MAXIMIZED: "maximized",
//   RESTORING: "restoring",
//   MINIMIZING: "minimizing",
//   MAXIMIZING: "maximizing",
//   DRAGGING: "dragging",
//   RESIZING: "resizing",
//   TITLE_BAR: "title-bar",
//   CONTENT: "content",
//   CONTROLS: "controls",
// };

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