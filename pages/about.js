import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang } from '../lib/i18n'
import { AboutIntro, Partners, Team } from '../components/Sections'

/* 2026-10-06 — About Us page.
   Company overview, strategic cooperation and team now live here
   (moved off the homepage). Opened from ABOUT US in the top nav. */
export default function About() {
  const { isZh } = useLang()
  const title = isZh ? '關於我們 — COSMOS Ledger Labs' : 'About Us — COSMOS Ledger Labs'
  const desc = isZh
    ? 'COSMOS Ledger Labs Inc. 是一家位於加拿大多倫多的數位資產技術公司。公司簡介、策略合作與團隊。'
    : 'COSMOS Ledger Labs Inc. is a Toronto-based digital asset technology company. Company overview, strategic cooperation and team.'

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/about" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/about" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:image" content="https://cosmosledgerlabs.com/og-image.png" />
      </Head>
      <Nav />
      <main className="aboutPage">
        <div className="fade-up"><AboutIntro num="01" /></div>
        <hr className="divider"/>
        <div className="fade-up"><Partners num="02" /></div>
        <hr className="divider"/>
        <div className="fade-up"><Team num="03" /></div>
      </main>
      <Footer />
      <style jsx>{`
        .aboutPage { position: relative; padding-top: 64px; }
        @media (max-width: 767px) { .aboutPage { padding-top: 96px; } }
      `}</style>
    </>
  )
}
