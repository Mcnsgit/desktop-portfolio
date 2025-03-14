// src/components/windows/WindowTypes/TextEditorWindow.tsx
import React, { useState, useEffect } from "react";
import { useFileSystem } from "../../../context/FileSystemContext";
import { readFileContent, writeFileContent } from "../../../utils/fileSystem";
import styles from "../../styles/TextEditorWindow.module.scss";

interface TextEditorWindowProps {
  filePath?: string;
}

const TextEditorWindow: React.FC<TextEditorWindowProps> = ({ filePath }) => {
  const { isLoaded } = useFileSystem();
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [fileName, setFileName] = useState(
    filePath ? filePath.split("/").pop() || "Untitled" : "Untitled"
  );
  const [statusMessage, setStatusMessage] = useState("");

  // Load file content when editor opens
  useEffect(() => {
    if (!isLoaded || !filePath) return;

    const fileContent = readFileContent(filePath);
    if (fileContent !== null) {
      setContent(fileContent);
      setFileName(filePath.split("/").pop() || "Untitled");
    } else {
      setContent("");
      setStatusMessage("Error: Could not read file");
    }

    setIsDirty(false);
  }, [isLoaded, filePath]);

  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  // Save file
  const handleSave = () => {
    if (!filePath) {
      setStatusMessage("Error: No file path specified");
      return;
    }

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
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      handleSave();
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
          <button className={styles.menuButton}>File</button>
          <button className={styles.menuButton}>Edit</button>
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
          {content.split("\n").length} lines | {content.length} characters
        </div>
      </div>
    </div>
  );
};
