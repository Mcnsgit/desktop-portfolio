import React, { useEffect, useState } from 'react';

export interface VideoAssetProps {
  src: string;
}

const VideoPlayer = ({ src }: { src: string }) => {
  return (
    <video controls autoPlay style={{ width: '100%', height: '100%' }}>
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;