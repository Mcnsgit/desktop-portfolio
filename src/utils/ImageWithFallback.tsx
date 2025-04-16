// src/utils/ImageWithFallback.tsx
import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError" | "placeholder"> {
  fallbackSrc?: string;
  placeholderColor?: string;
  priority?: boolean;
  onLoad?: () => void;
}

/**
 * Enhanced Image component with fallback, loading indicator, and error handling
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = "/assets/placeholders/image-placeholder.svg",
  alt,
  width,
  height,
  placeholderColor = "#f0f0f0",
  priority = false,
  onLoad,
  className,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  // Handle image load error
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    setImgSrc(fallbackSrc);
  };

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  return (
    <div
      className={`image-container ${className || ''}`}
      style={{
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'hidden',
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div
          className="image-loading-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: placeholderColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="loading-indicator"
            style={{
              width: '30%',
              height: '30%',
              maxWidth: '40px',
              maxHeight: '40px',
              border: '2px solid #ddd',
              borderRadius: '50%',
              borderTopColor: '#666',
              animation: 'spin 1s infinite linear',
            }}
          ></div>
        </div>
      )}

      {/* Image */}
      <Image
        {...rest}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        style={{
          ...rest.style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s',
        }}
      />

      {/* CSS for loading spinner */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageWithFallback;