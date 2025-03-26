// src/components/windows/WindowTypes/ImageViewerWindow.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useFileSystem } from "../../../context/FileSystemContext";
import { readFileContent } from "../../../utils/fileSystem";
import styles from "../../styles/ImageViewerWindow.module.scss";

interface ImageViewerWindowProps {
  filePath?: string;
}

const ImageViewerWindow: React.FC<ImageViewerWindowProps> = ({ filePath }) => {
  const fileSystemContext = useFileSystem();
  const isLoaded = fileSystemContext?.isLoaded ?? false;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fileName, setFileName] = useState(
    filePath ? filePath.split("/").pop() || "Image" : "Image"
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load image when component mounts
  useEffect(() => {
    if (!isLoaded || !filePath) {
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For demonstration purposes, we're using a placeholder
        // In a real implementation, this would need to be adapted to work with your file system
        if (filePath.includes("/assets/") || filePath.includes("/images/")) {
          // For static images in the public folder
          setImageUrl(filePath);
        } else {
          // For images in the virtual file system, we'd need to handle this differently
          // This is a placeholder that would need to be replaced with actual implementation
          setImageUrl(`/api/placeholder/400/300`);

          // Example of how you might handle it with a file system that supports blobs
          // const imageData = readFileContent(filePath, 'binary');
          // if (imageData) {
          //   const blob = new Blob([imageData], { type: getMimeType(filePath) });
          //   setImageUrl(URL.createObjectURL(blob));
          // } else {
          //   setError("Could not read image file");
          // }
        }
      } catch (err) {
        console.error("Error loading image:", err);
        setError("Failed to load image");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    // Update filename
    if (filePath) {
      setFileName(filePath.split("/").pop() || "Image");
    }
  }, [isLoaded, filePath]);

  // Get MIME type based on file extension
  const getMimeType = (path: string): string => {
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
  };

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
  if (!isLoaded) {
    return <div className={styles.loading}>Loading file system...</div>;
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
