// src/constants/windowConstants.ts
// Constants for window management across the application

/**
 * Z-index constants for proper layering of UI elements
 */
export const Z_INDEX = {
  DESKTOP: 1,
  WINDOW_MINIMIZED: 100,
  START_MENU: 150,
  WINDOW_NORMAL: 1000,
  WINDOW_ACTIVE: 2000,
  CONTEXT_MENU: 3000,
  TASKBAR: 2500,
  DIALOG: 4000,
  MODAL: 500,
  TOOLTIP: 600,
};

// Window sizing constraints
export const WINDOW_SIZE_CONSTRAINTS = {
  MIN_WIDTH: 250,
  MIN_HEIGHT: 150,
  DEFAULT_WIDTH: 500,
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

// Window position constants
export const WINDOW_POSITIONS = {
  TASKBAR_HEIGHT: 30,
  BASE_OFFSET_X: 100,
  BASE_OFFSET_Y: 50,
  CASCADE_OFFSET_X: 20,
  CASCADE_OFFSET_Y: 20,
  MIN_VISIBLE_PART: 100,
};

/**
 * Default window sizes by type
 */
export const WINDOW_DEFAULT_SIZES = {
  fileexplorer: { width: 600, height: 450 },
  texteditor: { width: 550, height: 400 },
  imageviewer: { width: 500, height: 450 },
  about: { width: 480, height: 400 },
  project: { width: 600, height: 500 },
  contact: { width: 500, height: 400 },
  skills: { width: 550, height: 450 },
  weatherapp: { width: 500, height: 460 },
  folder: { width: 550, height: 400 },
  default: { width: 500, height: 400 },
};

/**
 * Animation timings for window transitions
 */
export const WINDOW_ANIMATIONS = {
  MINIMIZE_DURATION: 300,
  MAXIMIZE_DURATION: 250,
  RESTORE_DURATION: 250,
  OPEN_DURATION: 200,
  CLOSE_DURATION: 200,
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
  SAVE_DELAY: 500, // Delay before saving state after changes
  ANIMATION_BUFFER: 50, // Extra buffer time after animations
  WINDOW_TRANSITION: 200, // Duration for window transitions
  MENU_TRANSITION: 150,
  DOUBLE_CLICK_THRESHOLD: 500, // Time threshold for double-click detection
};
