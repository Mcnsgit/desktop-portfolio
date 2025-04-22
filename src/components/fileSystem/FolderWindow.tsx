// src/components/fileSystem/FolderWindow.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDesktop } from '@/context/DesktopContext';
import { useFileOperations } from '@/context/FileOperationsContext';
import { useSounds } from '@/hooks/useSounds';
import Image from 'next/image';
import styles from '../styles/FolderWindow.module.scss';
import {
  GridIcon,
  ListIcon,
  SearchIcon,
  PlusIcon,
  FolderPlusIcon,
  FilePlusIcon,
  UploadIcon,
  ArrowUpIcon,
  ClipboardIcon,
  ScissorsIcon,
  Trash2Icon,
  RefreshCwIcon,
  SortAscIcon
} from 'lucide-react';

// Custom components that would need to be created
import Breadcrumb from './Breadcrumb';
import ContextMenu from '../desktop/ContextMenu';


interface FolderWindowProps {
  folderId: string;
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon?: string;
  fileType?: string;
  size?: string;
  modified?: string;
  parentId: string | null;
}

const FolderWindow: React.FC<FolderWindowProps> = ({ folderId }) => {
  const { state, dispatch } = useDesktop();
  const [viewMode, setViewMode] = useState<'icons' | 'list' | 'details'>('icons');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Get current folder data
  const currentFolder = useMemo(() => {
    return state.folders.find(f => f.id === folderId);
  }, [folderId, state.folders]);

  // Get folder items
  const folderItems = useMemo(() => {
    // Get items that have this folder as parent
    const items: FileItem[] = state.desktopItems
      .filter(item => item.parentId === folderId)
      .map(item => ({
        id: item.id,
        name: item.title,
        type: item.type === 'folder' ? 'folder' : 'file',
        icon: item.icon,
        fileType: getFileType(item.title),
        size: '0 KB', // Placeholder
        modified: new Date().toLocaleDateString(),
        parentId: item.parentId
      }));

    // Sort items
    return sortItems(items, sortBy, sortDirection);
  }, [folderId, sortBy, sortDirection, state.desktopItems]);

  // Filter by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return folderItems;
    return folderItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folderItems, searchQuery]);

  // Helper to get file type from name
  const getFileType = (name: string): string => {
    if (!name.includes('.')) return '';
    return name.split('.').pop()?.toLowerCase() || '';
  };

  // Helper to sort items
  const sortItems = (items: FileItem[], sortKey: string, direction: 'asc' | 'desc') => {
    return [...items].sort((a, b) => {
      // Always put folders first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      let comparison = 0;

      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          if (a.type === 'folder' && b.type === 'folder') {
            comparison = a.name.localeCompare(b.name);
          } else {
            const typeA = a.fileType || '';
            const typeB = b.fileType || '';
            comparison = typeA.localeCompare(typeB);
          }
          break;
        case 'size':
          // Placeholder
          comparison = (a.size || '').localeCompare(b.size || '');
          break;
        case 'date':
          // Placeholder
          comparison = (a.modified || '').localeCompare(b.modified || '');
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Toggle file selection
  const toggleFileSelection = (fileId: string, multiSelect = false) => {
    setSelectedFiles(prev => {
      const newSelection = new Set(multiSelect ? prev : []);
      if (prev.has(fileId)) {
        newSelection.delete(fileId);
      } else {
        newSelection.add(fileId);
      }
      return newSelection;
    });
  };

  // Handle item click for selection
  const handleItemClick = (e: React.MouseEvent, item: FileItem) => {
    e.stopPropagation();

    // Handle multi-selection with Ctrl/Shift
    const multiSelect = e.ctrlKey || e.shiftKey;
    toggleFileSelection(item.id, multiSelect);
  };

  // Handle double-click to open item
  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      // Open folder in a new window
      dispatch({
        type: "OPEN_WINDOW",
        payload: {
          id: `folder-${item.id}`,
          title: item.name,
          type: "folder",
          content: { type: "folder", folderId: item.id },
          minimized: false,
          position: { x: 120, y: 120 },
          size: { width: 550, height: 400 },
          zIndex: 1,
        },
      });
    } else {
      // Open file based on type
      dispatch({
        type: "OPEN_WINDOW",
        payload: {
          id: `texteditor-${Date.now()}`,
          title: `Text Editor - ${item.name}`,
          type: "texteditor",
          content: { type: "texteditor", filePath: item.id },
          minimized: false,
          position: { x: 120, y: 120 },
          size: { width: 600, height: 400 },
          zIndex: 1,
        },
      });
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'icons' | 'list' | 'details') => {
    setViewMode(mode);
  };

  // Handle sort change
  const handleSortChange = (sortKey: 'name' | 'type' | 'size' | 'date') => {
    if (sortBy === sortKey) {
      // Toggle direction if already sorting by this key
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortKey);
      setSortDirection('asc');
    }
  };

  // Handle empty area click to clear selection
  const handleEmptyAreaClick = () => {
    setSelectedFiles(new Set());
  };

  // Get appropriate icon for file type
  const getFileIcon = (item: FileItem): string => {
    if (item.type === 'folder') {
      return '/assets/win98-icons/png/directory_open-0.png';
    }

    const extension = getFileType(item.name);

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

  // Fallback for missing icons
  const [iconErrors, setIconErrors] = useState<Record<string, boolean>>({});

  const handleIconError = (itemId: string) => {
    setIconErrors(prev => ({ ...prev, [itemId]: true }));
  };

  // Create colored icon based on file type
  const getColoredIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return (
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "#FFC83D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            color: "#855B00",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          F
        </div>
      );
    }

    const extension = getFileType(item.name);
    let color = "#4a86cf";
    let letter = "F";

    switch (extension) {
      case 'txt':
      case 'md':
        color = "#66bb6a";
        letter = "T";
        break;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        color = "#ffd54f";
        letter = "J";
        break;
      case 'html':
        color = "#ff7043";
        letter = "H";
        break;
      case 'css':
        color = "#42a5f5";
        letter = "C";
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        color = "#ec407a";
        letter = "I";
        break;
    }

    return (
      <div
        style={{
          width: "32px",
          height: "32px",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        {letter}
      </div>
    );
  };

  return (
    <div className={styles.folderWindow || "folderWindow"} onClick={handleEmptyAreaClick}>
      {/* Toolbar */}
      <div className={styles.toolbar || "toolbar"}>
        <div className={styles.viewControls || "viewControls"}>
          <button
            onClick={() => handleViewModeChange('icons')}
            className={`${styles.viewButton || "viewButton"} ${viewMode === 'icons' ? styles.active || "active" : ''}`}
          >
            Icons
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`${styles.viewButton || "viewButton"} ${viewMode === 'list' ? styles.active || "active" : ''}`}
          >
            List
          </button>
          <button
            onClick={() => handleViewModeChange('details')}
            className={`${styles.viewButton || "viewButton"} ${viewMode === 'details' ? styles.active || "active" : ''}`}
          >
            Details
          </button>
        </div>

        <div className={styles.searchContainer || "searchContainer"}>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput || "searchInput"}
          />
        </div>
      </div>

      {/* Content area */}
      <div className={`${styles.folderContents || "folderContents"} ${styles[viewMode] || viewMode}`}>
        {filteredItems.length === 0 ? (
          <div className={styles.emptyMessage || "emptyMessage"}>
            {searchQuery ? 'No items match your search.' : 'This folder is empty.'}
          </div>
        ) : (
          <div className={styles.itemsContainer || "itemsContainer"}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.fileItem || "fileItem"} ${selectedFiles.has(item.id) ? styles.selected || "selected" : ''}`}
                onClick={(e) => handleItemClick(e, item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
              >
                <div className={styles.fileIcon || "fileIcon"}>
                  {iconErrors[item.id] ? (
                    getColoredIcon(item)
                  ) : (
                    <Image
                      src={getFileIcon(item)}
                      alt={item.name}
                      width={viewMode === 'icons' ? 32 : 16}
                      height={viewMode === 'icons' ? 32 : 16}
                      onError={() => handleIconError(item.id)}
                      unoptimized
                    />
                  )}
                </div>

                <div className={styles.fileName || "fileName"}>
                  {item.name}
                </div>

                {viewMode === 'details' && (
                  <>
                    <div className={styles.fileType || "fileType"}>
                      {item.type === 'folder'
                        ? 'Folder'
                        : item.fileType?.toUpperCase() || 'File'}
                    </div>

                    <div className={styles.fileSize || "fileSize"}>
                      {item.size}
                    </div>

                    <div className={styles.fileDate || "fileDate"}>
                      {item.modified}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar || "statusBar"}>
        <div className={styles.statusInfo || "statusInfo"}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          {selectedFiles.size > 0 && ` (${selectedFiles.size} selected)`}
        </div>
      </div>
    </div>
  );
};

export default FolderWindow;