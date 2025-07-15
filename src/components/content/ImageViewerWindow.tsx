// src/components/windows/WindowTypes/ImageViewerWindow.tsx
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { DesktopFile } from "../../types/fs";
import styles from "./ImageViewerWindow.module.scss";

interface ImageViewerWindowProps {
    file: DesktopFile;
}

const ImageViewerWindow: React.FC<ImageViewerWindowProps> = ({ file }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [fileName, setFileName] = useState(
        file.data.image ? (file.data.image as string).split("/").pop() || "Image" : "Image"
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
    if (!file.data.image) {
      setIsLoading(false);
      setError("No image file specified.");
      return;
    } 

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);
      setImageUrl(null);

      try {
        // Check if the path is a direct public asset (e.g., for default icons/images)
        // These paths won't be in the virtual FS.
        if (typeof file.data.image === 'string' && (file.data.image?.startsWith('/assets/') || file.data.image?.startsWith('/images/') || file.data.image?.startsWith('/backgrounds/'))) {
          setImageUrl(file.data.image as string); // Directly use public path
        } else {
          // Attempt to read from the virtual file system
          const imageData = await file.data.image;

          if (imageData === null) {
            setError(`File not found or error reading: ${file.data.image}`);
          } else if (typeof imageData === 'string') {
            // Handle case where it might be a data URI string or SVG string
            if (imageData.startsWith('data:image')) {
                setImageUrl(imageData);
            } else {
                // Potentially treat as SVG string if applicable, or error for other strings
                // For now, we'll assume only data URIs are valid image strings
                setError(`Unsupported string file content for image: ${file.data.image}. Expected data URI.`);
            }
          } else { // At this point, imageData must be Uint8Array
            setImageUrl(file.data.image as string);
            // It's important to revoke the object URL when the component unmounts or image changes
            // This will be handled in the return function of this useEffect
          }
        }
      } catch (err) {
        console.error("Error loading image:", err);
        setError(`Failed to load image: ${file.data.image}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
    setFileName(typeof file.data.image === 'string' ? (file.data.image as string).split("/").pop() || "Image" : "Image");

    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [file.data.image, getMimeType, imageUrl]);

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
