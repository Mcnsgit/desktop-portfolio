import React, { useEffect } from "react";
import Head from "next/head";

/**
 * Component to properly preload fonts with the correct 'as' attribute
 * to avoid browser warnings about unused preloaded resources
 */
const FontPreloader: React.FC = () => {
  return (
    <Head>
      {/* Add proper font preloading with correct 'as' attribute */}
      <link
        rel="preload"
        href="/_next/static/media/93f479601ee12b01-s.p.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/_next/static/media/569ce4b8f30dc480-s.p.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Add custom MS Sans Serif font for retro look */}
      <link
        rel="preload"
        href="/fonts/ms-sans-serif.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Add CSS to ensure fonts are used immediately to prevent warnings */}
      <style jsx global>{`
        @font-face {
          font-family: "MS Sans Serif";
          src: url("/fonts/ms-sans-serif.woff2") format("woff2");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
    </Head>
  );
};

export default FontPreloader;
