// src/components/windows/WindowTypes/TextEditorWindow.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from './TextEditorWindow.module.scss';

export interface TextEditorWindowProps {
  windowId: string;
  initialContent: string;
  initialTitle: string;
  onTitleChange: (id: string, newTitle: string) => void;
}

const TextEditorWindow: React.FC<TextEditorWindowProps> = ({ windowId, initialContent, initialTitle, onTitleChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  // const [statusMessage, setStatusMessage] = useState("Ready");
  const [lineCount, setLineCount] = useState(() => initialContent.split("\n").length);
  const [charCount, setCharCount] = useState(() => initialContent.length);

  useEffect(() => {
    const newTitle = `📄 ${initialTitle}${isDirty ? "*" : ""}`;
    onTitleChange(windowId, newTitle);
  }, [isDirty, initialTitle, windowId, onTitleChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (!isDirty) {
      setIsDirty(true);
    }
    setLineCount(newContent.split("\n").length);
    setCharCount(newContent.length);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault();
      textareaRef.current?.select();
    }
  }, []);

  const menuItems = [
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
        <span className={styles.statusMessage}>{isDirty ? "Modified" : "Ready"}</span>
      </div>
    </div>
  );
};

export default TextEditorWindow;
  