import React from 'react';
import { marked } from 'marked'; // You would need to install marked: npm install marked

const MarkdownViewer = ({ content }: { content: string }) => {
  const html = marked(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MarkdownViewer;