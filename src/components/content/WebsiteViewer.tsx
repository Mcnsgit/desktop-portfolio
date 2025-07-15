import React from 'react';

const WebsiteViewer = ({ url }: { url: string }) => {
  return (
    <iframe
      src={url}
      style={{ border: 'none', width: '100%', height: '100%' }}
      title={url}
    />
  );
};

export default WebsiteViewer;