// src/components/windows/WindowTypes/TextEditorWindow.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from './TextEditorWindow.module.scss';
import { Desktop as DesktopModel } from "../../../model/Desktop";

export interface TextEditorWindowProps {
  filePath: string;
  desktopModel: DesktopModel;
  windowId: string;
}

type SaveFunctionType = (isSaveAs?: boolean) => Promise<void>;

const TextEditorWindow: React.FC<TextEditorWindowProps> = ({ filePath, desktopModel, windowId }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSaveRef = useRef<SaveFunctionType | null>(null);

  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState(filePath);
  const [fileName, setFileName] = useState(
    filePath ? filePath.split("/").pop() || "Untitled" : "Untitled"
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setFileName(currentFilePath ? currentFilePath.split("/").pop() || "Untitled" : "Untitled");
  }, [currentFilePath]);

  useEffect(() => {
    if (windowId && desktopModel) {
      const baseTitle = fileName || "Untitled";
      const newTitle = `📄 ${baseTitle}${isDirty ? "*" : ""}`;
      const currentWindow = desktopModel.windowManager.findWindowById(windowId);
      if (currentWindow && currentWindow.title !== newTitle) {
          desktopModel.windowManager.updateWindowTitle(windowId, newTitle);
      }
    }
  }, [fileName, isDirty, windowId, desktopModel]);

  useEffect(() => {
    if (!desktopModel || !currentFilePath) {
      if (!currentFilePath && filePath) {
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
        const fileContent = desktopModel.readFileContent(currentFilePath);
        if (fileContent !== null) {
          setContent(fileContent);
          setLineCount(fileContent.split("\n").length);
          setCharCount(fileContent.length);
          setStatusMessage("File loaded.");
        } else {
          setContent("");
          setStatusMessage(currentFilePath === filePath ? `File not found or empty: ${currentFilePath}` : `Ready to save to new file: ${currentFilePath}`);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        setContent("");
        setStatusMessage(`Error: Could not read file ${currentFilePath}`);
      }
      setIsDirty(false);
      setTimeout(() => setStatusMessage(""), 3000);
    };
    loadFile();
  }, [desktopModel, currentFilePath, filePath]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsDirty(true);
    setLineCount(newContent.split("\n").length);
    setCharCount(newContent.length);
  };

  const handleSaveAs = useCallback(async () => {
    const newPathSuggestion = currentFilePath || (filePath ? filePath.substring(0, filePath.lastIndexOf('/') + 1) + "untitled.txt" : "/untitled.txt");
    const newPath = window.prompt("Enter new file path:", newPathSuggestion);

    if (newPath && newPath.trim() !== "" && newPath.trim() !== currentFilePath) {
      setCurrentFilePath(newPath.trim()); 
      
      if (handleSaveRef.current) {
        await handleSaveRef.current(true);
      }
    } else if (newPath && newPath.trim() === currentFilePath) {
        setStatusMessage("Save As path is the same as current. Use Save instead.");
    } else {
      setStatusMessage("Save As cancelled or invalid path.");
    }
     setTimeout(() => setStatusMessage(""), 3000);
  }, [currentFilePath, filePath, setCurrentFilePath, setStatusMessage]);

  const handleSave = useCallback(async (isSaveAs: boolean = false) => {
    if (!currentFilePath) {
      if (!isSaveAs) { 
        handleSaveAs(); 
      } else {
         setStatusMessage("Error: No file path specified even after Save As prompt.");
      }
      return;
    }
    if (!desktopModel) {
      setStatusMessage("Error: File system interaction not ready.");
      return;
    }

    setStatusMessage("Saving...");
    try {
      const success = desktopModel.writeFileContent(currentFilePath, content);
      if (success) {
        setIsDirty(false);
        setStatusMessage("File saved successfully");
      } else {
        setStatusMessage("Error: Could not save file (see console for details).");
      }
    } catch (error) {
      console.error("Error saving file (caught in component):", error);
      setStatusMessage("Error: Could not save file");
    }
    setTimeout(() => setStatusMessage(""), 3000);
  }, [currentFilePath, content, desktopModel, handleSaveAs, setIsDirty, setStatusMessage]);

  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (e.shiftKey) {
        handleSaveAs();
      } else {
        if (handleSaveRef.current) {
            handleSaveRef.current();
        }
      }
    }
  }, [handleSaveAs]);

  const menuItems = [
    {
      name: "File",
      items: [
        { name: "New", action: () => { 
            setCurrentFilePath("");
            setContent(""); 
            setIsDirty(false); 
            setStatusMessage("New file. Use Save As."); 
        }},
        { name: "Open...", action: () => { 
            const pathToOpen = window.prompt("Enter file path to open:");
            if (pathToOpen) setCurrentFilePath(pathToOpen);
        }},
        { name: "Save", action: () => { if (handleSaveRef.current) handleSaveRef.current(); } },
        { name: "Save As...", action: handleSaveAs },
      ],
    },
    {
      name: "Edit",
      items: [
        { name: "Cut", action: () => { if (textareaRef.current) { document.execCommand('cut'); setIsDirty(true); } } },
        { name: "Copy", action: () => { if (textareaRef.current) document.execCommand('copy'); } },
        { name: "Paste", action: async () => { 
            if (textareaRef.current) { 
                try {
                    const text = await navigator.clipboard.readText();
                    const ta = textareaRef.current;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const currentVal = ta.value;
                    ta.value = currentVal.substring(0, start) + text + currentVal.substring(end);
                    ta.selectionStart = ta.selectionEnd = start + text.length;
                    setContent(ta.value);
                    setIsDirty(true); 
                } catch (err) {
                    console.warn("Paste failed:", err);
                }
            }
        }},
        { name: "Select All", action: () => { if (textareaRef.current) textareaRef.current.select(); } },
      ],
    },
  ];

  const renderMenuBar = () => (
    <div className={styles.menuBar}>
      {menuItems.map((menu) => (
        <div key={menu.name} className={styles.menuItem}>
          <span>{menu.name}</span>
          <div className={styles.dropdownMenu}>
            {menu.items.map((item) => (
              <div key={item.name} onClick={item.action} className={styles.dropdownItem}>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.textEditorWindow} onKeyDown={handleKeyDown} tabIndex={0}>
      {renderMenuBar()} 
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        className={styles.editorTextarea}
        spellCheck="false"
      />
      <div className={styles.statusBar}>
        <span className={styles.statusInfo}>Ln: {lineCount}, Col: {/* TODO */} Ch: {charCount}</span>
        <span className={styles.statusMessage}>{statusMessage || (isDirty ? "Modified" : "Saved")}</span>
      </div>
    </div>
  );
};

export default TextEditorWindow;
