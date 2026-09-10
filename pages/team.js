/* pages/team.js
   Internal page for customer-service reps: log a worked day.
   Requires the TEAM passcode. Not linked from the public nav/footer. */

import { useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { REPS } from '../lib/settings'
import styles from '../styles/Pay.module.css'

function today() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function Team() {
  const [code, setCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [rep, setRep] = useState('')
  const [date, setDate] = useState(today())
  const [hours, setHours] = useState('')
  const [holiday, setHoliday] = useState(false)
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState([])

  const submit = async () => {
    setMsg('')
    if (!rep || !date || !(Number(hours) > 0)) { setMsg('Pick your name, date and hours.'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-passcode': code },
        body: JSON.stringify({ rep, date, hours: Number(hours), holiday, note }),
      })
      if (r.status === 401) { setUnlocked(false); setMsg('Wrong passcode.'); return }
      if (!r.ok) { setMsg('Not saved — check the entry and try again.'); return }
      setLog([{ rep, date, hours, holiday, note }, ...log])
      setMsg('RECORDED ✓')
      setHours(''); setHoliday(false); setNote('')
    } catch (e) {
      setMsg('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Head>
        <title>Team — COSMOS Ledger Labs</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <Nav />
      <main className={styles.page}>
        <div className={styles.main}>
          <h1 className={styles.title}>TEAM — LOG YOUR DAY</h1>

          {!unlocked ? (
            <section className={styles.section}>
              <label className={styles.label}>Team passcode</label>
              <input className={styles.input} type="password" value={code}
                     onChange={(e) => setCode(e.target.value)} placeholder="passcode" />
              <div style={{ marginTop: 14 }}>
                <button type="button" className={styles.btnBig} onClick={() => code && setUnlocked(true)}>ENTER →</button>
              </div>
              {msg ? <div className={styles.hint}>{msg}</div> : null}
            </section>
          ) : (
            <>
              <section className={styles.section}>
                <label className={styles.label}>Your name</label>
                <div className={styles.serviceGrid}>
                  {REPS.map((r) => (
                    <button key={r} type="button"
                            className={rep === r ? styles.chipOn : styles.chip}
                            onClick={() => setRep(r)}>{r}</button>
                  ))}
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Date</label>
                    <input className={styles.input} type="date" value={date}
                           onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Hours worked</label>
                    <input className={styles.input} type="number" min="0.5" max="24" step="0.5"
                           value={hours} onChange={(e) => setHours(e.target.value)} placeholder="8" />
                  </div>
                </div>
                <label className={styles.label} style={{ marginTop: 14 }}>Statutory holiday?</label>
                <div className={styles.segmented}>
                  <button type="button" className={!holiday ? styles.segOn : styles.seg}
                          onClick={() => setHoliday(false)}>NO</button>
                  <button type="button" className={holiday ? styles.segOn : styles.seg}
                          onClick={() => setHoliday(true)}>YES</button>
                </div>
                <label className={styles.label} style={{ marginTop: 14 }}>Note (optional — e.g. burst case)</label>
                <input className={styles.input} value={note} maxLength={200}
                       onChange={(e) => setNote(e.target.value)} placeholder="Burst case — extra client support" />
                <div style={{ marginTop: 16 }}>
                  <button type="button" className={styles.btnBig} disabled={busy} onClick={submit}>
                    {busy ? 'SAVING…' : 'RECORD DAY →'}
                  </button>
                </div>
                {msg ? <div className={styles.hint}>{msg}</div> : null}
              </section>

              {log.length > 0 ? (
                <section className={styles.section}>
                  <div className={styles.stepTag}>RECORDED THIS SESSION</div>
                  <div className={styles.detailCard}>
                    {log.map((e, i) => (
                      <p key={i} className={styles.item}>
                        {e.date} — {e.rep} — {e.hours}h{e.holiday ? ' — HOLIDAY' : ''}{e.note ? ' — ' + e.note : ''}
                      </p>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
