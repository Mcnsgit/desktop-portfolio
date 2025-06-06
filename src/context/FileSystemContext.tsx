// src/context/FileSystemContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { browserFS, initFileSystem, BrowserFileSystem } from '../utils/browserFileSystem';

interface FileSystemContextType {
  isLoaded: boolean;
  isReady: boolean;
  isPersistent: boolean;
  fsInstance?: BrowserFileSystem;
  togglePersistence: () => Promise<boolean>;
  createFile: (path: string, content: string) => Promise<boolean>;
  readFile: (path: string) => Promise<string | null>;
  deleteFile: (path: string) => Promise<boolean>;
  createDirectory: (path: string) => Promise<boolean>;
  removeDirectory: (path: string) => Promise<boolean>;
  listDirectory: (path: string) => Promise<Array<{ name: string, isDirectory: boolean, isLink: boolean, linkTarget?: string }>>;
  moveFile: (oldPath: string, newPath: string) => Promise<boolean>;
  copyFile: (sourcePath: string, destinationPath: string) => Promise<boolean>;
  getFileInfo: (path: string) => Promise<{ size: number, modified: Date, isDirectory: boolean, isSymbolicLink: boolean } | null>;
  createShortcut: (path: string, target: string) => Promise<boolean>;
  resolveShortcut: (path: string) => Promise<string | null>;
  refreshFileSystem: () => Promise<void>;
  exists: (path: string) => Promise<boolean>;
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
      // If turning OFF persistence, we want to keep the localStorage data but load a fresh in-memory FS.
      // If turning ON, we want to clear in-memory and try to load from localStorage or init fresh.
      browserFS.reset(false); // Reset in-memory state ONLY, don't clear 'retroos-filesystem' from localStorage yet.
      
      await initFileSystem(newPersistenceValue); // Re-initialize with the new persistence setting
                                                // If newPersistenceValue is true, it will try to load from 'retroos-filesystem' or create default & persist.
                                                // If newPersistenceValue is false, it will create a default in-memory FS.

