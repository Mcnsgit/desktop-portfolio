// src/components/fileSystem/FolderWindow.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDesktop } from '@/context/DesktopContext';
import { useFileSystem } from '@/context/FileSystemContext';
import { useSounds } from '@/hooks/useSounds';
import Image from 'next/image';
import styles from './FolderWindow.module.scss';
import {
  Grid,
  List,
  Search,
  // Folder as FolderIconLucide,
  // FileText as FileIconLucide,
} from 'lucide-react';
import { useDroppable, useDraggable } from '@dnd-kit/core'; // Import dnd-kit hooks
import { CSS } from '@dnd-kit/utilities'; // Import CSS utility

// Custom components that would need to be created
import Breadcrumb from './Breadcrumb';
import ContextMenu from '../desktop/ContextMenu';
import { DesktopItem } from '@/types';
import { getDefaultIcon } from '@/utils/iconUtils'; // Import getDefaultIcon


interface FolderWindowProps {
  folderId: string;
  // windowId: string; // May need windowId to uniquely identify droppable area if multiple folder windows are open
}

interface FileItem extends DesktopItem {
  name: string;
  fileType?: string;
  size?: string;
  modified?: string;
  iconLoadError?: boolean; // Added for icon error handling in DraggableFileItem
  // No need for x,y position here as layout is viewMode dependent
}

// Helper to sort items (Restored)
function sortItems(items: FileItem[], sortKey: string, direction: 'asc' | 'desc') {
  return [...items].sort((a, b) => {
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
        comparison = (a.size || '').localeCompare(b.size || '');
        break;
      case 'date':
        comparison = (a.modified || '').localeCompare(b.modified || '');
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    return direction === 'asc' ? comparison : -comparison;
  });
}

