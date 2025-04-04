// Enhanced FolderWindow.tsx with improved folder system implementation
import React, { useState, useEffect, useCallback } from 'react';
import { useFileSystem } from '../../context/FileSystemContext';
import { useDesktop } from '../../context/DesktopContext';
import Icon from '../desktop/Icon';
import styles from '../styles/FolderWindow.module.scss';
import { useSounds } from '@/hooks/useSounds';
import ImageWithFallback from '@/utils/ImageWithFallback';
import { launchApp } from '@/utils/appLauncher';

interface FolderWindowProps {
  folderId: string;
}

interface FileItem {
  name: string;
  isDirectory: boolean;
  isLink: boolean;
  linkTarget?: string;
  path: string;
}

const FolderWindow: React.FC<FolderWindowProps> = ({ folderId }) => {
  const { state, dispatch } = useDesktop();
  const { listDirectory, resolveShortcut } = useFileSystem();
  const { playSound } = useSounds();
  const [folderPath, setFolderPath] = useState<string>('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'icons' | 'list' | 'details'>('icons');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ path: string, name: string }[]>([]);

  // Find folder path from folder ID
  useEffect(() => {
    const folder = state.folders.find(f => f.id === folderId);
    if (folder) {
      setFolderPath(`/home/guest/Desktop/${folder.title}`);
    } else {
      // Default to Desktop if folder not found
      setFolderPath('/home/guest/Desktop');
    }
  }, [folderId, state.folders]);

  // Load folder contents
  const loadFolderContents = useCallback(async (path: string) => {
    if (!path) return;

    setLoading(true);
    setError(null);

    try {
      const contents = await listDirectory(path);

      // Map directory contents to file items
      const fileItems: FileItem[] = contents.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory,
        isLink: item.isLink,
        linkTarget: item.linkTarget,
        path: `${path}/${item.name}`
      }));

      // Sort items
      const sortedItems = sortItems(fileItems, sortBy, sortDirection);
      setItems(sortedItems);

      // Update breadcrumbs
      updateBreadcrumbs(path);
    } catch (error) {
      console.error(`Error loading folder contents for ${path}:`, error);
      setError(`Failed to load folder contents: ${error}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [listDirectory, sortBy, sortDirection]);

  // Update breadcrumbs based on current path
  const updateBreadcrumbs = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    const crumbs = [];

    let currentPath = '';
    for (const part of parts) {
      currentPath += `/${part}`;
      crumbs.push({
        name: part,
        path: currentPath
      });
    }

    setBreadcrumbs(crumbs);
  };

  // Sort items based on sort criteria
  const sortItems = (items: FileItem[], sortBy: string, direction: 'asc' | 'desc') => {
    return [...items].sort((a, b) => {
      // Directories always come first
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          // Get file extensions
          const extA = a.name.includes('.') ? a.name.split('.').pop() || '' : '';
          const extB = b.name.includes('.') ? b.name.split('.').pop() || '' : '';
          comparison = extA.localeCompare(extB);
          break;
        // Add other sort methods as needed
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Load folder contents when path changes
  useEffect(() => {
    if (folderPath) {
      loadFolderContents(folderPath);
    }
  }, [folderPath, loadFolderContents]);

  // Handle item double click
  const handleItemDoubleClick = async (item: FileItem) => {
    playSound('click');

    if (item.isDirectory) {
      // Navigate to directory
      setFolderPath(item.path);
    } else if (item.isLink) {
      // Handle shortcut
      if (item.linkTarget) {
        if (item.linkTarget.startsWith('app:')) {
          // Launch application
          const appName = item.linkTarget.replace('app:', '');
          launchApp(appName, dispatch);
        } else {
          // Navigate to target path
          const targetPath = await resolveShortcut(item.path);
          if (targetPath) {
            setFolderPath(targetPath);
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
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
          // Open in image viewer
          dispatch({
            type: 'OPEN_WINDOW',
            payload: {
              id: `imageviewer-${Date.now()}`,
              title: `Image Viewer - ${item.name}`,
              content: { filePath: item.path },
              minimized: false,
              position: { x: 150, y: 150 },
              type: 'imageviewer',
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
    if (folderPath === '/') return;

    const parentPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
    setFolderPath(parentPath || '/');
    playSound('click');
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (path: string) => {
    setFolderPath(path);
    playSound('click');
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'icons' | 'list' | 'details') => {
    setViewMode(mode);
    playSound('click');
  };

  // Handle sort change
  const handleSortChange = (sortKey: 'name' | 'type' | 'size' | 'date') => {
    if (sortBy === sortKey) {
      // Toggle direction if same sort key
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortKey);
      setSortDirection('asc');
    }
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
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return '/assets/win98-icons/png/image_file-0.png';
      default:
        return '/assets/win98-icons/png/file_windows-0.png';
    }
  };

  return (
    <div className={styles.folderWindow}>
      <div className={styles.toolbar}>
        <button onClick={handleNavigateUp} className={styles.toolbarButton}>
          Up
        </button>
        <div className={styles.breadcrumbs}>
          <button onClick={() => handleBreadcrumbClick('/')} className={styles.breadcrumbItem}>
            Root
          </button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <span className={styles.breadcrumbSeparator}>/</span>
              <button
                onClick={() => handleBreadcrumbClick(crumb.path)}
                className={styles.breadcrumbItem}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
        <div className={styles.viewControls}>
          <button
            onClick={() => handleViewModeChange('icons')}
            className={`${styles.viewButton} ${viewMode === 'icons' ? styles.active : ''}`}
          >
            Icons
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
          >
            List
          </button>
          <button
            onClick={() => handleViewModeChange('details')}
            className={`${styles.viewButton} ${viewMode === 'details' ? styles.active : ''}`}
          >
            Details
          </button>
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
          <button onClick={() => loadFolderContents(folderPath)} className={styles.retryButton}>
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyFolder}>
          <p>This folder is empty.</p>
        </div>
      ) : (
        <div className={`${styles.folderContents} ${styles[viewMode]}`}>
          {viewMode === 'details' && (
            <div className={styles.headerRow}>
              <div
                className={`${styles.headerCell} ${sortBy === 'name' ? styles.sorted : ''}`}
                onClick={() => handleSortChange('name')}
              >
                Name {sortBy === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
              <div
                className={`${styles.headerCell} ${sortBy === 'type' ? styles.sorted : ''}`}
                onClick={() => handleSortChange('type')}
              >
                Type {sortBy === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
              <div
                className={`${styles.headerCell} ${sortBy === 'size' ? styles.sorted : ''}`}
                onClick={() => handleSortChange('size')}
              >
                Size {sortBy === 'size' && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
              <div
                className={`${styles.headerCell} ${sortBy === 'date' ? styles.sorted : ''}`}
                onClick={() => handleSortChange('date')}
              >
                Date Modified {sortBy === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
            </div>
          )}

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
                    width={viewMode === 'icons' ? 32 : 16}
                    height={viewMode === 'icons' ? 32 : 16}
                  />
                </div>
                <div className={styles.fileName}>
                  {item.name}
                  {item.isLink && <span className={styles.shortcutIndicator}>↗</span>}
                </div>

                {viewMode === 'details' && (
                  <>
                    <div className={styles.fileType}>
                      {item.isDirectory ? 'Folder' :
                        item.isLink ? 'Shortcut' :
                          item.name.includes('.') ? item.name.split('.').pop()?.toUpperCase() : 'File'}
                    </div>
                    <div className={styles.fileSize}>
                      {item.isDirectory ? '--' : '1 KB'}
                    </div>
                    <div className={styles.fileDate}>
                      {new Date().toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.statusBar}>
        <div className={styles.statusText}>
          {items.length} items
        </div>
        <div className={styles.diskSpace}>
          Free Space: 640 MB
        </div>
      </div>
    </div>
  );
};

export default FolderWindow;
