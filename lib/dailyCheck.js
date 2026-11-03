/* lib/dailyCheck.js (added 2026-11-01)
   DAILY CHECK — for one day (Toronto time), adds up every order and every
   payment and checks that the numbers agree. Used by /api/daily-check and
   the DAILY CHECK panel in /admin.

   It checks:
     1. every order of the day is credited to a customer service person;
     2. the totals add up: total = paid + unpaid, and total = the sum of
        each customer service person's orders (count and amount);
     3. every payment received that day equals its order amount;
     4. the money the system recorded for each payment channel equals the
        figure the owner enters from the bank statement / wallet;
     5. Interac e-Transfer emails that could not be matched (no order
        number, unknown order, wrong amount, or a second payment for an
        order that is already PAID — a possible duplicate);
     6. orders of that day still UNPAID more than 48 hours after they
        were created.

   Order amounts are what the customer has to pay, after any voucher;
   the voucher discounts given are totalled separately (totals.vouchers).

   Amounts are never converted: CAD and USD are always totalled
   separately. Pure function — no database access here. */

export const STALE_HOURS = 48

const cents = (n) => Math.round(Number(n || 0) * 100)
const money = (c) => Math.round(c) / 100

export const CHANNEL_LABELS = {
  'wire-CAD': 'Bank wire (CAD)',
  'wire-USD': 'Bank wire (USD)',
  'emt-CAD': 'Interac e-Transfer (CAD)',
  'usdt-USD': 'USDT (USD)',
  'usdt-CAD': 'USDT (CAD amount)',
}
export const STANDARD_CHANNELS = ['wire-CAD', 'wire-USD', 'emt-CAD', 'usdt-USD']
export const channelOf = (o) => String(o.method) + '-' + String(o.currency)

function emptyTotals() {
  return { count: 0, CAD: 0, USD: 0 } // amounts kept in cents internally
}
function add(t, o, field) {
  t.count += 1
  const c = o.currency === 'USD' ? 'USD' : 'CAD'
  t[c] += cents(field === undefined ? o.amount : field)
}
function out(t) {
  return { count: t.count, CAD: money(t.CAD), USD: money(t.USD) }
}
const money2 = (c) => money(c).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtTotals = (t) => {
  const parts = []
  if (t.CAD || !t.USD) parts.push('CAD $' + money2(t.CAD))
  if (t.USD) parts.push('USD $' + money2(t.USD))
  return t.count + ' order' + (t.count === 1 ? '' : 's') + ', ' + parts.join(' + ')
}

/* orders:     orders created OR paid on `day` — each row:
               { id, amount, currency, method, rep, rep_id, status,
                 paid_via, amount_received, created_day, paid_day, created, paid }
   stale:      that day's orders still UNPAID more than 48 h after creation
   emtLog:     Interac emails read on `day`: { order_id, amount, result, received }
   statements: { channel: amount } figures the owner typed in for `day` */
