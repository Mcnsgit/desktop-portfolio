// src/components/fileSystem/FileExplorerWindow.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useFileSystem } from '../../context/FileSystemContext';
import { useDesktop } from '../../context/DesktopContext';
import styles from '../styles/FileExplorerWindow.module.scss';
import { useSounds } from '@/hooks/useSounds';
import ImageWithFallback from '@/utils/ImageWithFallback';

interface FileExplorerWindowProps {
  initialPath?: string;
}

interface FileItem {
  name: string;
  isDirectory: boolean;
  isLink: boolean;
  linkTarget?: string;
  path: string;
}

const FileExplorerWindow: React.FC<FileExplorerWindowProps> = ({
  initialPath = '/home/guest'
}) => {
  const { dispatch } = useDesktop();
  const fileSystem = useFileSystem();
  const { playSound } = useSounds();

  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [items, setItems] = useState<FileItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load folder contents
  const loadFolderContents = useCallback(async (path: string) => {
    if (!path || !fileSystem.isReady) return;

    setLoading(true);
    setError(null);
    setSelectedItem(null);

    try {
      const contents = await fileSystem.listDirectory(path);

      // Map directory contents to file items
      const fileItems: FileItem[] = contents.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory,
        isLink: item.isLink,
        linkTarget: item.linkTarget,
        path: `${path}/${item.name}`.replace(/\/\//g, '/')
      }));

      setItems(fileItems);
    } catch (err) {
      console.error(`Error loading folder contents for ${path}:`, err);
      setError(`Failed to load folder contents: ${err}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fileSystem]);

  // Load folder contents when path changes
  useEffect(() => {
    if (fileSystem.isReady && currentPath) {
      loadFolderContents(currentPath);
    }
  }, [currentPath, loadFolderContents, fileSystem.isReady]);

  // Handle item double click
  const handleItemDoubleClick = async (item: FileItem) => {
    playSound('click');

    if (item.isDirectory) {
      // Navigate to directory
      setCurrentPath(item.path);
    } else if (item.isLink) {
      // Handle shortcut
      if (item.linkTarget) {
        if (item.linkTarget.startsWith('app:')) {
          // Launch application
          const appName = item.linkTarget.replace('app:', '');
          // You would need to implement the appropriate app launching logic here
          console.log(`Launching app: ${appName}`);
        } else {
          // Navigate to target path
          const targetPath = await fileSystem.resolveShortcut(item.path);
          if (targetPath) {
            setCurrentPath(targetPath);
          }
        }
      }
    } else {
      // Open file based on extension
      const extension = item.name.includes('.') ? item.name.split('.').pop()?.toLowerCase() : '';

      switch (extension) {
        case 'txt':
        case 'md':
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
        case 'css':
        case 'html':
          // Open in text editor
          dispatch({
            type: 'OPEN_WINDOW',
            payload: {
              id: `texteditor-${Date.now()}`,
              title: `Text Editor - ${item.name}`,
              content: { filePath: item.path },
              minimized: false,
              position: { x: 120, y: 120 },
              type: 'texteditor',
            }
          });
          break;
        default:
          // Default to text editor for unknown types
          dispatch({
            type: 'OPEN_WINDOW',
            payload: {
              id: `texteditor-${Date.now()}`,
              title: `Text Editor - ${item.name}`,
              content: { filePath: item.path },
              minimized: false,
              position: { x: 120, y: 120 },
              type: 'texteditor',
            }
          });
      }
    }
  };

  // Handle item selection
  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.path);
  };

  // Handle navigation to parent directory
  const handleNavigateUp = () => {
    if (currentPath === '/') return;

    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    setCurrentPath(parentPath || '/');
    playSound('click');
  };

  // Get appropriate icon for file type
  const getFileIcon = (item: FileItem) => {
    if (item.isDirectory) {
      return '/assets/win98-icons/png/directory_open-0.png';
    }

    if (item.isLink) {
      return '/assets/win98-icons/png/shortcut-0.png';
    }

    const extension = item.name.includes('.') ? item.name.split('.').pop()?.toLowerCase() : '';

    switch (extension) {
      case 'txt':
        return '/assets/win98-icons/png/notepad_file-0.png';
      case 'md':
        return '/assets/win98-icons/png/notepad_file-0.png';
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return '/assets/win98-icons/png/file_lines-0.png';
      case 'html':
        return '/assets/win98-icons/png/html-0.png';
      case 'css':
        return '/assets/win98-icons/png/file_lines-0.png';
      default:
        return '/assets/win98-icons/png/file_blank-0.png';
    }
  };

  // If file system is not ready, show loading
  if (!fileSystem.isReady) {
    return (
      <div className={styles.fileExplorer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Initializing file system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fileExplorer}>
      <div className={styles.toolbar}>
        <button
          onClick={handleNavigateUp}
          className={styles.toolbarButton}
          title="Up"
        >
          Up
        </button>
        <div className={styles.breadcrumbs}>
          <span className={styles.currentPath}>{currentPath}</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading folder contents...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={() => loadFolderContents(currentPath)} className={styles.retryButton}>
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyFolder}>
          <p>This folder is empty.</p>
        </div>
      ) : (
        <div className={styles.folderContents}>
          <div className={styles.itemsContainer}>
            {items.map((item) => (
              <div
                key={item.path}
                className={`${styles.fileItem} ${selectedItem === item.path ? styles.selected : ''}`}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
              >
                <div className={styles.fileIcon}>
                  <ImageWithFallback
                    src={getFileIcon(item)}
                    alt={item.name}
                    width={16}
                    height={16}
                    fallbackSrc="/assets/win98-icons/png/file_windows-0.png"
                  />
                </div>
                <div className={styles.fileName}>
                  {item.name}
                  {item.isLink && <span className={styles.shortcutIndicator}>↗</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.statusBar}>
        <div className={styles.statusText}>
          {items.length} items
        </div>
      </div>
    </div>
  );
};

export default FileExplorerWindow;