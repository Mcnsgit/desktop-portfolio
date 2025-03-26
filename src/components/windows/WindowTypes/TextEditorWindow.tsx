// src/components/windows/WindowTypes/TextEditorWindow.tsx
import React, { useState, useEffect } from "react";
import { useFileSystem } from "../../../context/FileSystemContext";
import { readFileContent, writeFileContent } from "../../../utils/fileSystem";
import styles from "../../styles/TextEditorWindow.module.scss";

interface TextEditorWindowProps {
  filePath?: string;
}

const TextEditorWindow: React.FC<TextEditorWindowProps> = ({ filePath }) => {
  const fileSystemContext = useFileSystem();
  const isLoaded = fileSystemContext?.isLoaded ?? false;
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [fileName, setFileName] = useState(
    filePath ? filePath.split("/").pop() || "Untitled" : "Untitled"
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Load file content when editor opens
  useEffect(() => {
    if (!isLoaded || !filePath) return;

    const loadFile = async () => {
      try {
        const fileContent = readFileContent(filePath);
        if (fileContent !== null) {
          setContent(fileContent);
          setFileName(filePath.split("/").pop() || "Untitled");

          // Update stats
          setLineCount(fileContent.split("\n").length);
          setCharCount(fileContent.length);
        } else {
          setContent("");
          setStatusMessage("Error: Could not read file");
        }
      } catch (error) {
        console.error("Error reading file:", error);
        setStatusMessage("Error: Could not read file");
      }

      setIsDirty(false);
    };

    loadFile();
  }, [isLoaded, filePath]);

  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsDirty(true);

    // Update stats
    setLineCount(newContent.split("\n").length);
    setCharCount(newContent.length);
  };

  // Save file
  const handleSave = () => {
    if (!filePath) {
      setStatusMessage("Error: No file path specified");
      return;
    }

    try {
      const success = writeFileContent(filePath, content);

      if (success) {
        setIsDirty(false);
        setStatusMessage("File saved successfully");

        // Clear status message after 2 seconds
        setTimeout(() => {
          setStatusMessage("");
        }, 2000);
      } else {
        setStatusMessage("Error: Could not save file");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      setStatusMessage("Error: Could not save file");
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  // Menu handlers
  const handleCut = () => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
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
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
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
      const textarea = document.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
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
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
    }
  };

  // Loading state
  if (!isLoaded) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.textEditor} onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.fileMenu}>
          <div className={styles.menuDropdown}>
            <button className={styles.menuButton}>File</button>
            <div className={styles.dropdownContent}>
              <button onClick={handleSave} disabled={!isDirty}>
                Save
              </button>
              <button disabled={!filePath}>Save As...</button>
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
            onClick={handleSave}
            className={styles.saveButton}
            disabled={!isDirty}
            title="Save"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor area */}
      <textarea
        className={styles.editorArea}
        value={content}
        onChange={handleChange}
        spellCheck={false}
        placeholder="Type here..."
      />

      {/* Status bar */}
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
