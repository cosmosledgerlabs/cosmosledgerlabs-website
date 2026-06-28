import Head from 'next/head'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import {
  Problem, Solution, Architecture, Workflow,
  Security, Ecosystem, Roadmap, Downloads, Team, Contact
} from '../components/Sections'

export default function Home() {
  return (
    <>
      <Head>
        <title>COSMOS Ledger Labs — Workflow Infrastructure for Digital Asset Operations</title>
        <meta name="description" content="COSMOS Ledger Labs builds workflow automation infrastructure for digital asset operations. Built on Solana. Toronto, Canada." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#010610" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="COSMOS Ledger Labs — Workflow Infrastructure for Digital Asset Operations" />
        <meta property="og:description" content="Workflow automation infrastructure for digital asset operations. Built on Solana. Toronto, Canada." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://landing.cosmosledgerlabs.com" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Nav />
      <main>
        <Hero />
        <hr className="divider"/>
        <div className="fade-up"><Problem /></div>
        <hr className="divider"/>
        <div className="fade-up"><Solution /></div>
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
