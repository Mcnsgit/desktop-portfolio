// src/context/FileOperationsContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import { FileItemData, DesktopItem } from '../types';

interface FileOperationsContextType {
    clipboard: {
        action: 'copy' | 'cut';
        files: (FileItemData | DesktopItem)[];
    } | null;
    selectedFiles: Set<string>;
    selectionMode: 'single' | 'multi';
    isFileSelected: (id: string) => boolean;
    setClipboard: (data: {
        action: 'copy' | 'cut';
        files: (FileItemData | DesktopItem)[];
    } | null) => void;
    clearClipboard: () => void;
    selectFile: (id: string, multiSelect?: boolean) => void;
    unselectFile: (id: string) => void;
    toggleFileSelection: (id: string, multiSelect?: boolean) => void;
    clearSelection: () => void;
    selectAll: (ids: string[]) => void;
    copySelectedFiles: (files: (FileItemData | DesktopItem)[]) => void;
    cutSelectedFiles: (files: (FileItemData | DesktopItem)[]) => void;
    deleteSelectedFiles: (callback?: (ids: string[]) => void) => void;
}

// Create a default context with no-op functions
const defaultContext: FileOperationsContextType = {
    clipboard: null,
    selectedFiles: new Set(),
    selectionMode: 'single',
    isFileSelected: () => false,
    setClipboard: () => { },
    clearClipboard: () => { },
    selectFile: () => { },
    unselectFile: () => { },
    toggleFileSelection: () => { },
    clearSelection: () => { },
    selectAll: () => { },
    copySelectedFiles: () => { },
    cutSelectedFiles: () => { },
    deleteSelectedFiles: () => { },
};

const FileOperationsContext = createContext<FileOperationsContextType>(defaultContext);

export const FileOperationsProvider: React.FC<{
    children: React.ReactNode;
}> = ({
    children
}) => {
        const [clipboard, setClipboardState] = useState<{
            action: 'copy' | 'cut';
            files: (FileItemData | DesktopItem)[];
        } | null>(null);
        const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
        const [selectionMode] = useState<'single' | 'multi'>('single');

        // Check if file is selected
        const isFileSelected = useCallback((id: string) => {
            return selectedFiles.has(id);
        }, [selectedFiles]);

        // Set clipboard data
        const setClipboard = useCallback((data: {
            action: 'copy' | 'cut';
            files: (FileItemData | DesktopItem)[];
        } | null) => {
            setClipboardState(data);
            if (data) {
                console.log(`${data.action === 'copy' ? 'Copied' : 'Cut'} ${data.files.length} file(s) to clipboard`);
            }
        }, []);

        // Clear clipboard
        const clearClipboard = useCallback(() => {
            setClipboardState(null);
        }, []);

        // Select a file
        const selectFile = useCallback((id: string, multiSelect = false) => {
            setSelectedFiles(prev => {
                const newSelection = new Set(multiSelect ? prev : []);
                newSelection.add(id);
                return newSelection;
            });
        }, []);

        // Unselect a file
        const unselectFile = useCallback((id: string) => {
            setSelectedFiles(prev => {
                const newSelection = new Set(prev);
                newSelection.delete(id);
                return newSelection;
            });
        }, []);

        // Toggle file selection
        const toggleFileSelection = useCallback((id: string, multiSelect = false) => {
            setSelectedFiles(prev => {
                const newSelection = new Set(multiSelect ? prev : []);
                if (prev.has(id)) {
                    newSelection.delete(id);
                } else {
                    newSelection.add(id);
                }
                return newSelection;
            });
        }, []);

        // Clear all selections
        const clearSelection = useCallback(() => {
            setSelectedFiles(new Set());
        }, []);

        // Select all files in a list
        const selectAll = useCallback((ids: string[]) => {
            setSelectedFiles(new Set(ids));
        }, []);

        // Copy selected files to clipboard
        const copySelectedFiles = useCallback((files: (FileItemData | DesktopItem)[]) => {
            if (files.length === 0) return;

            setClipboard({
                action: 'copy',
                files
            });
        }, [setClipboard]);

        // Cut selected files to clipboard
        const cutSelectedFiles = useCallback((files: (FileItemData | DesktopItem)[]) => {
            if (files.length === 0) return;

            setClipboard({
                action: 'cut',
                files
            });
        }, [setClipboard]);

        // Delete selected files
        const deleteSelectedFiles = useCallback((callback?: (ids: string[]) => void) => {
            const selectedIds = Array.from(selectedFiles);
            if (selectedIds.length === 0) return;

            if (callback) {
                callback(selectedIds);
            }

            clearSelection();
        }, [clearSelection, selectedFiles]);

        // Exposed context value
        const contextValue: FileOperationsContextType = {
            clipboard,
            selectedFiles,
            selectionMode,
            isFileSelected,
            setClipboard,
            clearClipboard,
            selectFile,
            unselectFile,
            toggleFileSelection,
            clearSelection,
            selectAll,
            copySelectedFiles,
            cutSelectedFiles,
            deleteSelectedFiles,
        };

        return (
            <FileOperationsContext.Provider value={contextValue}>
                {children}
            </FileOperationsContext.Provider>
        );
    };

export const useFileOperations = () => {
    // Return the context directly, without throwing an error if used outside provider
    return useContext(FileOperationsContext);
};