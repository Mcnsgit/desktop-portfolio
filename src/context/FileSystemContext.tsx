// src/context/FileSystemContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { browserFS, initFileSystem } from '../utils/browserFileSystem';

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

  // Initialize file system
  useEffect(() => {
    const initFS = async () => {
      try {
        // Check if persistence was previously enabled
        const persistenceEnabled = localStorage.getItem('retroos-persistence') === 'true';
        setIsPersistent(persistenceEnabled);

        // Initialize file system with persistence setting
        await initFileSystem(persistenceEnabled);
        setIsReady(true);
        console.log('File system initialized successfully');
      } catch (err) {
        console.error('Failed to initialize file system:', err);
        setError(err instanceof Error ? err : new Error(String(err)));

        // Try to initialize without persistence as fallback
        try {
          await initFileSystem(false);
          setIsPersistent(false);
          setIsReady(true);
          console.log('File system initialized with fallback mode (no persistence)');
        } catch (fallbackErr) {
          console.error('Critical failure initializing file system:', fallbackErr);
          setError(fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr)));
        }
      }
    };

    initFS();
  }, []);

  // Toggle persistence setting
  const togglePersistence = useCallback(async (): Promise<boolean> => {
    try {
      const newPersistenceValue = !isPersistent;

      // Re-initialize file system with new persistence setting
      await initFileSystem(newPersistenceValue);

      // Update persistence setting
      setIsPersistent(newPersistenceValue);
      localStorage.setItem('retroos-persistence', newPersistenceValue.toString());

      console.log(`Persistence ${newPersistenceValue ? 'enabled' : 'disabled'}`);
      return true;
    } catch (err) {
      console.error('Failed to toggle persistence:', err);
      return false;
    }
  }, [isPersistent]);

  // Create a file
  const createFile = useCallback(async (path: string, content: string): Promise<boolean> => {
    try {
      browserFS.writeFileSync(path, content);
      return true;
    } catch (error) {
      console.error(`Error creating file ${path}:`, error);
      return false;
    }
  }, []);

  // Read a file
  const readFile = useCallback(async (path: string): Promise<string | null> => {
    try {
      // Handle shortcuts (.lnk files)
      if (path.endsWith('.lnk')) {
        return browserFS.readFileSync(path, { encoding: 'utf8' }) as string;
      }

      return browserFS.readFileSync(path, { encoding: 'utf8' }) as string;
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      return null;
    }
  }, []);

  // Delete a file or directory
  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    try {
      const stats = browserFS.statSync(path);

      if (stats.isDirectory()) {
        // Check if directory is empty
        const entries = browserFS.readdirSync(path);
        if (entries.length > 0) {
          // Recursively delete contents
          for (const entry of entries) {
            await deleteFile(`${path}/${entry}`);
          }
        }

        browserFS.rmdirSync(path);
      } else {
        browserFS.unlinkSync(path);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting ${path}:`, error);
      return false;
    }
  }, []);

  // Create a directory
  const createDirectory = useCallback(async (path: string): Promise<boolean> => {
    try {
      browserFS.mkdirSync(path, { recursive: true });
      return true;
    } catch (error) {
      console.error(`Error creating directory ${path}:`, error);
      return false;
    }
  }, []);

  // List directory contents
  const listDirectory = useCallback(async (path: string): Promise<Array<{ name: string, isDirectory: boolean, isLink: boolean, linkTarget?: string }>> => {
    try {
      if (!browserFS.existsSync(path)) {
        return [];
      }

      const entries = browserFS.readdirSync(path);
      const result = [];

      for (const entry of entries) {
        const fullPath = `${path}/${entry}`.replace(/\/\//g, "/");
        let isLink = false;
        let linkTarget = '';
        let isDirectory = false;

        try {
          const stats = browserFS.statSync(fullPath);
          isDirectory = stats.isDirectory();

          // Check if it's a symbolic link
          isLink = stats.isSymbolicLink();
          if (isLink) {
            linkTarget = browserFS.readlinkSync(fullPath);
          }

          // Check if it's a .lnk file (shortcut)
          if (entry.endsWith('.lnk')) {
            isLink = true;
            try {
              linkTarget = browserFS.readFileSync(fullPath, { encoding: 'utf8' }) as string;
            } catch (error) {
              console.warn(`Error reading shortcut ${fullPath}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Error checking file status for ${fullPath}:`, error);
        }

        result.push({
          name: entry,
          isDirectory,
          isLink,
          ...(isLink && { linkTarget })
        });
      }

      return result;
    } catch (error) {
      console.error(`Error listing directory ${path}:`, error);
      return [];
    }
  }, []);

  // Move a file or directory
  const moveFile = useCallback(async (oldPath: string, newPath: string): Promise<boolean> => {
    try {
      browserFS.renameSync(oldPath, newPath);
      return true;
    } catch (error) {
      console.error(`Error moving ${oldPath} to ${newPath}:`, error);
      return false;
    }
  }, []);

  // Copy a file
  const copyFile = useCallback(async (sourcePath: string, destinationPath: string): Promise<boolean> => {
    try {
      if (!browserFS.existsSync(sourcePath)) {
        return false;
      }

      // Ensure parent directory exists
      const dirPath = destinationPath.substring(0, destinationPath.lastIndexOf('/'));
      if (!browserFS.existsSync(dirPath)) {
        browserFS.mkdirSync(dirPath, { recursive: true });
      }

      const stats = browserFS.statSync(sourcePath);

      if (stats.isDirectory()) {
        // Create destination directory
        if (!browserFS.existsSync(destinationPath)) {
          browserFS.mkdirSync(destinationPath, { recursive: true });
        }

        // Copy all contents
        const entries = browserFS.readdirSync(sourcePath);
        for (const entry of entries) {
          await copyFile(
            `${sourcePath}/${entry}`,
            `${destinationPath}/${entry}`
          );
        }
      } else {
        // Copy file content
        const content = browserFS.readFileSync(sourcePath, { encoding: 'utf8' });
        browserFS.writeFileSync(destinationPath, content as string);
      }

      return true;
    } catch (error) {
      console.error(`Error copying ${sourcePath} to ${destinationPath}:`, error);
      return false;
    }
  }, []);

  // Get file information
  const getFileInfo = useCallback(async (path: string): Promise<{ size: number, modified: Date, isDirectory: boolean } | null> => {
    try {
      const stats = browserFS.statSync(path);

      return {
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error(`Error getting file info for ${path}:`, error);
      return null;
    }
  }, []);

  // Create a shortcut
  const createShortcut = useCallback(async (path: string, target: string): Promise<boolean> => {
    try {
      // Ensure path ends with .lnk
      const shortcutPath = path.endsWith('.lnk') ? path : `${path}.lnk`;

      // Ensure parent directory exists
      const dirPath = shortcutPath.substring(0, shortcutPath.lastIndexOf('/'));
      if (!browserFS.existsSync(dirPath)) {
        browserFS.mkdirSync(dirPath, { recursive: true });
      }

      browserFS.writeFileSync(shortcutPath, target);
      return true;
    } catch (error) {
      console.error(`Error creating shortcut ${path} to ${target}:`, error);
      return false;
    }
  }, []);

  // Resolve a shortcut to its target
  const resolveShortcut = useCallback(async (path: string): Promise<string | null> => {
    try {
      if (!browserFS.existsSync(path)) {
        return null;
      }

      if (path.endsWith('.lnk')) {
        return browserFS.readFileSync(path, { encoding: 'utf8' }) as string;
      }

      return null;
    } catch (error) {
      console.error(`Error resolving shortcut ${path}:`, error);
      return null;
    }
  }, []);

  // Refresh file system
  const refreshFileSystem = useCallback(async (): Promise<void> => {
    try {
      await initFileSystem(isPersistent);
      console.log('File system refreshed');
    } catch (error) {
      console.error('Error refreshing file system:', error);
    }
  }, [isPersistent]);

  // Error handling
  if (error && !isReady) {
    return (
      <div style={{
        padding: '20px',
        margin: '20px',
        border: '1px solid #f00',
        backgroundColor: '#fff0f0',
        color: '#d00'
      }}>
        <h3>File System Error</h3>
        <p>Failed to initialize file system: {error.message}</p>
        <p>Try refreshing the page or check browser compatibility.</p>
      </div>
    );
  }

  const value = {
    isReady,
    isPersistent,
    togglePersistence,
    createFile,
    readFile,
    deleteFile,
    createDirectory,
    listDirectory,
    moveFile,
    copyFile,
    getFileInfo,
    createShortcut,
    resolveShortcut,
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
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

export default FileSystemContext;