import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en-CA">
      <Head>
        {/* 2026-11-13: Google Fonts preconnect removed — all fonts are served
            from this site (public/fonts), so no visitor data goes to Google. */}
        {/* Add-to-home-screen (PWA) */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="COSMOS" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
