import React from "react";
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
        
        /* Add a direct usage of the font to ensure it's used immediately */
        body::before {
          font-family: "MS Sans Serif";
          content: "";
          visibility: hidden;
          position: absolute;
          height: 0;
        }
      `}</style>
    </Head>
  );
};

export default FontPreloader;