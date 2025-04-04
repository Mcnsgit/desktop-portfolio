// pages/_app.tsx
import { AppProps } from 'next/app';
// import { DesktopProvider } from '../context/DesktopContext';
import '../styles/globals.scss';
// import { FileSystemProvider } from '../context/FileSystemContext';
// 
function MyApp({ Component, pageProps }: AppProps) {
  return (



      <Component {...pageProps} />

  );
}

export default MyApp;