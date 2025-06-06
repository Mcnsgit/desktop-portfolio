// src/components/fileSystem/FileExplorerWindow.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Folder as FolderIconLucide, FileText as FileIconLucide, ArrowUp, RefreshCw, Grid, List, Search } from 'lucide-react';
import styles from './FileExplorerWindow.module.scss';
import Image from 'next/image';
import { useSounds } from '@/hooks/useSounds';

// --- Dnd-kit imports ---
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- Model Types ---
import { Desktop as DesktopModel } from '../../model/Desktop';
import { IDesktopItem, IDesktopModel } from '../../model/DesktopItem';
import { Folder as ModelFolder } from '../../model/Folder';

// --- Custom Components (assuming Breadcrumb can be used/adapted) ---
import Breadcrumb from './Breadcrumb';

export interface FileExplorerWindowProps {
  desktopModel: DesktopModel;
  windowId: string;
  initialPath?: string; 
  folderId?: string; // If opened for a specific known folder
}

// Represents items displayed in the file explorer, based on IDesktopItem
interface ExplorerItemUI extends IDesktopItem {
  fileTypeDisplay?: string;
  size?: number;
  dateModified?: Date;
}

// Sort helper (similar to FolderWindow)
function sortItems(items: ExplorerItemUI[], sortKey: string, direction: 'asc' | 'desc'): ExplorerItemUI[] {
  return [...items].sort((a, b) => {
    if (a.type === 'Folder' && b.type !== 'Folder') return -1;
    if (a.type !== 'Folder' && b.type === 'Folder') return 1;
    let comparison = 0;
    switch (sortKey) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        const typeA = a.fileTypeDisplay || a.type;
        const typeB = b.fileTypeDisplay || b.type;
        comparison = typeA.localeCompare(typeB);
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    return direction === 'asc' ? comparison : -comparison;
  });
}

