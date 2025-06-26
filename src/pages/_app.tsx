import {
  ClerkProvider,

} from '@clerk/nextjs'
import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import Navbar from '@/components/Navbar'
import Head from 'next/head'



function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Math Teacher</title>
        <meta name="description" content="A platform for math teachers to create and share interactive math problems." />
        <meta name="keywords" content="math, teacher, interactive, problems, education" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/one.ico" />
      </Head>
      <ClerkProvider>
        <Navbar />

        <Component {...pageProps} />
      </ClerkProvider>
    </>
  )
}

export default MyApp