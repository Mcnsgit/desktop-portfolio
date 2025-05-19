// src/components/windows/WindowTypes/TextEditorWindow.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useFileSystem } from "../../../context/FileSystemContext";
import { useDesktop } from "../../../context/DesktopContext";
import { getDefaultIcon } from "../../../utils/iconUtils";
import styles from './TextEditorWindow.module.scss';


interface TextEditorWindowProps {
  initialFilePath?: string;
  windowId: string;
}

type SaveFunctionType = (isSaveAs?: boolean) => Promise<void>;

const TextEditorWindow: React.FC<TextEditorWindowProps> = ({ initialFilePath, windowId }) => {
  const fileSystem = useFileSystem();
  const { state: desktopState, dispatch: desktopDispatch } = useDesktop();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSaveRef = useRef<SaveFunctionType | null>(null); // Ref for handleSave

  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState(initialFilePath);
  const [fileName, setFileName] = useState(
    initialFilePath ? initialFilePath.split("/").pop() || "Untitled" : "Untitled"
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setFileName(currentFilePath ? currentFilePath.split("/").pop() || "Untitled" : "Untitled");
  }, [currentFilePath]);

  useEffect(() => {
    if (windowId) {
      const baseTitle = fileName || "Untitled";
      const newTitle = `${baseTitle}${isDirty ? "*" : ""}`;
      const currentWindow = desktopState.windows.find(w => w.id === windowId);
      if (currentWindow && currentWindow.title !== newTitle) {
        desktopDispatch({
          type: "UPDATE_WINDOW_TITLE",
          payload: { id: windowId, title: newTitle },
        });
      }
    }
  }, [fileName, isDirty, windowId, desktopDispatch, desktopState.windows]);

  useEffect(() => {
    if (!fileSystem.isReady || !currentFilePath) {
      if (!currentFilePath && initialFilePath) {
          setContent("");
          setIsDirty(false);
          setLineCount(0);
          setCharCount(0);
          setStatusMessage("Ready for new file or use Save As.");
      }
      return;
    }
    const loadFile = async () => {
      setStatusMessage("Loading...");
      try {
        const fileContent = await fileSystem.readFile(currentFilePath);
        if (fileContent !== null) {
          setContent(fileContent);
          setLineCount(fileContent.split("\n").length);
          setCharCount(fileContent.length);
          setStatusMessage("File loaded.");
        } else {
          setContent("");
          setStatusMessage(currentFilePath === initialFilePath ? `File not found or empty: ${currentFilePath}` : `Ready to save to new file: ${currentFilePath}`);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        setStatusMessage(`Error: Could not read file ${currentFilePath}`);
      }
      setIsDirty(false);
      setTimeout(() => setStatusMessage(""), 3000);
    };
    loadFile();
  }, [fileSystem, fileSystem.isReady, currentFilePath, initialFilePath, setContent, setIsDirty, setLineCount, setCharCount, setStatusMessage]); // Added fileSystem.readFile to deps for completeness, though fileSystem covers it.

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsDirty(true);
    setLineCount(newContent.split("\n").length);
    setCharCount(newContent.length);
  };

  // Define handleSaveAs first
  const handleSaveAs = useCallback(async () => {
    const newPathSuggestion = currentFilePath || (initialFilePath ? initialFilePath.substring(0, initialFilePath.lastIndexOf('/') + 1) + "untitled.txt" : "/untitled.txt");
    const newPath = window.prompt("Enter new file path:", newPathSuggestion);

    if (newPath && newPath.trim() !== "" && newPath.trim() !== currentFilePath) {
      const oldFilePath = currentFilePath;
      const oldDesktopItem = oldFilePath ? desktopState.desktopItems.find(item => item.path === oldFilePath) : null;

      setCurrentFilePath(newPath.trim()); 
      
      if (handleSaveRef.current) {
        await handleSaveRef.current(true); // Call handleSave via ref, with isSaveAs = true
      }

      if (oldFilePath && oldFilePath !== newPath.trim() && oldDesktopItem) {
        console.log(`Save As: Old file ${oldFilePath} (ID: ${oldDesktopItem.id}) is now represented by ${newPath.trim()}. Deleting old DesktopItem.`);
        desktopDispatch({ type: "DELETE_ITEM", payload: { id: oldDesktopItem.id } });
      }
    } else if (newPath && newPath.trim() === currentFilePath) {
        setStatusMessage("Save As path is the same as current. Use Save instead.");
    } else {
      setStatusMessage("Save As cancelled or invalid path.");
    }
     setTimeout(() => setStatusMessage(""), 3000);
  }, [currentFilePath, initialFilePath, desktopState.desktopItems, desktopDispatch, setCurrentFilePath, setStatusMessage]); // Removed handleSave, using ref instead.


  const handleSave = useCallback(async (isSaveAs: boolean = false) => {
    if (!currentFilePath) {
      if (!isSaveAs) { // Avoid recursive call if handleSaveAs already called this through the ref
        handleSaveAs(); 
      } else {
         setStatusMessage("Error: No file path specified even after Save As prompt.");
      }
      return;
    }
    if (!fileSystem.isReady) {
      setStatusMessage("Error: File system not ready.");
      return;
    }

    setStatusMessage("Saving...");
    // const fileExistedInFS = await fileSystem.exists(currentFilePath); // Not directly used for branching logic here

    try {
      const success = await fileSystem.createFile(currentFilePath, content);

      if (success) {
        setIsDirty(false);
        setStatusMessage("File saved successfully");

        const existingDesktopItem = desktopState.desktopItems.find(item => item.path === currentFilePath);

        if (!existingDesktopItem) {
          // newFileCreatedInDesktopContext = true; // Variable was unused
          const pathSegments = currentFilePath.split('/').filter(segment => segment.length > 0);
          const name = pathSegments.pop() || "UnknownFile";
          const parentPath = pathSegments.length > 0 ? '/' + pathSegments.join('/') : '/';
          
          let parentDesktopId: string | null = null;
          if (parentPath === '/') {
            parentDesktopId = null;
          } else {
            const parentFolderItem = desktopState.desktopItems.find(
              (item) => item.path === parentPath && item.type === 'folder'
            );
            if (parentFolderItem) {
              parentDesktopId = parentFolderItem.id;
            } else {
              console.warn(`Could not find parent DesktopItem for path: ${parentPath}. New file ${name} will default to desktop parentId.`);
            }
          }

          console.log(`New file reference being created in DesktopContext: ${currentFilePath}. Dispatching CREATE_ITEM with parentId: ${parentDesktopId}`);
          desktopDispatch({
            type: "CREATE_ITEM",
            payload: {
              id: `file-${name}-${Date.now()}`,
              title: name,
              type: "file", 
              icon: getDefaultIcon("file", name),
              path: currentFilePath,
              parentId: parentDesktopId,
            }
          });
        } else {
          console.log(`File ${currentFilePath} updated. Already in DesktopContext or no change to context item needed from save.`);
        }
      } else {
        setStatusMessage("Error: Could not save file to FS");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      setStatusMessage("Error: Could not save file");
    }
    setTimeout(() => setStatusMessage(""), 3000);
  }, [currentFilePath, content, fileSystem, desktopDispatch, desktopState.desktopItems, handleSaveAs, setIsDirty, setStatusMessage]);

  // Effect to update the ref when handleSave changes
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (handleSaveRef.current) { // Use the ref for consistency
        handleSaveRef.current();
      }
    }
  }, []); // handleSaveRef is stable, handleSave is not needed in deps

  const handleCut = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = content.substring(start, end);
      navigator.clipboard.writeText(selectedText);

      const newContent = content.substring(0, start) + content.substring(end);
      setContent(newContent);
      setIsDirty(true);

      // Update stats
      setLineCount(newContent.split("\n").length);
      setCharCount(newContent.length);
    }
  };

  const handleCopy = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = content.substring(start, end);
      navigator.clipboard.writeText(selectedText);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent =
        content.substring(0, start) + clipboardText + content.substring(end);
      setContent(newContent);
      setIsDirty(true);

      // Update stats and set cursor position
      setLineCount(newContent.split("\n").length);
      setCharCount(newContent.length);

      // Need to use setTimeout to set selection after React updates the textarea
      setTimeout(() => {
        textarea.selectionStart = start + clipboardText.length;
        textarea.selectionEnd = start + clipboardText.length;
      }, 0);
    } catch (error) {
      console.error("Error pasting text:", error);
      setStatusMessage("Error: Could not paste from clipboard");
    }
  };

  const handleSelectAll = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.select();
    }
  };

  if (!fileSystem.isReady && !currentFilePath) { 
    return <div className={styles.loading}>Initializing Editor...</div>;
  }
  if (!fileSystem.isReady && currentFilePath) { 
    return <div className={styles.loading}>Loading File System for {currentFilePath}...</div>;
  }

  return (
    <div className={styles.textEditor} onKeyDown={handleKeyDown}>
      <div className={styles.toolbar}>
        <div className={styles.fileMenu}>
          <div className={styles.menuDropdown}>
            <button className={styles.menuButton}>File</button>
            <div className={styles.dropdownContent}>
              <button onClick={() => handleSaveRef.current && handleSaveRef.current()} disabled={!isDirty && currentFilePath === initialFilePath}>
                Save
              </button>
              <button onClick={handleSaveAs}>Save As...</button>
              <hr />
              <button>Properties</button>
              <hr />
              <button>Exit</button>
            </div>
          </div>
          <div className={styles.menuDropdown}>
            <button className={styles.menuButton}>Edit</button>
            <div className={styles.dropdownContent}>
              <button onClick={handleCut}>Cut</button>
              <button onClick={handleCopy}>Copy</button>
              <button onClick={handlePaste}>Paste</button>
              <hr />
              <button onClick={handleSelectAll}>Select All</button>
            </div>
          </div>
          <button className={styles.menuButton}>Format</button>
          <button className={styles.menuButton}>View</button>
          <button className={styles.menuButton}>Help</button>
        </div>
        <div className={styles.actions}>
          <button
            onClick={() => handleSaveRef.current && handleSaveRef.current()}
            className={styles.saveButton}
            disabled={!isDirty}
            title="Save"
          >
            Save
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className={styles.editorArea}
        value={content}
        onChange={handleChange}
        spellCheck={false}
        placeholder="Type here..."
      />

      <div className={styles.statusBar}>
        <div className={styles.fileInfo}>
          {fileName}
          {isDirty ? " *" : ""}
        </div>
        <div className={styles.statusMessage}>{statusMessage}</div>
        <div className={styles.stats}>
          {lineCount} lines | {charCount} characters
        </div>
      </div>
    </div>
  );
};

export default TextEditorWindow;
