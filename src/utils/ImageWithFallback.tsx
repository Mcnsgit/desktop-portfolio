import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
const DefaultIconImage = { src: "https://placehold.co/600x400.png" };
interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}
/**
 * A wrapper around Next.js Image component that provides a fallback
 * when the image fails to load
 */
const ImageWithFallback = ({
  src,
  fallbackSrc = "https://placehold.co/600x400.png",
  alt,
  ...rest
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  useEffect(() => {
    setImgSrc(src); // Update imgSrc when src prop changes
  }, [src]);
  const handleError = () => {
    setImgSrc(fallbackSrc);
  };
  return <Image {...rest} src={imgSrc} alt={alt} onError={handleError} />;
};
export default ImageWithFallback;