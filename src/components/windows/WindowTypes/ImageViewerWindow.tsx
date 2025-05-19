// src/components/windows/WindowTypes/ImageViewerWindow.tsx
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useFileSystem } from "../../../context/FileSystemContext";
import styles from "./ImageViewerWindow.module.scss";

interface ImageViewerWindowProps {
  filePath?: string;
}

const ImageViewerWindow: React.FC<ImageViewerWindowProps> = ({ filePath }) => {
  const fileSystem = useFileSystem();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fileName, setFileName] = useState(
    filePath ? filePath.split("/").pop() || "Image" : "Image"
  );
  const [isLoading, setIsLoading] = useState(true);

  // Get MIME type based on file extension
  const getMimeType = useCallback((path: string): string => {
    const ext = path.toLowerCase().split(".").pop() || "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      webp: "image/webp",
      svg: "image/svg+xml",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }, []);

  // Load image when component mounts
  useEffect(() => {
    if (!fileSystem.isReady || !filePath) {
      setIsLoading(false);
      if (!filePath) setError("No image file specified.");
      else if (!fileSystem.isReady) setError("File system not ready.");
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);
      setImageUrl(null);

      try {
        // Check if the path is a direct public asset (e.g., for default icons/images)
        // These paths won't be in the virtual FS.
        if (filePath.startsWith('/assets/') || filePath.startsWith('/images/') || filePath.startsWith('/backgrounds/')) {
          setImageUrl(filePath); // Directly use public path
        } else {
          // Attempt to read from the virtual file system
          const imageData = await fileSystem.readFile(filePath);

          if (imageData === null) {
            setError(`File not found or error reading: ${filePath}`);
          } else if (typeof imageData === 'string') {
            // Handle case where it might be a data URI string or SVG string
            if (imageData.startsWith('data:image')) {
                setImageUrl(imageData);
            } else {
                // Potentially treat as SVG string if applicable, or error for other strings
                // For now, we'll assume only data URIs are valid image strings
                setError(`Unsupported string file content for image: ${filePath}. Expected data URI.`);
            }
          } else { // At this point, imageData must be Uint8Array
            const mimeType = getMimeType(filePath);
            const blob = new Blob([imageData], { type: mimeType });
            const objectURL = URL.createObjectURL(blob);
            setImageUrl(objectURL);
            // It's important to revoke the object URL when the component unmounts or image changes
            // This will be handled in the return function of this useEffect
          }
        }
      } catch (err) {
        console.error("Error loading image:", err);
        setError(`Failed to load image: ${filePath}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
    setFileName(filePath.split("/").pop() || "Image");

    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [fileSystem.isReady, filePath, fileSystem.readFile, getMimeType, imageUrl, fileSystem]);

  // Handle zoom in
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  // Handle reset zoom
  const handleResetZoom = () => {
    setZoom(1);
  };

  // Handle image load error
  const handleImageError = () => {
    setError("Failed to load image");
    setIsLoading(false);
  };

  // Loading state
  if (!fileSystem.isReady && isLoading) {
    return <div className={styles.loading}>Initializing File System...</div>;
  }

  return (
    <div className={styles.imageViewer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.fileMenu}>
          <div className={styles.menuDropdown}>
            <button className={styles.menuButton}>File</button>
            <div className={styles.dropdownContent}>
              <button>Open</button>
              <button>Save As...</button>
              <hr />
              <button>Print</button>
              <hr />
              <button>Exit</button>
            </div>
          </div>
          <div className={styles.menuDropdown}>
            <button className={styles.menuButton}>Edit</button>
            <div className={styles.dropdownContent}>
              <button>Copy</button>
              <button>Properties</button>
            </div>
          </div>
          <div className={styles.menuDropdown}>
            <button className={styles.menuButton}>View</button>
            <div className={styles.dropdownContent}>
              <button onClick={handleZoomIn}>Zoom In</button>
              <button onClick={handleZoomOut}>Zoom Out</button>
              <button onClick={handleResetZoom}>Original Size</button>
            </div>
          </div>
          <button className={styles.menuButton}>Help</button>
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleZoomIn}
            className={styles.actionButton}
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className={styles.actionButton}
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleResetZoom}
            className={styles.actionButton}
            title="Reset Zoom"
          >
            1:1
          </button>
        </div>
      </div>

      {/* Image display area */}
      <div className={styles.imageContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading image...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : imageUrl ? (
          <div
            className={styles.imageWrapper}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            <Image
              src={imageUrl}
              alt={fileName}
              className={styles.image}
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className={styles.noImage}>No image to display</div>
        )}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.fileName}>{fileName}</div>
        <div className={styles.zoomLevel}>{Math.round(zoom * 100)}%</div>
      </div>
    </div>
  );
};

export default ImageViewerWindow;
