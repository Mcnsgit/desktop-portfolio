// src/components/fileSystem/FileExplorerWindow.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Folder, FileText, Link as LinkIcon, ArrowUp, RefreshCw } from 'lucide-react';
import styles from './FileExplorerWindow.module.scss';
import { useFileSystem } from '../../context/FileSystemContext';

interface FileExplorerWindowProps {
  initialPath?: string;
  onFileSelect?: (path: string, type: 'file' | 'directory' | 'link') => void;
  id?: string;
}

interface FileItem {
  name: string;
  isDirectory: boolean;
  isLink: boolean;
  linkTarget?: string;
  path: string;
}

const FileExplorerWindow: React.FC<FileExplorerWindowProps> = ({
  initialPath = "/home/guest/Desktop",
  onFileSelect,
  id
}) => {
  const fileSystem = useFileSystem();
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const loadDirectory = useCallback(async (path: string) => {
    if (!fileSystem.isReady) {
      setError("File system not ready.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const directoryContents = await fileSystem.listDirectory(path);
      const fileItems: FileItem[] = directoryContents.map(item => ({
        ...item,
        path: path === '/' ? `/${item.name}` : `${path}/${item.name}`,
      }));
      setFiles(fileItems);
    } catch (err) {
      console.error('Error loading directory:', err);
      setError('Failed to load directory contents. Please try refreshing.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [fileSystem]);

  useEffect(() => {
    loadDirectory(currentPath);
    if (history[historyIndex] !== currentPath) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentPath);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }
  }, [currentPath, loadDirectory, history, historyIndex]);

  const navigateToPath = (newPath: string) => {
    setCurrentPath(newPath);
    setSelectedFile(null);
  };

  const handleItemClick = (item: FileItem) => {
    setSelectedFile(item.path);
    if (onFileSelect) {
      onFileSelect(item.path, item.isDirectory ? 'directory' : item.isLink ? 'link' : 'file');
    }
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.isDirectory) {
      navigateToPath(item.path);
    } else if (item.isLink && item.linkTarget) {
      if (onFileSelect) onFileSelect(item.path, 'link');
    } else {
      if (onFileSelect) onFileSelect(item.path, 'file');
    }
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    navigateToPath(parentPath);
  };

 const handleRefresh = () => {
    loadDirectory(currentPath);
 };

 const handlePathInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  e.preventDefault();
  if (e.target.value !== currentPath) {
    navigateToPath(e.target.value);
  }
 };

 const handlePathInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        navigateToPath(e.currentTarget.value);
    }
 };

  if (!fileSystem.isReady && loading) {
    return <div className={styles.loading}>Initializing File System...</div>;
  }

  return (
    <div className={styles.fileExplorer} id={id}>
      <div className={styles.toolbar}>
        <button onClick={handleGoUp} disabled={currentPath === '/'} className={styles.toolbarButton} title="Up one level">
          <ArrowUp size={18} />
        </button>
        <input
          type="text"
          value={currentPath}
          onChange={handlePathInputChange}
          onKeyDown={handlePathInputKeyDown}
          className={styles.addressBar}
          placeholder="Enter path..."
        />
        <button onClick={handleRefresh} className={styles.toolbarButton} title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className={styles.fileListContainer}>
        {loading && !error && <div className={styles.loadingOverlay}>Loading...</div>}
        {error && <div className={styles.errorOverlay}>{error}</div>}
        {!loading && !error && files.length === 0 && <div className={styles.empty}>This folder is empty.</div>}
        {!error && files.length > 0 && (
          <ul className={styles.fileList}>
            {files.map((item) => (
              <li
                key={item.path}
                className={`${styles.fileItem} ${selectedFile === item.path ? styles.selected : ''}`}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                title={`${item.name}${item.isLink && item.linkTarget ? ` -> ${item.linkTarget}` : ''}`}
              >
                <div className={styles.fileIcon}>
                  {item.isDirectory ? <Folder size={20} /> : item.isLink ? <LinkIcon size={20} /> : <FileText size={20} />}
                </div>
                <span className={styles.fileName}>{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.statusBar}>
        <span>{files.length} item(s)</span>
        {selectedFile && <span>Selected: {selectedFile.split('/').pop()}</span>}
      </div>
    </div>
  );
};

export default FileExplorerWindow;