export function computeDailyCheck({ day, orders = [], stale = [], emtLog = [], statements = {} }) {
  const created = orders.filter((o) => o.created_day === day)
  const paidToday = orders.filter((o) => o.status === 'PAID' && o.paid_day === day)

  /* ---- orders created today ---- */
  const total = emptyTotals()
  const paid = emptyTotals()
  const unpaid = emptyTotals()
  const vouchers = emptyTotals()   // discounts given with customer vouchers
  const staffMap = new Map()
  for (const o of created) {
    add(total, o)
    if (o.voucher_amount) add(vouchers, o, o.voucher_amount)
    add(o.status === 'PAID' ? paid : unpaid, o)
    const key = o.rep_id ? 'id' + o.rep_id : 'name' + (o.rep || '')
    if (!staffMap.has(key)) {
      staffMap.set(key, { name: o.rep || '', repId: o.rep_id || null, all: emptyTotals(), paid: emptyTotals(), unpaid: emptyTotals() })
    }
    const s = staffMap.get(key)
    add(s.all, o)
    add(o.status === 'PAID' ? s.paid : s.unpaid, o)
  }
  const staffRows = [...staffMap.values()]
    .sort((a, b) => (a.name ? 0 : 1) - (b.name ? 0 : 1) || a.name.localeCompare(b.name))
  const staffSum = emptyTotals()
  staffRows.forEach((s) => { staffSum.count += s.all.count; staffSum.CAD += s.all.CAD; staffSum.USD += s.all.USD })

  /* ---- payments received today, by channel ---- */
  const chMap = new Map()
  const amountMismatch = []
  for (const o of paidToday) {
    const ch = channelOf(o)
    if (!chMap.has(ch)) chMap.set(ch, { channel: ch, count: 0, expected: 0, received: 0 })
    const c = chMap.get(ch)
    const exp = cents(o.amount)
    const got = o.amount_received === null || o.amount_received === undefined || o.amount_received === ''
      ? exp : cents(o.amount_received)
    c.count += 1
    c.expected += exp
    c.received += got
    if (got !== exp) {
      amountMismatch.push({ id: o.id, currency: o.currency, method: o.method, rep: o.rep || '',
        expected: money(exp), received: money(got), difference: money(got - exp) })
    }
  }
  for (const ch of [...STANDARD_CHANNELS, ...Object.keys(statements)]) {
    if (!chMap.has(ch)) chMap.set(ch, { channel: ch, count: 0, expected: 0, received: 0 })
  }
  const channels = [...chMap.values()].map((c) => {
    const st = statements[c.channel]
    const has = st !== undefined && st !== null && st !== ''
    const diff = has ? cents(st) - c.received : null
    return {
      channel: c.channel,
      label: CHANNEL_LABELS[c.channel] || c.channel,
      currency: c.channel.endsWith('USD') ? 'USD' : 'CAD',
      count: c.count,
      expected: money(c.expected),
      received: money(c.received),
      statement: has ? money(cents(st)) : null,
      difference: diff === null ? null : money(diff),
      status: !has ? (c.count ? 'not-entered' : 'none') : diff === 0 ? 'ok' : 'mismatch',
    }
  }).sort((a, b) => {
    const ia = STANDARD_CHANNELS.indexOf(a.channel); const ib = STANDARD_CHANNELS.indexOf(b.channel)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })

  /* ---- e-Transfer emails that need a decision ---- */
  const emtReview = emtLog.filter((l) => String(l.result || '').startsWith('REVIEW'))
  const duplicates = emtReview.filter((l) => /already PAID/i.test(l.result))
  const otherReview = emtReview.filter((l) => !/already PAID/i.test(l.result))

  /* ---- the checks ---- */
  const noRep = created.filter((o) => !o.rep_id && !o.rep)
  const checks = []
  const push = (ok, text, detail) => checks.push({ ok, text, detail: detail || null })

  const sumOk = total.count === paid.count + unpaid.count &&
    total.CAD === paid.CAD + unpaid.CAD && total.USD === paid.USD + unpaid.USD
  push(sumOk, sumOk
    ? 'Total orders = paid + unpaid (' + fmtTotals(total) + ')'
    : 'Total orders do NOT equal paid + unpaid')

  const staffOk = total.count === staffSum.count && total.CAD === staffSum.CAD && total.USD === staffSum.USD
  push(staffOk, staffOk
    ? 'Total orders = sum of every customer service person\'s orders'
    : 'Total orders do NOT equal the sum of the customer service totals')

  push(noRep.length === 0, noRep.length === 0
    ? 'Every order is credited to a customer service person'
    : noRep.length + ' order' + (noRep.length === 1 ? ' has' : 's have') + ' no customer service person',
  noRep.map((o) => o.id))

  push(amountMismatch.length === 0, amountMismatch.length === 0
    ? 'Every payment received this day equals its order amount (' + paidToday.length + ' payment' + (paidToday.length === 1 ? '' : 's') + ')'
    : amountMismatch.length + ' payment' + (amountMismatch.length === 1 ? '' : 's') + ' received with a different amount than the order',
  amountMismatch.map((m) => m.id + ': order ' + m.currency + ' ' + m.expected.toFixed(2) + ', received ' + m.received.toFixed(2)))

  const entered = channels.filter((c) => c.status === 'ok' || c.status === 'mismatch')
  const badCh = channels.filter((c) => c.status === 'mismatch')
  const missingCh = channels.filter((c) => c.status === 'not-entered')
  if (entered.length) {
    push(badCh.length === 0, badCh.length === 0
      ? 'Bank / wallet figures match the system (' + entered.map((c) => c.label).join(', ') + ')'
      : 'Bank / wallet figure does NOT match: ' + badCh.map((c) => c.label).join(', '),
    badCh.map((c) => c.label + ': system ' + c.received.toFixed(2) + ', bank/wallet ' + c.statement.toFixed(2) +
      ' (difference ' + (c.difference > 0 ? '+' : '') + c.difference.toFixed(2) + ')'))
  }
  if (missingCh.length) {
    push(null, 'Bank / wallet figure not entered yet for: ' + missingCh.map((c) => c.label).join(', '))
  }

  push(duplicates.length === 0, duplicates.length === 0
    ? 'No duplicate e-Transfer payments'
    : duplicates.length + ' possible duplicate payment' + (duplicates.length === 1 ? '' : 's') + ' (paid again for an order already PAID)',
  duplicates.map((l) => (l.order_id || '—') + ' — ' + (l.amount !== null && l.amount !== undefined ? '$' + Number(l.amount).toFixed(2) : 'no amount') + ' — ' + (l.received || '')))

  push(otherReview.length === 0, otherReview.length === 0
    ? 'Every Interac e-Transfer email matched an order'
    : otherReview.length + ' e-Transfer email' + (otherReview.length === 1 ? '' : 's') + ' could not be matched — check and mark PAID by hand',
  otherReview.map((l) => (l.order_id || 'no order #') + ' — ' + (l.amount !== null && l.amount !== undefined ? '$' + Number(l.amount).toFixed(2) : 'no amount') + ' — ' + String(l.result).replace(/^REVIEW:\s*/, '')))

  push(stale.length === 0, stale.length === 0
    ? 'No orders unpaid for more than ' + STALE_HOURS + ' hours'
    : stale.length + ' order' + (stale.length === 1 ? '' : 's') + ' still unpaid after ' + STALE_HOURS + ' hours',
  stale.map((o) => o.id + ' — ' + o.currency + ' ' + Number(o.amount).toFixed(2) + ' — ' + (o.rep || 'no rep') + ' — created ' + o.created))

  const problems = checks.filter((c) => c.ok === false).length
  return {
    day,
    status: problems ? 'problems' : 'ok',
    problems,
    totals: { all: out(total), paid: out(paid), unpaid: out(unpaid), vouchers: out(vouchers) },
    byStaff: staffRows.map((s) => ({ name: s.name, repId: s.repId, all: out(s.all), paid: out(s.paid), unpaid: out(s.unpaid) })),
    channels,
    amountMismatch,
    duplicates,
    emtReview: otherReview,
    stale,
    checks,
    orders: created.map((o) => ({ id: o.id, created: o.created, rep: o.rep || '', method: o.method,
      currency: o.currency, amount: Number(o.amount), status: o.status, paid: o.paid || '',
      received: o.amount_received === null || o.amount_received === undefined ? null : Number(o.amount_received),
      voucher: o.voucher_code || '',
      voucherAmount: o.voucher_amount === null || o.voucher_amount === undefined ? null : Number(o.voucher_amount) })),
  }
}
