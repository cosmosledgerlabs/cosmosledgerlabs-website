import Head from 'next/head'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Architecture from '../components/Architecture'
import Footer from '../components/Footer'
import {
  Problem, Solution, Workflow,
  Security, Ecosystem, Roadmap,
  OnePager, Team, Contact
} from '../components/Sections'

export default function Home() {
  return (
    <>
      <Head>
        <title>COSMOS Ledger Labs — Workflow Infrastructure for Digital Asset Operations</title>
        <meta name="description" content="COSMOS Ledger Labs is building workflow automation infrastructure designed to streamline approval workflows, execution coordination, transaction validation, monitoring systems, and operational recovery mechanisms. Built on Solana." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph */}
        <meta property="og:title"       content="COSMOS Ledger Labs" />
        <meta property="og:description" content="Workflow Infrastructure for Digital Asset Operations. Built on Solana." />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://cosmosledgerlabs.com" />
      </Head>

      <Nav />

      <main>
        {/* S1 */}
        <Hero />

        <hr className="divider" />

        {/* S2 */}
        <Problem />

        <hr className="divider" />

        {/* S3 */}
        <Solution />

        <hr className="divider" />

        {/* S4 */}
        <Architecture />

        <hr className="divider" />

        {/* S5 */}
        <Workflow />

        <hr className="divider" />

        {/* S6 */}
        <Security />

        <hr className="divider" />

        {/* S7 */}
        <Ecosystem />

        <hr className="divider" />

        {/* S8 */}
        <Roadmap />

        <hr className="divider" />

        {/* S9 */}
        <OnePager />

        <hr className="divider" />

        {/* S10 */}
        <Team />

        <hr className="divider" />

        {/* S11 */}
        <Contact />
      </main>

      <Footer />
    </>
  )
}