const FileExplorerWindow: React.FC<FileExplorerWindowProps> = ({
  desktopModel,
  windowId,
  initialPath = "/home/guest/Desktop", // Default if no folderId or specific initialPath given
  folderId,
}) => {
  const { playSound } = useSounds();
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [displayedItems, setDisplayedItems] = useState<ExplorerItemUI[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const lastSelectedItemIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'icons' | 'list' | 'details'>('icons');
  const [sortBy] = useState<'name' | 'type'>('name');
  const [sortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemIconErrors, setItemIconErrors] = useState<Record<string, boolean>>({});

  // Determine the source of truth for path and items
  const currentFolderModel = useMemo(() => {
    if (folderId) {
      const item = desktopModel.findItemById(folderId);
      if (item && item.type === 'Folder') return item as ModelFolder;
      console.warn(`FileExplorer: folderId ${folderId} provided but not found or not a Folder.`);
    }
    return null;
  }, [folderId, desktopModel]);

  useEffect(() => {
    if (currentFolderModel && currentFolderModel.path) {
      setCurrentPath(currentFolderModel.path);
    }
  }, [currentFolderModel]);

  // Load directory contents
  const loadDirectory = useCallback((pathToList: string) => {
    setLoading(true);
    setError(null);
    try {
      let itemsToDisplay: ExplorerItemUI[] = [];
      if (currentFolderModel && currentFolderModel.path === pathToList) {
        itemsToDisplay = currentFolderModel.children.map(item => ({
          ...item,
          fileTypeDisplay: item.type === 'Folder' ? 'Folder' : (item.name.split('.').pop()?.toUpperCase() + ' File' || 'File'),
          size: undefined,
          dateModified: undefined,
        }));
      } else {
        if (!desktopModel.listDirectorySync) {
            setError("File system listing service not available in DesktopModel.");
            setLoading(false);
            return;
        }
        const fsEntries = desktopModel.listDirectorySync(pathToList); 
        itemsToDisplay = fsEntries.map(entry => {
          const knownItem = desktopModel.findItemByPath(entry.path);
          if (knownItem) {
            return {
              ...knownItem,
              fileTypeDisplay: knownItem.type === 'Folder' ? 'Folder' : (knownItem.name.split('.').pop()?.toUpperCase() + ' File' || 'File'),
              size: entry.size,
              dateModified: entry.dateModified,
            };
          }
          return {
            id: `fs-item-${entry.path}`, 
            name: entry.name,
            type: entry.type,
            icon: entry.icon, 
            path: entry.path,
            parentId: null, 
            onDoubleClick: (_desktop: IDesktopModel) => {
                console.log("Double clicked temp FS item:", entry.path);
                if (entry.type === 'Folder') {
                }
            }, 
            renderIcon: () => entry.icon,
            setParent: () => {},
            fileTypeDisplay: entry.type === 'Folder' ? 'Folder' : (entry.name.split('.').pop()?.toUpperCase() + ' File' || 'File'),
            size: entry.size,
            dateModified: entry.dateModified,
          };
        });
      }
      setDisplayedItems(sortItems(itemsToDisplay, sortBy, sortDirection));
    } catch (err) {
      console.error('Error loading directory:', pathToList, err);
      setError(`Failed to load directory: ${pathToList}`);
      setDisplayedItems([]);
    } finally {
      setLoading(false);
    }
  }, [desktopModel, currentFolderModel, sortBy, sortDirection]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  const navigateToPath = (newPath: string) => {
    // Before navigating, check if newPath corresponds to an existing IDesktopItem
    const targetItem = desktopModel.findItemByPath(newPath);
    if (targetItem && targetItem.type === 'Folder') {
        // If it's a known folder, prefer setting folderId to trigger model-driven view
        // This requires a way to tell the WindowManager to re-evaluate props or re-render with new folderId
        // For now, directly setting currentPath which will then be listed by loadDirectory.
        // Potentially, the parent (WindowManagerComponent) should handle this navigation
        // by closing this window and opening a new one for the targetItem.id.
        console.log(`Navigating to known folder: ${targetItem.name}`);
    }
    setCurrentPath(newPath);
    setSelectedItemIds(new Set());
    lastSelectedItemIdRef.current = null;
  };

  const handleItemClick = useCallback((e: React.MouseEvent, itemId: string) => {
    // Selection logic adapted from FolderWindow
    e.stopPropagation();
    playSound("click");
    const currentVisibleItems = displayedItems; // Or filteredItems if search is active
    if (e.shiftKey) {
      if (lastSelectedItemIdRef.current && lastSelectedItemIdRef.current !== itemId) {
        const lastClickedIndex = currentVisibleItems.findIndex(item => item.id === lastSelectedItemIdRef.current);
        const currentClickedIndex = currentVisibleItems.findIndex(item => item.id === itemId);
        if (lastClickedIndex !== -1 && currentClickedIndex !== -1) {
          const start = Math.min(lastClickedIndex, currentClickedIndex);
          const end = Math.max(lastClickedIndex, currentClickedIndex);
          const itemsToSelect = currentVisibleItems.slice(start, end + 1).map(item => item.id);
          setSelectedItemIds(prevSelected => {
            const newSelection = e.ctrlKey ? new Set<string>(prevSelected) : new Set<string>();
            itemsToSelect.forEach(id => newSelection.add(id));
            if (!e.ctrlKey && lastSelectedItemIdRef.current) newSelection.add(lastSelectedItemIdRef.current);
            newSelection.add(itemId);
            return newSelection;
          });
        }
      } else {
        setSelectedItemIds(new Set<string>([itemId]));
      }
      lastSelectedItemIdRef.current = itemId;
    } else if (e.ctrlKey) {
      setSelectedItemIds(prevSelected => {
        const newSelection = new Set<string>(prevSelected);
        if (newSelection.has(itemId)) {
          newSelection.delete(itemId);
        } else {
          newSelection.add(itemId);
        }
        lastSelectedItemIdRef.current = newSelection.has(itemId) ? itemId : (prevSelected.size > 0 ? Array.from(prevSelected)[0] : null);
        return newSelection;
      });
    } else {
      setSelectedItemIds(new Set<string>([itemId]));
      lastSelectedItemIdRef.current = itemId;
    }
  }, [playSound, displayedItems]);

  const handleItemDoubleClick = useCallback((item: ExplorerItemUI) => {
    // If it's a temporary FS item not in DesktopModel, its onDoubleClick is basic.
    // If it *is* a DesktopModel item (e.g. from currentFolderModel.children or findItemByPath),
    // its original onDoubleClick (which calls desktopModel.createAndOpenWindowFromType) should be used.
    // The item in displayedItems should be the full IDesktopItem if found.
    
    // The `desktopModel.handleDoubleClick` method finds the item by ID and calls its onDoubleClick method.
    // This should work correctly if `item.id` is the actual model ID for known items,
    // or if a temporary item's onDoubleClick is sufficient (e.g. if it tries to navigate).
    if (item.type === 'Folder') {
        // For folders, double click should navigate into them.
        // If it's a known ModelFolder, its onDoubleClick would open a new window.
        // If it's a temporary FS representation, we navigate the current window.
        if (item.id.startsWith('fs-item-')) { // Heuristic for temporary item
            navigateToPath(item.path as string);
        } else {
            desktopModel.handleDoubleClick(item.id); // Let the model decide (opens new window)
        }
    } else {
        desktopModel.handleDoubleClick(item.id); // For files/apps, let model open them
    }
  }, [desktopModel, navigateToPath]);

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    navigateToPath(parentPath);
  };

  const handleRefresh = () => {
    loadDirectory(currentPath);
  };

  const handlePathInputChange = (_e: React.ChangeEvent<HTMLInputElement>) => {
    // Only navigate on Enter, to avoid changing path on every keystroke
    // setCurrentPath(e.target.value); // This would make the input controlled if needed
  };
 
  const handlePathInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          navigateToPath(e.currentTarget.value);
      }
  };

  const handleIconError = (itemId: string) => {
    setItemIconErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getIconForItem = (item: ExplorerItemUI): React.JSX.Element => {
    if (itemIconErrors[item.id]) {
        return <FileIconLucide size={viewMode === 'icons' ? 32 : 20} />; // Generic fallback
    }
    if (item.icon && item.icon.startsWith('/')) { // Assuming item.icon is a path
        return <Image src={item.icon} alt={item.name} width={viewMode === 'icons' ? 32 : 20} height={viewMode === 'icons' ? 32 : 20} onError={() => handleIconError(item.id)} />;
    } 
    // Fallback for non-path icons or missing icons (lucide icons based on type)
    if (item.type === 'Folder') return <FolderIconLucide size={viewMode === 'icons' ? 32 : 20} />;
    if (item.type === 'File') return <FileIconLucide size={viewMode === 'icons' ? 32 : 20} />;
    // if (item.type === 'App') return <AppWindow size... /> // Example for App type
    // Add other types if necessary
    return <FileIconLucide size={viewMode === 'icons' ? 32 : 20} />; // Default
  };

  // --- DnD setup (Simplified from FolderWindow initially) ---
  const { setNodeRef: setDroppableNodeRef, isOver: isOverContentArea } = useDroppable({
    id: `file-explorer-drop-area-${windowId}`,
    data: {
      type: 'folderWindowContent', // Consistent with Desktop.tsx drop handling
      targetFolderId: currentFolderModel?.id || null, // May be null if not a model folder
      targetFolderPath: currentPath,
    }
  });

  interface DraggableExplorerItemProps {
    uiItem: ExplorerItemUI;
    isSelected: boolean;
    viewMode: 'icons' | 'list' | 'details';
  }

  const DraggableExplorerItem: React.FC<DraggableExplorerItemProps> = ({ uiItem, isSelected, viewMode }) => {
    const {attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: uiItem.id,
      data: { type: 'fileSystemItem', itemId: uiItem.id, itemPath: uiItem.path, itemType: uiItem.type }
    });
    const style: React.CSSProperties = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.7 : 1, zIndex: isDragging ? 1000 : 'auto', cursor: isDragging ? 'grabbing' : 'grab' };

    const itemContent = () => {
        switch (viewMode) {
            case 'icons':
                return (
                    <div className={styles.iconItemContent}> {/* Specific style for icon view content */}
                        <div className={styles.fileIconLarge}>{getIconForItem(uiItem)}</div>
                        <span className={styles.fileNameIcons} title={uiItem.name}>{uiItem.name}</span>
                    </div>
                );
            case 'list':
                return (
                    <div className={styles.listItemContent}> {/* Specific style for list view content */}
                        <div className={styles.fileIconSmall}>{getIconForItem(uiItem)}</div>
                        <span className={styles.fileNameList} title={uiItem.name}>{uiItem.name}</span>
                    </div>
                );
            case 'details': // Details view can expand on list view or have its own columns
                return (
                    <div className={styles.detailsItemContent}> {/* Specific style for details view content */}
                        <div className={styles.fileIconSmallDetails}>{getIconForItem(uiItem)}</div>
                        <span className={styles.fileNameDetails} title={uiItem.name}>{uiItem.name}</span>
                        <span className={styles.fileTypeDetails}>{uiItem.fileTypeDisplay || uiItem.type}</span>
                        <span className={styles.fileSizeDetails}>{uiItem.size !== undefined ? `${Math.ceil(uiItem.size / 1024)} KB` : '-'}</span>
                        <span className={styles.fileDateDetails}>{uiItem.dateModified ? uiItem.dateModified.toLocaleDateString() : '-'}</span>
                    </div>
                );
            default: return null;
        }
    };

    const baseClassName = viewMode === 'icons' ? styles.fileIconItem : 
                          viewMode === 'list' ? styles.fileListItem : styles.fileDetailsItem; // Added details item base class

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            className={`${styles.fileItemDraggable} ${baseClassName} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
            onClick={(e) => handleItemClick(e, uiItem.id)}
            onDoubleClick={() => handleItemDoubleClick(uiItem)}
            title={uiItem.path} // Tooltip can show full path or more info
        >
            {itemContent()}
        </div>
    );
  };

  // Main component render
  if (loading && !error && displayedItems.length === 0) { // Show loading only if empty initially
    return <div className={styles.loading}>Loading...</div>;
  }
  // Error display could be more prominent or integrated into the window

  return (
    <div className={styles.fileExplorerWindow} id={windowId} ref={setDroppableNodeRef}>
      <div className={styles.toolbar}>
        <button onClick={handleGoUp} disabled={currentPath === '/'} className={styles.toolbarButton} title="Up"><ArrowUp size={18} /></button>
        <Breadcrumb path={currentPath} onNavigate={navigateToPath} /> 
        <input type="text" defaultValue={currentPath} onKeyDown={handlePathInputKeyDown} onChange={handlePathInputChange} className={styles.addressBar} />
        <button onClick={handleRefresh} className={styles.toolbarButton} title="Refresh"><RefreshCw size={18} /></button>
        {/* View mode controls from FolderWindow */}
        <div className={styles.viewControls}>
          <button onClick={() => setViewMode('icons')} className={`${styles.toolbarButton} ${viewMode === 'icons' ? styles.active : ''}`}><Grid size={18}/></button>
          <button onClick={() => setViewMode('list')} className={`${styles.toolbarButton} ${viewMode === 'list' ? styles.active : ''}`}><List size={18}/></button>
        </div>
        <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input type="search" placeholder={`Search ${currentFolderModel?.name || currentPath.split('/').pop() || 'current folder'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={styles.searchInput} />
        </div>
      </div>

      <div className={`${styles.contentArea} ${styles[viewMode]} ${isOverContentArea ? styles.dropTargetActive : ''}`}>
        {error && <div className={styles.errorOverlay}>{error}</div>}
        {!loading && !error && displayedItems.length === 0 && <div className={styles.empty}>This folder is empty.</div>}
        
        {/* Header for Details View */} 
        {viewMode === 'details' && !error && displayedItems.length > 0 && (
          <div className={styles.detailsHeader}>
            <span className={styles.fileNameDetailsHeader}>Name</span>
            <span className={styles.fileTypeDetailsHeader}>Type</span>
            <span className={styles.fileSizeDetailsHeader}>Size</span>
            <span className={styles.fileDateDetailsHeader}>Date Modified</span>
          </div>
        )}

        {(viewMode === 'icons') && !error && displayedItems.length > 0 && (
            <div className={styles.iconViewContainer}>
                {displayedItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                    <DraggableExplorerItem key={item.id} uiItem={item} isSelected={selectedItemIds.has(item.id)} viewMode={viewMode} />
                ))}
            </div>
        )}
        {(viewMode === 'list' || viewMode === 'details') && !error && displayedItems.length > 0 && (
            <ul className={`${styles.listViewContainer} ${viewMode === 'details' ? styles.detailsViewContainer : ''}`}> {/* Added details specific container class */} 
                {displayedItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                    <DraggableExplorerItem key={item.id} uiItem={item} isSelected={selectedItemIds.has(item.id)} viewMode={viewMode} />
                ))}
            </ul>
        )}
      </div>

      <div className={styles.statusBar}>
        <span>{displayedItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length} item(s)</span>
        {selectedItemIds.size > 0 && <span>{selectedItemIds.size} selected</span>}
      </div>
    </div>
  );
};

export default FileExplorerWindow;