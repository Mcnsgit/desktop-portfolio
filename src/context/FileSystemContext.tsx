import React, { createContext, useContext, useState, useEffect } from "react";
import { initFileSystem, fs, loadDefaultFiles } from "@/utils/fileSystem";

//define the context type
interface FileSystemContextType {
  fs: typeof fs | null;
  isLoaded: boolean;
  isPersistent: boolean;
  error: Error | null;
  togglePersistence: () => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>({
  fs: null,
  isLoaded: false,
  isPersistent: false,
  error: null,
  togglePersistence: () => {},
});

// Provider component
export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fileSystem, setFileSystem] = useState<typeof fs | null>(null);

  // Initialize the file system
  useEffect(() => {
    const loadFileSystem = async () => {
      try {
        // Try to detect if localStorage is available
        const storageAvailable =
          typeof window !== "undefined" &&
          typeof window.localStorage !== "undefined";

        // Initialize with persistence if localStorage is available
        const useLocalStorage = storageAvailable && isPersistent;

        console.log(
          "Initializing filesystem with persistence:",
          useLocalStorage
        );

        // Initialize the filesystem
        await initFileSystem(useLocalStorage);

        // Load default project files
        await loadDefaultFiles();

        setFileSystem(fs);
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to initialize file system:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Unknown error initializing file system")
        );
        setIsLoaded(true); // Mark as loaded even on error to avoid infinite loading
      }
    };

    loadFileSystem();
  }, [isPersistent]);

  // Toggle between persistent and in-memory storage
  const togglePersistence = () => {
    setIsLoaded(false); // Reset loaded state
    setIsPersistent((prev) => !prev); // Toggle persistence flag
  };

  return (
    <FileSystemContext.Provider
      value={{
        fs: fileSystem,
        isLoaded,
        isPersistent,
        error,
        togglePersistence,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};

// Custom hook for using the file system context
export const useFileSystem = () => useContext(FileSystemContext);

export default FileSystemProvider;
export { FileSystemContext };
