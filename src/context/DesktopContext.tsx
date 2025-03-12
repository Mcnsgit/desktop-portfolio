import React, {createContext,useReducer, useContext} from "react";
import {Project, Window}from '../types';

type DesktopState= {
    windows: Window[];
    activeWindowId:string | null;
    projects:Project[];
    startMenuOpen:boolean;
};

type DesktopAction = 
  | { type: 'OPEN_WINDOW'; payload: Window }
  | { type: 'CLOSE_WINDOW'; payload: { id: string } }
  | { type: 'FOCUS_WINDOW'; payload: { id: string } }
  | { type: 'MINIMIZE_WINDOW'; payload: { id: string } }
  | { type: 'TOGGLE_START_MENU'; payload?: { startMenuOpen?: boolean } } // Optional payload
  | { type: 'INIT_PROJECTS'; payload: { projects: Project[] } };

const desktopReducer = (state: DesktopState, action: DesktopAction): DesktopState => {
  switch (action.type) {
      case 'INIT_PROJECTS':
      return {
        ...state,
        projects: action.payload.projects
      };
    case 'OPEN_WINDOW':
      // Check if window is already open
      const existingWindow = state.windows.find(w => w.id === action.payload.id);
      if (existingWindow) {
        // Focus the window instead
        return {
          ...state,
          activeWindowId: action.payload.id,
          windows: state.windows.map(w => 
            w.id === action.payload.id 
              ? { ...w, minimized: false } 
              : w
          )
        };
      }
      
      // Add new window
      return {
        ...state,
        windows: [...state.windows, action.payload],
        activeWindowId: action.payload.id
      };
    
    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.payload.id),
        activeWindowId: state.activeWindowId === action.payload.id 
          ? state.windows.length > 1 
            ? state.windows[state.windows.length - 2].id 
            : null
          : state.activeWindowId
      };
    
    case 'FOCUS_WINDOW':
      return {
        ...state,
        activeWindowId: action.payload.id,
        windows: state.windows.map(w => 
          w.id === action.payload.id 
            ? { ...w, minimized: false } 
            : w
        )
      };
    
    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.payload.id 
            ? { ...w, minimized: true } 
            : w
        ),
        activeWindowId: state.activeWindowId === action.payload.id
          ? state.windows.find(w => w.id !== action.payload.id && !w.minimized)?.id || null
          : state.activeWindowId
      };
    
    // Then update the desktopReducer case for TOGGLE_START_MENU
    case 'TOGGLE_START_MENU':
      // If payload is provided with startMenuOpen, use it
      // Otherwise do the toggle behavior
      return {
        ...state,
        startMenuOpen: action.payload?.startMenuOpen !== undefined
          ? action.payload.startMenuOpen
          : !state.startMenuOpen
      };
    
    default:
      return state;
  }
};

const initialState: DesktopState = {
  windows: [],
  activeWindowId: null,
  projects: [], // This will be populated from projects.ts
  startMenuOpen: false,
};

const DesktopContext = createContext<{
  state: DesktopState;
  dispatch: React.Dispatch<DesktopAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const DesktopProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(desktopReducer, initialState);
  
  return (
    <DesktopContext.Provider value={{ state, dispatch }}>
      {children}
    </DesktopContext.Provider>
  );
};

export const useDesktop = () => useContext(DesktopContext);
