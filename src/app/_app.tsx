// pages/_app.tsx
import { AppProps } from 'next/app';
import { DesktopProvider } from '../context/DesktopContext';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DesktopProvider>
      <Component {...pageProps} />
    </DesktopProvider>
  );
}

export default MyApp;