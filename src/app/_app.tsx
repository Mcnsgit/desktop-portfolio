// pages/_app.tsx
import { AppProps } from 'next/app';

import "./global.css";


function MyApp({ Component, pageProps }: AppProps) {
  return (



      <Component {...pageProps} />

  );
}

export default MyApp;