      setIsPersistent(newPersistenceValue);
      localStorage.setItem('retroos-persistence', newPersistenceValue.toString()); // Store the INTENT to persist for next full load
      setIsReady(true); // Mark as ready again
      console.log(`FS Context: Persistence toggled to ${newPersistenceValue}. Filesystem re-initialized.`);
      return true;
    } catch (err) {
      console.error('FS Context: Failed to toggle persistence:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Attempt to revert? Safer to leave in failed state and let user retry/refresh.
      // Revert the localStorage item for persistence INTENT
      localStorage.setItem('retroos-persistence', isPersistent.toString()); 
      // Should we try to re-init with the old persistence value?
      // For now, we leave FS in a potentially unready state with error.
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

  const removeDirectory = useCallback(async (path: string): Promise<boolean> => {
    try {
      if (browserFS.existsSync(path)) {
        // Check if directory is empty first, as rmdirSync might require it depending on FS backend
        const items = browserFS.readdirSync(path);
        if (items.length > 0) {
          // Optionally, implement recursive delete or return error for non-empty directory
          // For now, let's attempt to delete and let browserFS handle it (it might fail for non-empty on some backends)
          // A more robust solution would be a recursive delete utility if needed.
          console.warn(`Attempting to delete non-empty directory: ${path}. This might fail or have unintended consequences.`);
        }
        browserFS.rmdirSync(path); // Use rmdirSync for directories
        return true;
      }
      return false; // Directory does not exist
    } catch (error) {
      console.error(`Error removing directory ${path}:`, error);
      return false;
    }
  }, []);

  // List directory contents
  const listDirectory = useCallback(async (path: string): Promise<Array<{ name: string, isDirectory: boolean, isLink: boolean, linkTarget?: string }>> => {
    try {
      const items = browserFS.readdirSync(path);
      return items.map(name => {
        const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
        let isDirectory = false;
        let isLink = false;
        let linkTarget: string | undefined = undefined;

        try {
          const stats = browserFS.statSync(fullPath);
          isDirectory = stats.isDirectory();
          isLink = stats.isSymbolicLink();
          if (isLink) {
            linkTarget = browserFS.readlinkSync(fullPath);
          }
          // Handling .lnk files, assuming they are files containing target path
          if (name.endsWith('.lnk')) {
            isLink = true; // Treat .lnk as a link
            try {
                linkTarget = browserFS.readFileSync(fullPath, { encoding: 'utf8' }) as string;
            } catch (e) {
                console.warn(`Error reading .lnk target for ${fullPath}:`, e);
                linkTarget = '!error';
            }
          }
        } catch (e) {
          console.warn(`Error stating file ${fullPath} in listDirectory:`, e);
          // Default to file if stat fails, or could return an error object
        }
        return { name, isDirectory, isLink, linkTarget };
      });
    } catch (error) {
      console.error(`Error listing directory ${path}:`, error);
      return [];
    }
  }, []);

  const moveFile = useCallback(async (oldPath: string, newPath: string): Promise<boolean> => {
    try {
      browserFS.renameSync(oldPath, newPath);
      return true;
    } catch (error) {
      console.error(`Error moving file from ${oldPath} to ${newPath}:`, error);
      return false;
    }
  }, []);

  const copyFile = useCallback(async (sourcePath: string, destinationPath: string): Promise<boolean> => {
    try {
      const content = browserFS.readFileSync(sourcePath); // Reads as Uint8Array or string
      browserFS.writeFileSync(destinationPath, content);
      return true;
    } catch (error) {
      console.error(`Error copying file from ${sourcePath} to ${destinationPath}:`, error);
      return false;
    }
  }, []);

  const getFileInfo = useCallback(async (path: string): Promise<{ size: number, modified: Date, isDirectory: boolean, isSymbolicLink: boolean } | null> => {
    try {
      const stats = browserFS.statSync(path);
      return {
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isSymbolicLink: stats.isSymbolicLink(),
      };
    } catch (error) {
      console.error(`Error getting file info for ${path}:`, error);
      return null;
    }
  }, []);

  const createShortcut = useCallback(async (path: string, target: string): Promise<boolean> => {
    try {
      // Ensure .lnk extension, browserFS.writeFileSync handles target as content
      const shortcutPath = path.endsWith('.lnk') ? path : `${path}.lnk`;
      browserFS.writeFileSync(shortcutPath, target);
      return true;
    } catch (error) {
      console.error(`Error creating shortcut ${path} to ${target}:`, error);
      return false;
    }
  }, []);

  const resolveShortcut = useCallback(async (path: string): Promise<string | null> => {
    try {
      if (path.endsWith('.lnk')) {
        // .lnk files store target as their content
        const target = browserFS.readFileSync(path, { encoding: 'utf8' });
        return target as string;
      } else {
        // For actual symlinks (if browserFS supports them differently)
        // This part might need adjustment based on how browserFS handles non .lnk symlinks
        const stats = browserFS.statSync(path);
        if (stats.isSymbolicLink()) {
          return browserFS.readlinkSync(path);
        }
      }
      return null; // Not a recognized shortcut/link type
    } catch (error) {
      console.error(`Error resolving shortcut ${path}:`, error);
      return null;
    }
  }, []);

  const exists = useCallback(async (path: string): Promise<boolean> => {
    try {
      return browserFS.existsSync(path);
    } catch (error) {
      console.error(`Error checking existence of ${path}:`, error);
      return false; // Assume not exists on error
    }
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
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [isPersistent]);

  // Error UI (remains same)
  if (error && !isReady) { /* ... */ }

  const value = {
    isLoaded: isReady,
    isReady,
    isPersistent,
    fsInstance: browserFS,
    togglePersistence,
    resetFileSystem,
    createFile,
    readFile,
    deleteFile,
    createDirectory,
    removeDirectory,
    listDirectory,
    moveFile,
    copyFile,
    getFileInfo,
    createShortcut,
    resolveShortcut,
    refreshFileSystem,
    exists,
  };
  return (
    <FileSystemContext.Provider value={{ ...value, isLoaded: isReady }}>
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