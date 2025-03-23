import "@/styles/globals.css";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '../components/LoadingScreen';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url) => {
      // Only show loading when navigating from dashboard to about/feedback
      if (router.pathname === '/' && (url.includes('/about') || url.includes('/feedback'))) {
        setIsLoading(true);
        // Force 3 second delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    router.events.on('routeChangeStart', handleStart);
    return () => router.events.off('routeChangeStart', handleStart);
  }, [router]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <Component {...pageProps} />
    </>
  );
}
