import Head from 'next/head'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import Demo from '../components/DemoSection'
import { Problem, Solution, Architecture, Workflow, Security, Ecosystem, Roadmap, Downloads, Team, Contact } from '../components/Sections'

export default function Home() {
  return (
    <>
      <Head>
        <title>COSMOS Ledger Labs — Workflow Infrastructure for Digital Asset Operations</title>
        <meta name="description" content="COSMOS Ledger Labs builds workflow automation infrastructure for digital asset operations. Built on Solana. Toronto, Canada." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Open Graph */}
        <meta property="og:title" content="COSMOS Ledger Labs — Workflow Infrastructure for Digital Asset Operations" />
        <meta property="og:description" content="Workflow automation infrastructure for digital asset operations. Built on Solana. Toronto, Canada." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cosmosledgerlabs.com/" />
        <meta property="og:site_name" content="COSMOS Ledger Labs" />
        <meta property="og:locale" content="en_CA" />
        <meta property="og:image" content="https://cosmosledgerlabs.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="COSMOS Ledger Labs — Workflow Automation Infrastructure" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="COSMOS Ledger Labs — Workflow Infrastructure for Digital Asset Operations" />
        <meta name="twitter:description" content="Workflow automation infrastructure for digital asset operations. Built on Solana. Toronto, Canada." />
        <meta name="twitter:image" content="https://cosmosledgerlabs.com/og-image.png" />

        {/* Schema.org — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'COSMOS Ledger Labs',
              url: 'https://cosmosledgerlabs.com/',
              description:
                'Workflow automation infrastructure for digital asset operations, built on Solana.',
              email: 'info@cosmosledgerlabs.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Toronto',
                addressRegion: 'ON',
                addressCountry: 'CA',
              },
            }),
          }}
        />
      </Head>
      <Nav />
      <main>
        <Hero />
        <hr className="divider"/>
        <div className="fade-up"><Problem /></div>
        <hr className="divider"/>
        <div className="fade-up"><Solution /></div>
        <hr className="divider"/>
        <div className="fade-up"><Demo /></div>
        <hr className="divider"/>
        <div className="fade-up"><Architecture /></div>
        <hr className="divider"/>
        <div className="fade-up"><Workflow /></div>
        <hr className="divider"/>
        <div className="fade-up"><Security /></div>
        <hr className="divider"/>
        <div className="fade-up"><Ecosystem /></div>
        <hr className="divider"/>
        <div className="fade-up"><Roadmap /></div>
        <hr className="divider"/>
        <div className="fade-up"><Downloads /></div>
        <hr className="divider"/>
        <div className="fade-up"><Team /></div>
        <hr className="divider"/>
        <div className="fade-up"><Contact /></div>
      </main>
      <Footer />
    </>
  )
}
