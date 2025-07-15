import React from 'react';
import Image from 'next/image';

const ImageViewer = ({ src }: { src: string }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Image src={src} alt={src} layout="fill" objectFit="contain" />
    </div>
  );
};

export default ImageViewer;