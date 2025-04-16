// src/context/FileSystemContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { browserFS, initFileSystem } from '../utils/browserFileSystem';
import { err } from '@zenfs/core/internal/log.js';

interface FileSystemContextType {
  isReady: boolean;
  isPersistent: boolean;
  togglePersistence: () => Promise<boolean>;
  createFile: (path: string, content: string) => Promise<boolean>;
  readFile: (path: string) => Promise<string | null>;
  deleteFile: (path: string) => Promise<boolean>;
  createDirectory: (path: string) => Promise<boolean>;
  listDirectory: (path: string) => Promise<Array<{ name: string, isDirectory: boolean, isLink: boolean, linkTarget?: string }>>;
  moveFile: (oldPath: string, newPath: string) => Promise<boolean>;
  copyFile: (sourcePath: string, destinationPath: string) => Promise<boolean>;
  getFileInfo: (path: string) => Promise<{ size: number, modified: Date, isDirectory: boolean } | null>;
  createShortcut: (path: string, target: string) => Promise<boolean>;
  resolveShortcut: (path: string) => Promise<string | null>;
  refreshFileSystem: () => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true; // Track mount status for async operations
    const initFS = async () => {
      setError(null);
      try {
        const persistenceEnabled = localStorage.getItem('retroos-persistence') === 'true';
        console.log(`FS Context: Initializing with persistence = ${persistenceEnabled}`);
        await initFileSystem(persistenceEnabled); // Call the exported init function
        if (isMounted) {
            setIsPersistent(persistenceEnabled);
            setIsReady(true);
            console.log('FS Context: File system ready.');
        }
      } catch (err) {
        console.error('FS Context: Failed to initialize file system:', err);
         if (isMounted) {
            setError(error instanceof Error ? error : new Error(String(error)));
            // Maybe set isReady to true even on error, but provide error state?
            // Or keep isReady false and show error UI.
         }
      }
    };
    initFS();
    return () => { isMounted = false; }; // Cleanup function
  }, [error]);


  const togglePersistence = useCallback(async (): Promise<boolean> => {
    const newPersistenceValue = !isPersistent;
    console.log(`FS Context: Toggling persistence to ${newPersistenceValue}`);
    setIsReady(false); // Mark as not ready during toggle
    setError(null);
    try {
      browserFS.reset(); // Use the fixed reset method
      await initFileSystem(newPersistenceValue); // Re-initialize

      setIsPersistent(newPersistenceValue);
      localStorage.setItem('retroos-persistence', newPersistenceValue.toString());
      setIsReady(true); // Mark as ready again
      console.log(`FS Context: Persistence toggled to ${newPersistenceValue}. Filesystem re-initialized.`);
      return true;
    } catch (err) {
      console.error('FS Context: Failed to toggle persistence:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Attempt to revert? Safer to leave in failed state and let user retry/refresh.
      localStorage.setItem('retroos-persistence', isPersistent.toString()); // Revert setting
      // Don't set isReady back to true on error
      return false;
    }
 }, [isPersistent]);


  const resetFileSystem = useCallback(async () => {
     console.log("FS Context: Resetting file system...");
     setIsReady(false); // Mark as not ready
     setError(null);
     try {
        browserFS.reset(); // Calls internal reset and clears localStorage item
        await initFileSystem(false); // Re-initialize non-persistent
        setIsPersistent(false);
        setIsReady(true);
        console.log("FS Context: File system reset to defaults.");
     } catch (err) {
         console.error("FS Context: Error during reset:", err);
         setError(err instanceof Error ? err : new Error(String(err)));
     }
  }, []);

  // --- File Operation Wrappers (using browserFS) ---
  // Wrap browserFS methods in async functions for consistency if needed,
  // though the current implementation uses them directly which is fine.
  // Example:
   const createFile = useCallback(async (path: string, content: string): Promise<boolean> => {
        try {
             browserFS.writeFileSync(path, content); // Already calls persist if enabled
             return true;
        } catch (error) { /*...*/ return false; }
    }, []);

  // Read a file
  const readFile = useCallback(async (path: string): Promise<string | null> => {
    try {
      if (!browserFS.existsSync(path)) {
        return null;
      }
      const content = browserFS.readFileSync(path, { encoding: 'utf8' });
      return content as string;
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      return null;
    }
  }, []);
  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    try {
      if (browserFS.existsSync(path)) {
        browserFS.unlinkSync(path);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      return false;
    }
  }, []);

  const createDirectory = useCallback(async (path: string): Promise<boolean> => {
    try {
      if (!browserFS.existsSync(path)) {
        browserFS.mkdirSync(path, { recursive: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error creating directory ${path}:`, error);
      return false;
    }
  }, []);
  // List directory contents
  const listDirectory = useCallback(async (path: string): Promise<Array<{ name: string, isDirectory: boolean, isLink: boolean, linkTarget?: string }>> => {
    return []; // Return an empty array as a placeholder
  }, []);

  const moveFile = useCallback(async (oldPath: string, newPath: string): Promise<boolean> => {
    return false; // Return false as a placeholder
  }, []);

  const copyFile = useCallback(async (sourcePath: string, destinationPath: string): Promise<boolean> => {
    return false; // Return false as a placeholder
  }, []);

  const getFileInfo = useCallback(async (path: string): Promise<{ size: number, modified: Date, isDirectory: boolean } | null> => {
    return null; // Return null as a placeholder
  }, []);

  const createShortcut = useCallback(async (path: string, target: string): Promise<boolean> => {
    return false; // Return false as a placeholder
  }, []);

  const resolveShortcut = useCallback(async (path: string): Promise<string | null> => {
    return null; // Return null as a placeholder
  }, []);

  const refreshFileSystem = useCallback(async (): Promise<void> => {
    console.log("FS Context: Refreshing file system (re-initializing)...");
    setIsReady(false);
    setError(null);
    try {
      await initFileSystem(isPersistent); // Re-initialize with current setting
      setIsReady(true);
      console.log('FS Context: File system refreshed.');
    } catch (error) {
      console.error('FS Context: Error refreshing file system:', error);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [isPersistent]);

  // Error UI (remains same)
  if (error && !isReady) { /* ... */ }

  const value = {
    isReady, isPersistent, togglePersistence, resetFileSystem, // Added reset
    createFile, readFile, deleteFile, createDirectory, listDirectory,
    moveFile, copyFile, getFileInfo, createShortcut, resolveShortcut,
    refreshFileSystem
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = (): FileSystemContextType => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
export default FileSystemContext;