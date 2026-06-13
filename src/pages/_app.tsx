import { ClerkProvider } from '@clerk/nextjs'
import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import Navbar from '@/components/Navbar'
import Head from 'next/head'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(err => console.error('SW registration failed:', err))
    }
  }, [])

  return (
    <>
      <Head>
        {/* ── Core ── */}
        <title>Math Teacher</title>
        <meta name="description" content="Interactive, adaptive math learning platform — geometry, algebra, arithmetic and more." />
        <meta name="keywords" content="math, learning, interactive, geometry, algebra, arithmetic, quizzes, education" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="google-site-verification" content="PBgQzTn9-6B7VhQw45VQsm3qgNB_shNhFwi4w0aqQbg" />

        {/* ── PWA ── */}
        <meta name="application-name" content="Math Teacher" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Math Teacher" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />

        {/* ── Manifest & Icons ── */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/one.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />

        {/* ── Open Graph (social sharing) ── */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Math Teacher — Interactive Math Learning" />
        <meta property="og:description" content="Adaptive quizzes, interactive visualizations, and mastery tracking for students." />
        <meta property="og:image" content="/icon-512.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Math Teacher" />
        <meta name="twitter:description" content="Interactive, adaptive math learning platform." />
      </Head>

      <ClerkProvider>
        <Navbar />
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  )
}

export default MyApp