const FolderWindow: React.FC<FolderWindowProps> = ({ folderId }) => {
  const { state, dispatch } = useDesktop();
  const fileSystem = useFileSystem();
  const { playSound } = useSounds();
  const [viewMode, setViewMode] = useState<'icons' | 'list' | 'details'>('icons');
  const [sortBy] = useState<'name' | 'type' | 'size' | 'date'>('name');
  const [sortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const lastSelectedFileRef = useRef<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    targetId?: string;
    targetType?: string;
  }>({ visible: false, position: { x: 0, y: 0 } });

  const currentFolderDesktopItem = useMemo(() => {
    return state.desktopItems.find((item: DesktopItem) => item.id === folderId);
  }, [folderId, state.desktopItems]);

  const currentFSPath = useMemo(() => {
    if (currentFolderDesktopItem?.path) {
      return currentFolderDesktopItem.path;
    }
    console.warn(`FolderWindow: DesktopItem for folderId ${folderId} does not have a path property.`);
    return null; 
  }, [currentFolderDesktopItem, folderId]);

  const { setNodeRef: setDroppableNodeRef, isOver: isOverContentArea } = useDroppable({
    id: `folder-window-drop-area-${folderId}`,
    data: {
      type: 'folderWindow',
      folderId: folderId,
      path: currentFSPath,
    }
  });

  useEffect(() => {
    if (!currentFSPath || !fileSystem.isReady) {
      return;
    }

    let isMounted = true;

    const syncFileSystemToContext = async () => {
      try {
        console.log(`FolderWindow: Syncing FS for path ${currentFSPath}`);
        const actualFSItems = await fileSystem.listDirectory(currentFSPath);
        if (!isMounted) return;

        const contextChildItems = state.desktopItems.filter(
          (item: DesktopItem) => item.parentId === folderId
        );

        for (const fsItem of actualFSItems) {
          const correspondingContextItem = contextChildItems.find(
            (ctxItem: DesktopItem) => ctxItem.title === fsItem.name
          );
          const itemFSPath = `${currentFSPath === '/' ? '' : currentFSPath}/${fsItem.name}`.replace('//', '/');

          if (!correspondingContextItem) {
            const newItemId = `fs-${folderId}-${fsItem.name}-${Date.now()}`;
            const newItemType = fsItem.isDirectory ? 'folder' : 'file';
            console.log(`FolderWindow: FS item ${fsItem.name} not in context. Creating with id ${newItemId}, path ${itemFSPath}`);
            dispatch({
              type: 'CREATE_ITEM',
              payload: {
                id: newItemId,
                title: fsItem.name,
                type: newItemType,
                icon: getDefaultIcon(newItemType, fsItem.name),
                parentId: folderId,
                path: itemFSPath,
              },
            });
            if (fsItem.isDirectory) {
                dispatch({
                    type: "CREATE_FOLDER",
                    payload: {
                        id: newItemId,
                        title: fsItem.name,
                        parentId: folderId,
                        path: itemFSPath,
                    }
                 });
            }
          } else {
            if (correspondingContextItem.path !== itemFSPath) {
                 console.log(`FolderWindow: Updating path for existing context item ${correspondingContextItem.id}`);
                 dispatch({
                    type: "MOVE_ITEM",
                    payload: {
                        itemId: correspondingContextItem.id,
                        newParentId: correspondingContextItem.parentId,
                        newPath: itemFSPath,
                    }
                 });
            }
          }
        }

        for (const ctxItem of contextChildItems) {
          const correspondingFSItem = actualFSItems.find(
            fsItem => fsItem.name === ctxItem.title
          );
          if (!correspondingFSItem && ctxItem.path?.startsWith(currentFSPath)) {
            console.log(`FolderWindow: Context item ${ctxItem.title} (id: ${ctxItem.id}) not in FS. Deleting.`);
            dispatch({ type: 'DELETE_ITEM', payload: { id: ctxItem.id } });
          }
        }
      } catch (error) {
        console.error(`FolderWindow: Error syncing file system for path ${currentFSPath}:`, error);
      }
    };

    syncFileSystemToContext();
    
    return () => {
      isMounted = false;
    };
  }, [currentFSPath, fileSystem, folderId, state.desktopItems, dispatch]);

  const [itemIconErrors, setItemIconErrors] = useState<Record<string, boolean>>({});

  const folderItems = useMemo(() => {
    const itemsFromContext: FileItem[] = state.desktopItems
      .filter((item: DesktopItem) => item.parentId === folderId)
      .map((item: DesktopItem): FileItem => ({
        ...item,
        name: item.title,
        fileType: item.type !== 'folder' ? getFileType(item.title) : 'Folder',
        size: '...',
        modified: '...',
        iconLoadError: itemIconErrors[item.id] || false,
      }));

    return sortItems(itemsFromContext, sortBy, sortDirection);
  }, [folderId, sortBy, sortDirection, state.desktopItems, itemIconErrors]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return folderItems;
    return folderItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folderItems, searchQuery]);

  function getFileType(name: string): string {
    if (name.includes('.')) {
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext) return `${ext.toUpperCase()} File`;
    }
    return 'File';
  }

  const handleItemClick = useCallback((e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    playSound("click");

    const currentVisibleItems = filteredItems;

    if (e.shiftKey) {
      if (lastSelectedFileRef.current && lastSelectedFileRef.current !== itemId) {
        const lastClickedIndex = currentVisibleItems.findIndex(item => item.id === lastSelectedFileRef.current);
        const currentClickedIndex = currentVisibleItems.findIndex(item => item.id === itemId);

        if (lastClickedIndex !== -1 && currentClickedIndex !== -1) {
          const start = Math.min(lastClickedIndex, currentClickedIndex);
          const end = Math.max(lastClickedIndex, currentClickedIndex);
          const itemsToSelect = currentVisibleItems.slice(start, end + 1).map(item => item.id);

          setSelectedFiles(prevSelected => {
            const newSelection = e.ctrlKey ? new Set<string>(prevSelected) : new Set<string>();
            itemsToSelect.forEach(id => newSelection.add(id));
            if (!e.ctrlKey) newSelection.add(lastSelectedFileRef.current!); 
            newSelection.add(itemId);
            return newSelection;
          });
        }
      } else {
        setSelectedFiles(new Set<string>([itemId]));
        lastSelectedFileRef.current = itemId;
      }
    } else if (e.ctrlKey) {
      setSelectedFiles(prevSelected => {
        const newSelection = new Set<string>(prevSelected);
        if (newSelection.has(itemId)) {
          newSelection.delete(itemId);
          if (lastSelectedFileRef.current === itemId) lastSelectedFileRef.current = null;
        } else {
          newSelection.add(itemId);
          lastSelectedFileRef.current = itemId;
        }
        return newSelection;
      });
    } else {
      setSelectedFiles(new Set<string>([itemId]));
      lastSelectedFileRef.current = itemId;
    }
  }, [filteredItems, playSound]);

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
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
      dispatch({
        type: "OPEN_WINDOW",
        payload: {
          id: `texteditor-${item.id}-${Date.now()}`,
          title: `Text Editor - ${item.name}`,
          type: "texteditor",
          content: { type: "texteditor", filePath: item.path || `${currentFSPath}/${item.name}`.replace('//','/') },
          minimized: false,
          position: { x: 120, y: 120 },
          size: { width: 600, height: 400 },
          zIndex: 1,
        },
      });
    }
    playSound("windowOpen");
  };

  const handleViewModeChange = (mode: 'icons' | 'list' | 'details') => {
    setViewMode(mode);
    playSound("click");
  };

  // const handleSortChange = (sortKey: 'name' | 'type' | 'size' | 'date') => {
  //   if (sortBy === sortKey) {
  //     setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortBy(sortKey);
  //     setSortDirection('asc');
  //   }
  //   playSound("click");
  // };

  const handleFolderWindowRightClick = useCallback((e: React.MouseEvent, itemId?: string, itemType?: string) => {
    e.preventDefault();
    e.stopPropagation();
    playSound("click");

    const target = e.target as HTMLElement;
    const fileItemElement = itemId ? target.closest(`[data-item-id="${itemId}"]`) : target.closest('[data-item-id]');

    let finalTargetId = itemId;
    let finalTargetType = itemType;

    if (fileItemElement && !finalTargetId) {
      finalTargetId = fileItemElement.getAttribute('data-item-id') || undefined;
      finalTargetType = fileItemElement.getAttribute('data-item-type') || 'file';
    }
    
    if (finalTargetId && !selectedFiles.has(finalTargetId) && !e.ctrlKey && !e.shiftKey) {
        setSelectedFiles(new Set([finalTargetId]));
        lastSelectedFileRef.current = finalTargetId;
    }
    
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      targetId: finalTargetId,
      targetType: finalTargetId ? finalTargetType : 'folderBackground',
    });
  }, [playSound, selectedFiles]);

  // const handleContextMenuClose = useCallback(() => {
  //   setContextMenu((prev) => ({ ...prev, visible: false }));
  // }, []);

  // const handleEmptyAreaClick = useCallback(() => {
  //   if (contextMenu.visible) {
  //     handleContextMenuClose();
  //     return;
  //   }
  //   setSelectedFiles(new Set());
  //   lastSelectedFileRef.current = null;
  // }, [contextMenu.visible, handleContextMenuClose]);

  const getFileIcon = (item: FileItem): string => {
    // This function can still exist if it does more specific logic before or after getDefaultIcon
    // or if it handles item.icon directly. If it purely calls getDefaultIcon, it might be redundant.
    // For now, assuming it might have its own logic or just a pass-through.
    return item.icon || getDefaultIcon(item.type, item.name);
  };

  const handleIconError = (itemId: string) => {
    setItemIconErrors(prev => ({ ...prev, [itemId]: true }));
  };

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

    const extension = getFileType(item.name).split(' ')[0];
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

  const handleContentAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedFiles(new Set());
      lastSelectedFileRef.current = null;
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    }
  };
  
  // useEffect(() => {
    // if (!fileSystem.isReady || folderItems.length === 0) return;

    // const fetchItemsDetails = async () => {
    //   for (const item of folderItems) {
    //     if (item.path && (item.size === '...' || item.modified === '...')) {
    //       try {
    //         const info = await fileSystem.getFileInfo(item.path);
    //         if (info) {
    //           console.log(`FS Info for ${item.path}: Size ${info.size}, Modified ${info.modified.toLocaleDateString()}`);
    //         }
    //       } catch (error) {
    //         console.warn(`Error fetching details for ${item.path}:`, error);
    //       }
    //     }
    //   }
    // };
  // }, [fileSystem, folderItems]);

  if (!currentFolderDesktopItem) {
    return <div className={styles.folderWindow}>Error: Folder not found (ID: {folderId})</div>;
  }
  
  const breadcrumbPathString = currentFSPath || (currentFolderDesktopItem?.title || "Unknown Folder");

  interface DraggableFileItemProps {
    item: FileItem;
    isSelected: boolean;
    viewMode: 'icons' | 'list' | 'details';
    onItemClick: (e: React.MouseEvent, itemId: string) => void;
    onItemDoubleClick: (item: FileItem) => void;
    onIconError: (itemId: string) => void;
    getColoredIcon: (item: FileItem) => React.JSX.Element;
    getFileIcon: (item: FileItem) => string;
    onContextMenu: (e: React.MouseEvent, itemId: string, itemType: string) => void;
  }

  const DraggableFileItem: React.FC<DraggableFileItemProps> = ({
    item,
    isSelected,
    viewMode,
    onItemClick,
    onItemDoubleClick,
    onIconError,
    getColoredIcon,
    getFileIcon,
    onContextMenu,
  }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: item.id,
      data: {
        id: item.id,
        title: item.title,
        type: item.type,
        parentId: item.parentId, 
        path: item.path,
        isCut: item.isCut,
        sourceType: 'folderWindowItem',
        sourceWindowId: folderId,
        originalPosition: null,
      },
    });

    const style: React.CSSProperties = {
      opacity: isDragging ? 0.7 : item.isCut ? 0.6 : 1,
      zIndex: isDragging ? 1000 : 'auto',
    };
     if (transform) {
      style.transform = CSS.Translate.toString(transform);
    }
    
    const handleClick = (e: React.MouseEvent) => {
      if (isDragging) {
        e.stopPropagation();
        return;
      }
      onItemClick(e, item.id);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
      if (isDragging) {
        e.stopPropagation();
        return;
      }
      onItemDoubleClick(item);
    };

    const finalIconSrc = getFileIcon(item);

    if (viewMode === 'icons') {
      return (
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={style}
          className={`${styles.fileItemIcons} ${isSelected ? styles.selected : ''} ${item.isCut ? styles.cut : ''} ${isDragging ? styles.dragging : ''}`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => onContextMenu(e, item.id, item.type)}
          data-item-id={item.id}
          data-item-type={item.type}
          title={item.name}
        >
          <div className={styles.iconContainer}>
            {item.iconLoadError ? getColoredIcon(item) : (
              <Image src={finalIconSrc} alt={item.name} width={32} height={32} onError={() => onIconError(item.id)} unoptimized />
            )}
          </div>
          <span className={styles.itemName}>{item.name}</span>
        </div>
      );
    } else if (viewMode === 'list' || viewMode === 'details') {
      return (
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={style}
          className={`${styles.fileItemList} ${isSelected ? styles.selected : ''} ${item.isCut ? styles.cut : ''} ${isDragging ? styles.dragging : ''}`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => onContextMenu(e, item.id, item.type)}
          data-item-id={item.id}
          data-item-type={item.type}
        >
          <div className={styles.itemIconSmall}>
             {item.iconLoadError ? getColoredIcon(item) : (
                <Image src={finalIconSrc} alt={item.name} width={16} height={16} onError={() => onIconError(item.id)} unoptimized />
             )}
          </div>
          <span className={styles.itemNameList}>{item.name}</span>
          {viewMode === 'details' && (
            <>
              <span className={styles.itemType}>{item.fileType || 'N/A'}</span>
              <span className={styles.itemSize}>{item.size || 'N/A'}</span>
              <span className={styles.itemDate}>{item.modified || 'N/A'}</span>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.folderWindow} onClick={() => contextMenu.visible && setContextMenu({ ...contextMenu, visible: false })}>
      <div className={styles.toolbar}>
        <div className={styles.navigationControls}>
        </div>
        <div className={styles.viewControls}>
          <button onClick={() => handleViewModeChange('icons')} className={viewMode === 'icons' ? styles.active : ''}><Grid size={18}/></button>
          <button onClick={() => handleViewModeChange('list')} className={viewMode === 'list' ? styles.active : ''}><List size={18}/></button>
        </div>
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <Breadcrumb path={breadcrumbPathString} onNavigate={(pathSegment) => { 
        console.log(pathSegment);
      }} />
      
      <div 
        ref={setDroppableNodeRef}
        className={`${styles.contentArea} ${viewMode === 'icons' ? styles.iconsView : styles.listView} ${isOverContentArea ? styles.dropTargetActive : ''}`}
        onClick={handleContentAreaClick}
        onContextMenu={(e) => handleFolderWindowRightClick(e)}
        style={{ position: 'relative' }} 
      >
        {filteredItems.length === 0 && <div className={styles.emptyFolder}>This folder is empty.</div>}
        {filteredItems.map(item => (
            <DraggableFileItem
                key={item.id}
                item={item}
                isSelected={selectedFiles.has(item.id)}
                viewMode={viewMode}
                onItemClick={handleItemClick}
                onItemDoubleClick={handleItemDoubleClick}
                onIconError={handleIconError}
                getColoredIcon={getColoredIcon}
                getFileIcon={getFileIcon}
                onContextMenu={handleFolderWindowRightClick}
            />
        ))}
      </div>

      <div className={styles.statusBar}>
        <span>{filteredItems.length} item(s)</span>
        <span>{selectedFiles.size > 0 ? `${selectedFiles.size} item(s) selected` : ''}</span>
      </div>

      {contextMenu.visible && (
        <ContextMenu
          position={contextMenu.position}
          targetId={contextMenu.targetId}
          targetType={contextMenu.targetType}
          selectedItemIds={selectedFiles}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        />
      )}
    </div>
  );
};

export default FolderWindow;