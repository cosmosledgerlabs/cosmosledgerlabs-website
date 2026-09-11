import { useState } from 'react'
import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useLang } from '../lib/i18n'
import { STEPS, newFlowId } from '../lib/steps'
import { runFlow, initSteps, STATUS, FLOW_STATE, readableError } from '../lib/orchestrator'
import { runSetup, readBalance, FLOW_AMOUNT, INITIAL_SUPPLY } from '../lib/spl'
import styles from '../styles/Flow.module.css'

/* Demo video: paste the YouTube link between the quotes when the video is
   ready (e.g. 'https://www.youtube.com/watch?v=XXXX'). While empty, the page
   shows a "coming soon" placeholder instead. */
const VIDEO_URL = ''

const CLUSTER = 'devnet'
const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com'
const EXPLORER = 'https://solscan.io'

const STATUS_LABEL = {
  [STATUS.PENDING]: { en: 'PENDING', zh: '待執行' },
  [STATUS.RUNNING]: { en: 'RUNNING', zh: '執行中' },
  [STATUS.SUCCESS]: { en: 'SUCCESS', zh: '成功' },
  [STATUS.FAILED]: { en: 'FAILED', zh: '失敗' },
  [STATUS.COMPENSATING]: { en: 'COMPENSATING', zh: '補償中' },
  [STATUS.COMPENSATED]: { en: 'COMPENSATED', zh: '已補償' },
  [STATUS.SKIPPED]: { en: 'NOT RUN', zh: '未執行' },
}

const STATUS_CLASS = {
  [STATUS.PENDING]: 'pending',
  [STATUS.RUNNING]: 'running',
  [STATUS.SUCCESS]: 'success',
  [STATUS.FAILED]: 'failed',
  [STATUS.COMPENSATING]: 'running',
  [STATUS.COMPENSATED]: 'compensated',
  [STATUS.SKIPPED]: 'skipped',
}

const T3 = {
  metaTitle: {
    en: 'Cross-Transaction Consistency Demo — COSMOS Ledger Labs',
    zh: '跨交易一致性演示 — COSMOS Ledger Labs',
  },
  metaDesc: {
    en: 'A three-step token operation on Solana devnet with automatic on-chain compensation when a step fails. Every transaction is independently verifiable.',
    zh: '在 Solana devnet 測試網上執行三步代幣操作，步驟失敗時自動執行鏈上補償交易。每筆交易均可獨立驗證。',
  },
  title: { en: 'CROSS-TRANSACTION CONSISTENCY', zh: '跨交易一致性' },
  sub1: {
    en: "Engineering demonstration on Solana devnet using test tokens. This page demonstrates COSMOS's workflow engineering approach — multi-step token operations with automatic on-chain compensation on failure. It is not a product, not an offer, and not connected to mainnet funds.",
    zh: '本頁為在 Solana devnet 測試網上使用測試代幣進行的工程演示，展示 COSMOS 的工作流工程方法——多步代幣操作，失敗時自動執行鏈上補償。它不是產品、不構成要約，亦不涉及主網資金。',
  },
  sub2: {
    en: 'A token operation is not one transaction. Approval, vesting setup and distribution are separate transactions. Solana is atomic within a transaction — not across a sequence. When a later step fails, the earlier ones stay on-chain.',
    zh: '一次代幣操作並非單一交易。審批、歸屬設定與分發是各自獨立的交易。Solana 只在單筆交易內具原子性——跨交易序列則否。當後面的步驟失敗時，前面的步驟仍留在鏈上。',
  },
  sub3: {
    en: 'This runs the sequence with real SPL token transfers, and on failure executes real on-chain compensating transactions for the steps already completed. Nothing is deleted — a chain cannot delete. Each compensation is a new, independently verifiable transaction, and the token balances return to where they started.',
    zh: '本演示以真實 SPL 代幣轉帳執行該序列，並在失敗時為已完成的步驟執行真實的鏈上補償交易。沒有任何內容被刪除——區塊鏈無法刪除。每筆補償都是一筆新的、可獨立驗證的交易，代幣餘額回到起點。',
  },
  videoWatch: { en: 'WATCH THE DEMO VIDEO', zh: '觀看演示影片' },
  videoOpens: { en: 'Opens on YouTube in a new tab', zh: '將在新分頁開啟 YouTube' },
  videoSoon: { en: 'DEMO VIDEO — COMING SOON', zh: '演示影片——即將推出' },
  videoSoonNote: { en: 'A guided walkthrough of this page will be posted here.', zh: '本頁的導覽影片將發佈於此。' },
  howShow: { en: '▸ HOW TO USE — TAP TO OPEN', zh: '▸ 使用說明——點按展開' },
  howHide: { en: '▾ HOW TO USE — TAP TO CLOSE', zh: '▾ 使用說明——點按收合' },
  howTitle: { en: 'HOW TO USE THIS DEMO', zh: '本演示使用說明' },
  how1: {
    en: 'Install the Phantom wallet browser extension and create a wallet. This demo runs only on the devnet test network and never touches real funds.',
    zh: '安裝 Phantom 錢包瀏覽器擴充功能並建立錢包。本演示僅在 devnet 測試網上執行，絕不涉及真實資金。',
  },
  how2: {
    en: 'In Phantom, open Settings → Developer Settings and switch the network to Solana Devnet.',
    zh: '在 Phantom 中開啟 Settings → Developer Settings，將網路切換為 Solana Devnet。',
  },
  how3: {
    en: 'Get free devnet SOL for transaction fees from a Solana devnet faucet (for example faucet.solana.com). Devnet SOL has no monetary value.',
    zh: '從 Solana devnet 水龍頭（例如 faucet.solana.com）領取免費的 devnet SOL 作為交易手續費。Devnet SOL 不具任何金錢價值。',
  },
  how4: {
    en: 'Click CONNECT above and approve the connection in Phantom.',
    zh: '點擊上方「連接錢包」，並在 Phantom 中核准連接。',
  },
  how5: {
    en: 'Click RUN SETUP. This mints a fresh test token and opens the accounts. Phantom will prompt twice — approve each prompt promptly. Setup costs roughly 0.02 devnet SOL.',
    zh: '點擊「執行初始設定」。這會鑄造一枚全新的測試代幣並開立帳戶。Phantom 會提示兩次——請即時逐一核准。初始設定約需 0.02 devnet SOL。',
  },
  how6: {
    en: 'Under FAILURE INJECTION, choose NONE to run all three steps, or FAIL AT 1 / 2 / 3 to force a failure and watch the on-chain compensation. Then click EXECUTE FLOW.',
    zh: '在「故障注入」下選擇「無」以完整執行三個步驟，或選擇「第 1／2／3 步失敗」以強制失敗並觀察鏈上補償。然後點擊「執行流程」。',
  },
  how7: {
    en: 'Watch the step panel and the TOKEN ACCOUNTS balances. Every transaction signature links to Solscan, so each run can be verified independently on-chain.',
    zh: '觀察步驟面板與「代幣帳戶」的餘額變化。每筆交易簽名都連結到 Solscan，每次執行都可在鏈上獨立驗證。',
  },
  how8: {
    en: 'To keep a record, click DOWNLOAD LOG before leaving or refreshing — the setup token and run history live only in this page and reset on refresh.',
    zh: '若要保留紀錄，請在離開或重新整理前點擊「下載紀錄」——設定的代幣與執行歷史僅存在於本頁，重新整理後即重置。',
  },
  howNote: {
    en: 'If a step shows a retry or waiting message, do not click or refresh — the engine checks transaction status and recovers on its own. Keep the Phantom panel open during a run; Phantom locks itself after about 15 minutes of inactivity.',
    zh: '若某步驟顯示重試或等待訊息，請勿點擊或重新整理——引擎會自行查核交易狀態並恢復。執行期間請保持 Phantom 面板開啟；Phantom 閒置約 15 分鐘後會自動鎖定。',
  },
  ctlWallet: { en: 'WALLET', zh: '錢包' },
  ctlSetup: { en: 'SETUP', zh: '初始設定' },
  ctlInjection: { en: 'FAILURE INJECTION', zh: '故障注入' },
  ctlRun: { en: 'RUN', zh: '執行' },
  ctlLog: { en: 'RUN LOG', zh: '執行紀錄' },
  btnConnect: { en: 'CONNECT', zh: '連接錢包' },
  btnSetup: { en: 'RUN SETUP', zh: '執行初始設定' },
  btnResetup: { en: 'RE-RUN SETUP', zh: '重新執行設定' },
  btnExecute: { en: 'EXECUTE FLOW', zh: '執行流程' },
  btnRunning: { en: 'RUNNING…', zh: '執行中…' },
  btnLog: { en: 'DOWNLOAD LOG', zh: '下載紀錄' },
  setupHint: {
    en: (supply) => 'Creates a test SPL token, mints ' + supply + ' to your account, and opens an escrow and a recipient account. Two wallet prompts. Needed once before running the flow.',
    zh: (supply) => '建立測試 SPL 代幣，鑄造 ' + supply + ' 枚到您的帳戶，並開立託管與接收帳戶。錢包會提示兩次。執行流程前需先完成一次。',
  },
  injNone: { en: 'NONE', zh: '無' },
  injAt: {
    en: (n) => 'FAIL AT ' + n,
    zh: (n) => '第 ' + n + ' 步失敗',
  },
  injHint: { en: 'Force a step to fail, to demonstrate compensation.', zh: '強制某一步驟失敗，以展示補償機制。' },
  flowIdLabel: { en: 'Flow ID: ', zh: '流程編號: ' },
  logHint: {
    en: 'Every run in this session, with signatures, balances and a summary. Downloads as a text file (in English). Cleared if the page is refreshed.',
    zh: '本次連線的每一次執行，含簽名、餘額與總結。以文字檔下載（內容為英文）。重新整理頁面後即清除。',
  },
  msgNoPhantom: {
    en: 'No Phantom wallet detected. Install the Phantom extension and switch it to Devnet.',
    zh: '未偵測到 Phantom 錢包。請安裝 Phantom 擴充功能並將其切換至 Devnet。',
  },
  msgConnected: {
    en: 'Wallet connected. Make sure Phantom is set to Devnet.',
    zh: '錢包已連接。請確認 Phantom 已設定為 Devnet。',
  },
  msgCancelled: { en: 'Connection cancelled.', zh: '已取消連接。' },
  msgConnectFirst: { en: 'Connect a wallet first.', zh: '請先連接錢包。' },
  msgSetupFirst: {
    en: 'Run SETUP first — the flow moves real SPL tokens.',
    zh: '請先執行初始設定——流程會移動真實的 SPL 代幣。',
  },
  msgCreating: {
    en: 'Creating token and accounts — the wallet will prompt twice…',
    zh: '正在建立代幣與帳戶——錢包將提示兩次…',
  },
  msgNoSolSetup: {
    en: 'Not enough Devnet SOL for setup. Request more at faucet.solana.com (setup needs about 0.02 SOL).',
    zh: 'Devnet SOL 不足，無法完成初始設定。請至 faucet.solana.com 領取（初始設定約需 0.02 SOL）。',
  },
  msgSetupDone: {
    en: (supply) => 'Setup complete. ' + supply + ' test tokens minted to your account.',
    zh: (supply) => '初始設定完成。已鑄造 ' + supply + ' 枚測試代幣到您的帳戶。',
  },
  msgSetupFailed: { en: 'Setup failed: ', zh: '初始設定失敗：' },
  msgRunning: { en: 'Running…', zh: '執行中…' },
  msgNoSolFees: {
    en: 'Not enough Devnet SOL for fees. Request more at faucet.solana.com and try again.',
    zh: 'Devnet SOL 不足以支付手續費。請至 faucet.solana.com 領取後再試。',
  },
  msgLowTokens: {
    en: (owner, amount) => 'Your token account holds ' + owner + ', and this flow moves ' + amount + '. Run SETUP again to mint a fresh allocation.',
    zh: (owner, amount) => '您的代幣帳戶餘額為 ' + owner + '，本流程需移動 ' + amount + '。請重新執行初始設定以鑄造新的配額。',
  },
  msgDone: {
    en: 'All three steps completed. Every transaction is verifiable on Solscan.',
    zh: '三個步驟全部完成。每筆交易皆可在 Solscan 驗證。',
  },
  msgComp: {
    en: 'A step failed. Completed steps were compensated automatically — each compensation is a real on-chain transaction.',
    zh: '有步驟失敗。已完成的步驟已自動補償——每筆補償都是真實的鏈上交易。',
  },
  msgBad: {
    en: 'A step failed and compensation did not complete. Manual intervention required.',
    zh: '有步驟失敗且補償未完成。需要人工介入。',
  },
  msgUnexpected: { en: 'Unexpected error: ', zh: '未預期的錯誤：' },
  vTitle: { en: 'TOKEN ACCOUNTS', zh: '代幣帳戶' },
  vIntro: {
    en: (amount) => 'Real SPL token accounts on Solana devnet. Balances update after every run. Each flow moves ' + amount + ' tokens.',
    zh: (amount) => 'Solana devnet 上的真實 SPL 代幣帳戶。每次執行後餘額都會更新。每次流程移動 ' + amount + ' 枚代幣。',
  },
  vMint: { en: 'Mint', zh: 'Mint' },
  vOwner: { en: 'Your account', zh: '您的帳戶' },
  vEscrow: { en: 'Escrow', zh: '託管帳戶' },
  vRecipient: { en: 'Recipient', zh: '接收帳戶' },
  vView: { en: 'VIEW', zh: '查看' },
  txExecuted: { en: 'EXECUTED', zh: '已執行' },
  txCompensated: { en: 'COMPENSATED', zh: '已補償' },
  txVerify: { en: 'VERIFY', zh: '驗證' },
  outOkStrong: { en: 'FLOW COMPLETED', zh: '流程完成' },
  outOk: { en: ' — all three steps executed successfully.', zh: '——三個步驟全部成功執行。' },
  outCompStrong: { en: 'FAILED AND COMPENSATED', zh: '失敗並已補償' },
  outComp: {
    en: ' — a step failed; every completed step was compensated by a real on-chain transaction, in reverse order. The final state matches the starting state. The transaction history does not disappear, and it should not: it is the audit trail.',
    zh: '——有步驟失敗；每個已完成的步驟都以真實的鏈上交易逆序補償。最終狀態與起始狀態一致。交易歷史不會消失，也不應消失：它就是稽核軌跡。',
  },
  outBadStrong: { en: 'COMPENSATION INCOMPLETE', zh: '補償未完成' },
  outBad: {
    en: ' — a compensating transaction did not confirm. Manual intervention is required. This state is surfaced rather than hidden.',
    zh: '——某筆補償交易未確認。需要人工介入。此狀態被如實呈現，而非隱藏。',
  },
  disclaimer: {
    en: 'Devnet is a public test network. Tokens on Devnet have no monetary value. The escrow account in this demonstration is held by a keypair generated in the browser — sufficient to show funds genuinely leaving and returning, but not a trustless escrow. A production version would use a program-derived address. This demonstration does not constitute an offer to sell or a solicitation to buy any security or digital asset.',
    zh: 'Devnet 為公開測試網路，其上代幣不具任何金錢價值。本演示中的託管帳戶由瀏覽器內產生的金鑰對持有——足以展示資金真實地離開與返回，但並非去信任託管。正式版本將使用程式衍生地址（PDA）。本演示不構成出售任何證券或數位資產的要約，亦不構成購買的要約邀請。',
  },
}

export default function FlowPage() {
  const { lang, isZh } = useLang()
  const L = (obj) => (obj && (obj[lang] || obj.en)) || ''

  // Chinese overlay for step names/descriptions coming from lib/steps.js.
  // Keyed on the English strings so no lib file needs to change.
  // Unknown strings fall back to English automatically.
  const STEP_LABEL_ZH = {
    'APPROVE': '審批',
    'VESTING SETUP': '歸屬設定',
    'DISTRIBUTION': '分發',
  }
  const STEP_DESC_ZH = {
    'RECORD AN ON-CHAIN APPROVAL FOR THIS OPERATION.': '為本次操作在鏈上記錄一筆審批。',
    'MOVE THE ALLOCATION INTO THE ESCROW ACCOUNT. REAL SPL TOKEN TRANSFER.': '將分配額移入託管帳戶。真實的 SPL 代幣轉帳。',
    'RELEASE THE ALLOCATION TO THE RECIPIENT. REAL SPL TOKEN TRANSFER.': '將分配額釋出給接收方。真實的 SPL 代幣轉帳。',
  }
  const zhStepLabel = (t) => (isZh && t && STEP_LABEL_ZH[String(t).trim().toUpperCase()]) || t
  const zhStepDesc = (t) => (isZh && t && STEP_DESC_ZH[String(t).trim().toUpperCase()]) || t
  const LF = (obj) => (obj && (obj[lang] || obj.en))

  const [wallet, setWallet] = useState(null)
  const [busy, setBusy] = useState(false)
  const [steps, setSteps] = useState(initSteps(STEPS))
  const [flowState, setFlowState] = useState(FLOW_STATE.IDLE)
  const [howOpen, setHowOpen] = useState(true)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setHowOpen(false)
  }, [])
  const [flowId, setFlowId] = useState(null)
  const [failAt, setFailAt] = useState(0)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [accounts, setAccounts] = useState(null)
  const [setupSigs, setSetupSigs] = useState([])
  const [balances, setBalances] = useState(null)
  const [runHistory, setRunHistory] = useState([])

  function getProvider() {
    if (typeof window === 'undefined') return null
    if (window.phantom && window.phantom.solana && window.phantom.solana.isPhantom) {
      return window.phantom.solana
    }
    if (window.solana && window.solana.isPhantom) return window.solana
    return null
  }

  function say(text, error) {
    setMessage(text)
    setIsError(Boolean(error))
  }

  async function connect() {
    const provider = getProvider()
    if (!provider) {
      say(L(T3.msgNoPhantom), true)
      return
    }
    try {
      const res = await provider.connect()
      setWallet(res.publicKey.toString())
      say(L(T3.msgConnected), false)
    } catch (e) {
      say(L(T3.msgCancelled), true)
    }
  }

  async function disconnect() {
    const provider = getProvider()
    if (provider) { try { await provider.disconnect() } catch (e) {} }
    setWallet(null)
    setAccounts(null)
    setSetupSigs([])
    setBalances(null)
    reset()
  }

  // Read all three account balances and return a snapshot
  async function snapshotBalances(acc) {
    if (!acc) return null
    try {
      const web3 = await import('@solana/web3.js')
      const connection = new web3.Connection(RPC, 'confirmed')
      const [a, b, c] = await Promise.all([
        readBalance(web3, connection, acc.ownerAta),
        readBalance(web3, connection, acc.escrowAta),
        readBalance(web3, connection, acc.recipientAta),
      ])
      return { owner: a, escrow: b, recipient: c }
    } catch (e) {
      return null
    }
  }

  // Export every run in this session as a text file - no copying signatures by hand.
  // The log itself stays in English: it is a technical verification artifact
  // (signatures, Solscan, step IDs) shared with developers and reviewers.
  function exportLog() {
    if (runHistory.length === 0) return

    const L2 = []
    L2.push('COSMOS Flow v2 — Run Log')
    L2.push('Network: Solana devnet')
    L2.push('Wallet: ' + wallet)
    if (accounts) {
      L2.push('Mint: ' + accounts.mint)
      L2.push('Owner account: ' + accounts.ownerAta)
      L2.push('Escrow account: ' + accounts.escrowAta)
      L2.push('Recipient account: ' + accounts.recipientAta)
    }
    L2.push('Exported: ' + new Date().toISOString())
    L2.push('')

    runHistory.forEach((r) => {
      L2.push('---')
      L2.push('Run ' + String(r.run).padStart(2, '0') + ' | ' + r.time + ' | ' + r.injection)
      L2.push('Flow ID: ' + r.flowId)
      L2.push('Result: ' + r.outcome)
      if (r.balancesBefore) {
        L2.push('Before: owner ' + r.balancesBefore.owner +
               ' / escrow ' + r.balancesBefore.escrow +
               ' / recipient ' + r.balancesBefore.recipient)
      }
      if (r.balancesAfter) {
        L2.push('After:  owner ' + r.balancesAfter.owner +
               ' / escrow ' + r.balancesAfter.escrow +
               ' / recipient ' + r.balancesAfter.recipient +
               (r.balanceReturned ? '   <- returned to start' : ''))
      }
      r.steps.forEach((st, i) => {
        if (st.executed) L2.push('  Step ' + (i + 1) + ' executed:    ' + st.executed)
        if (st.compensated) L2.push('  Step ' + (i + 1) + ' compensated: ' + st.compensated)
        if (!st.executed && !st.compensated) L2.push('  Step ' + (i + 1) + ': ' + st.status)
      })
      L2.push('')
    })

    const total = runHistory.length
    const done = runHistory.filter((r) => r.outcome === FLOW_STATE.COMPLETED).length
    const comp = runHistory.filter((r) => r.outcome === FLOW_STATE.FAILED_COMPENSATED).length
    const bad = runHistory.filter((r) => r.outcome === FLOW_STATE.FAILED_INCOMPLETE).length
    const txs = runHistory.reduce((n, r) =>
      n + r.steps.filter((st) => st.executed).length +
          r.steps.filter((st) => st.compensated).length, 0)
    const kept = runHistory.filter((r) => r.balanceReturned === true).length
    const checked = runHistory.filter((r) => r.balanceReturned !== null).length

    L2.push('========================================')
    L2.push('SUMMARY')
    L2.push('Total runs:                  ' + total)
    L2.push('Completed successfully:      ' + done)
    L2.push('Failed and compensated:      ' + comp)
    L2.push('Compensation failures:       ' + bad)
    L2.push('Total on-chain transactions: ' + txs)
    L2.push('Balance integrity:           ' + kept + '/' + checked + ' runs matched the expected state')
    L2.push('========================================')

    const blob = new Blob([L2.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cosmos-flow-run-log-' + new Date().toISOString().slice(0, 10) + '.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function refreshBalances(acc) {
    if (!acc) return
    try {
      const web3 = await import('@solana/web3.js')
      const connection = new web3.Connection(RPC, 'confirmed')
      const [a, b, c] = await Promise.all([
        readBalance(web3, connection, acc.ownerAta),
        readBalance(web3, connection, acc.escrowAta),
        readBalance(web3, connection, acc.recipientAta),
      ])
      setBalances({ owner: a, escrow: b, recipient: c })
    } catch (e) {
      setBalances(null)
    }
  }

  async function doSetup() {
    const provider = getProvider()
    if (!provider || !wallet) { say(L(T3.msgConnectFirst), true); return }

    setBusy(true)
    say(L(T3.msgCreating), false)

    try {
      const web3 = await import('@solana/web3.js')
      const spl = await import('@solana/spl-token')
      const connection = new web3.Connection(RPC, 'confirmed')
      const owner = new web3.PublicKey(wallet)

      const balance = await connection.getBalance(owner)
      if (balance < 20000000) {
        say(L(T3.msgNoSolSetup), true)
        setBusy(false)
        return
      }

      const acc = await runSetup({
        web3, spl, connection, provider, owner,
        onNotice: (m) => say(m, false),
      })
      setAccounts(acc)
      setSetupSigs(acc.signatures)
      await refreshBalances(acc)
      say(LF(T3.msgSetupDone)(INITIAL_SUPPLY), false)
    } catch (e) {
      console.error('SETUP ERROR — full object:', e)
      console.error('SETUP ERROR — message:', e && e.message)
      console.error('SETUP ERROR — logs:', e && e.logs)
      say(L(T3.msgSetupFailed) + (e && e.message ? e.message : readableError(e)), true)
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setSteps(initSteps(STEPS))
    setFlowState(FLOW_STATE.IDLE)
    setFlowId(null)
    say('', false)
  }

  async function start() {
    const provider = getProvider()
    if (!provider || !wallet) { say(L(T3.msgConnectFirst), true); return }
    if (!accounts) { say(L(T3.msgSetupFirst), true); return }

    setBusy(true)
    reset()

    const id = newFlowId()
    setFlowId(id)
    say(L(T3.msgRunning), false)

    try {
      const web3 = await import('@solana/web3.js')
      const spl = await import('@solana/spl-token')
      const connection = new web3.Connection(RPC, 'confirmed')
      const pubkey = new web3.PublicKey(wallet)

      const balance = await connection.getBalance(pubkey)
      if (balance < 5000000) {
        say(L(T3.msgNoSolFees), true)
        setBusy(false)
        return
      }

      // Check the token balance before transferring: stop early rather than
      // failing at step two and wasting fees
      const before = await snapshotBalances(accounts)
      if (before && Number(before.owner) < FLOW_AMOUNT) {
        say(LF(T3.msgLowTokens)(before.owner, FLOW_AMOUNT), true)
        setBusy(false)
        return
      }

      const result = await runFlow({
        web3,
        connection,
        provider,
        pubkey,
        stepDefs: STEPS,
        ctx: { flowId: id, amount: FLOW_AMOUNT, accounts, spl },
        onNotice: (m) => say(m, false),
        failAt,
        onUpdate: (s, fs) => { setSteps(s); setFlowState(fs) },
      })

      const after = await snapshotBalances(accounts)
      setBalances(after)

      setRunHistory((h) => h.concat([{
        run: h.length + 1,
        flowId: id,
        time: new Date().toISOString(),
        injection: failAt === 0 ? 'NONE' : 'FAIL AT ' + failAt,
        outcome: result.flowState,
        balancesBefore: before,
        balancesAfter: after,
        balanceReturned: before && after
          ? (before.owner === after.owner &&
             before.escrow === after.escrow &&
             before.recipient === after.recipient)
          : null,
        steps: result.steps.map((st) => ({
          id: st.id,
          label: st.label,
          status: st.status,
          executed: st.signature || null,
          compensated: st.compensationSignature || null,
        })),
      }]))

      if (result.flowState === FLOW_STATE.COMPLETED) {
        say(L(T3.msgDone), false)
      } else if (result.flowState === FLOW_STATE.FAILED_COMPENSATED) {
        say(L(T3.msgComp), false)
      } else {
        say(L(T3.msgBad), true)
      }
    } catch (e) {
      say(L(T3.msgUnexpected) + readableError(e), true)
      setFlowState(FLOW_STATE.IDLE)
    } finally {
      setBusy(false)
    }
  }

  const short = wallet ? wallet.slice(0, 4) + '...' + wallet.slice(-4) : ''
  const txUrl = (sig) => EXPLORER + '/tx/' + sig + '?cluster=' + CLUSTER

  return (
    <>
      <Head>
        <title>{L(T3.metaTitle)}</title>
        <meta name="description" content={L(T3.metaDesc)} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000005" />
        <link rel="canonical" href="https://cosmosledgerlabs.com/flow" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      <Nav />

      <main className={styles.page}>
        <div className={styles.container}>

          <header className={styles.header}>
            <div className={styles.badge}>SOLANA DEVNET</div>
            <h1 className={styles.title}>{L(T3.title)}</h1>
            <p className={styles.subtitle}>{L(T3.sub1)}</p>
            <p className={styles.subtitle}>{L(T3.sub2)}</p>
            <p className={styles.subtitle}>{L(T3.sub3)}</p>
          </header>

          {/* ---------- demo video ---------- */}
          {VIDEO_URL ? (
            <a
              className={styles.videoLink}
              href={VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.videoPlay}>▶</span>
              <span className={styles.videoLabel}>{L(T3.videoWatch)}</span>
              <span className={styles.videoNote}>{L(T3.videoOpens)}</span>
            </a>
          ) : (
            <div className={styles.videoPlaceholder}>
              <span className={styles.videoPlay}>▶</span>
              <span className={styles.videoLabel}>{L(T3.videoSoon)}</span>
              <span className={styles.videoNote}>{L(T3.videoSoonNote)}</span>
            </div>
          )}

          {/* ---------- how to use ---------- */}
          <section className={styles.panel}>
            <button type="button" className={styles.howToggle} onClick={() => setHowOpen(!howOpen)}>
              {L(howOpen ? T3.howHide : T3.howShow)}
            </button>
            {howOpen ? (<>
            <div className={styles.howTitle}>{L(T3.howTitle)}</div>
            <ol className={styles.howList}>
              <li>{L(T3.how1)}</li>
              <li>{L(T3.how2)}</li>
              <li>{L(T3.how3)}</li>
              <li>{L(T3.how4)}</li>
              <li>{L(T3.how5)}</li>
              <li>{L(T3.how6)}</li>
              <li>{L(T3.how7)}</li>
              <li>{L(T3.how8)}</li>
            </ol>
            <div className={styles.howNote}>{L(T3.howNote)}</div>
            </>) : null}
          </section>

          {/* ---------- controls ---------- */}
          <section className={styles.panel}>
            <div className={styles.controlRow}>
              <div className={styles.controlLabel}>{L(T3.ctlWallet)}</div>
              <div className={styles.controlBody}>
                {wallet ? (
                  <button className={styles.btnGhost} onClick={disconnect}>{short}</button>
                ) : (
                  <button className={styles.btn} onClick={connect}>{L(T3.btnConnect)}</button>
                )}
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.controlRow}>
              <div className={styles.controlLabel}>{L(T3.ctlSetup)}</div>
              <div className={styles.controlBody}>
                {accounts ? (
                  <button className={styles.btnGhost} onClick={doSetup} disabled={busy}>
                    {L(T3.btnResetup)}
                  </button>
                ) : (
                  <button className={styles.btn} onClick={doSetup} disabled={!wallet || busy}>
                    {L(T3.btnSetup)}
                  </button>
                )}
                <div className={styles.controlHint}>
                  {LF(T3.setupHint)(INITIAL_SUPPLY)}
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.controlRow}>
              <div className={styles.controlLabel}>{L(T3.ctlInjection)}</div>
              <div className={styles.controlBody}>
                <div className={styles.segmented}>
                  {[0, 1, 2, 3].map((v) => (
                    <button
                      key={v}
                      className={failAt === v ? styles.segOn : styles.segOff}
                      onClick={() => setFailAt(v)}
                      disabled={busy}
                    >
                      {v === 0 ? L(T3.injNone) : LF(T3.injAt)(v)}
                    </button>
                  ))}
                </div>
                <div className={styles.controlHint}>{L(T3.injHint)}</div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.controlRow}>
              <div className={styles.controlLabel}>{L(T3.ctlRun)}</div>
              <div className={styles.controlBody}>
                <button
                  className={styles.btn}
                  onClick={start}
                  disabled={!wallet || busy}
                >
                  {busy ? L(T3.btnRunning) : L(T3.btnExecute)}
                </button>
                {flowId ? (
                  <div className={styles.controlHint}>{L(T3.flowIdLabel)}{flowId}</div>
                ) : null}
              </div>
            </div>

            {runHistory.length > 0 ? (
              <>
                <div className={styles.divider} />
                <div className={styles.controlRow}>
                  <div className={styles.controlLabel}>{L(T3.ctlLog)}</div>
                  <div className={styles.controlBody}>
                    <button className={styles.btnGhost} onClick={exportLog} disabled={busy}>
                      {L(T3.btnLog)} ({runHistory.length})
                    </button>
                    <div className={styles.controlHint}>{L(T3.logHint)}</div>
                  </div>
                </div>
              </>
            ) : null}

            {message ? (
              <div className={isError ? styles.msgError : styles.msgOk}>{message}</div>
            ) : null}
          </section>

          {/* ---------- accounts and balances ---------- */}
          {accounts ? (
            <section className={styles.verify}>
              <h2 className={styles.verifyTitle}>{L(T3.vTitle)}</h2>
              <p className={styles.verifyIntro}>{LF(T3.vIntro)(FLOW_AMOUNT)}</p>

              <div className={styles.verifyRow}>
                <span className={styles.verifyKey}>{L(T3.vMint)}</span>
                <span className={styles.verifyVal}>{accounts.mint}</span>
                <a className={styles.verifyBtn}
                   href={EXPLORER + '/token/' + accounts.mint + '?cluster=' + CLUSTER}
                   target="_blank" rel="noopener noreferrer">{L(T3.vView)}</a>
              </div>

              <div className={styles.verifyRow}>
                <span className={styles.verifyKey}>
                  {L(T3.vOwner)}{balances ? ' — ' + balances.owner : ''}
                </span>
                <span className={styles.verifyVal}>{accounts.ownerAta}</span>
                <a className={styles.verifyBtn}
                   href={EXPLORER + '/account/' + accounts.ownerAta + '?cluster=' + CLUSTER}
                   target="_blank" rel="noopener noreferrer">{L(T3.vView)}</a>
              </div>

              <div className={styles.verifyRow}>
                <span className={styles.verifyKey}>
                  {L(T3.vEscrow)}{balances ? ' — ' + balances.escrow : ''}
                </span>
                <span className={styles.verifyVal}>{accounts.escrowAta}</span>
                <a className={styles.verifyBtn}
                   href={EXPLORER + '/account/' + accounts.escrowAta + '?cluster=' + CLUSTER}
                   target="_blank" rel="noopener noreferrer">{L(T3.vView)}</a>
              </div>

              <div className={styles.verifyRow}>
                <span className={styles.verifyKey}>
                  {L(T3.vRecipient)}{balances ? ' — ' + balances.recipient : ''}
                </span>
                <span className={styles.verifyVal}>{accounts.recipientAta}</span>
                <a className={styles.verifyBtn}
                   href={EXPLORER + '/account/' + accounts.recipientAta + '?cluster=' + CLUSTER}
                   target="_blank" rel="noopener noreferrer">{L(T3.vView)}</a>
              </div>

              {setupSigs.map((s2) => (
                <div key={s2.signature} className={styles.verifyRow}>
                  <span className={styles.verifyKey}>{s2.label}</span>
                  <span className={styles.verifyVal}>{s2.signature}</span>
                  <a className={styles.verifyBtn} href={txUrl(s2.signature)}
                     target="_blank" rel="noopener noreferrer">{L(T3.vView)}</a>
                </div>
              ))}
            </section>
          ) : null}

          {/* ---------- steps ---------- */}
          <section className={styles.steps}>
            {steps.map((s, i) => (
              <div key={s.id} className={`${styles.step} ${styles[STATUS_CLASS[s.status]]}`}>
                <div className={styles.stepHead}>
                  <span className={styles.stepIndex}>{'0' + (i + 1)}</span>
                  <span className={styles.stepName}>{zhStepLabel(s.label)}</span>
                  <span className={styles.stepStatus}>{L(STATUS_LABEL[s.status])}</span>
                </div>

                <div className={styles.stepDesc}>{zhStepDesc(s.description)}</div>

                {s.signature ? (
                  <div className={styles.txRow}>
                    <span className={styles.txLabel}>{L(T3.txExecuted)}</span>
                    <span className={styles.txHash}>{s.signature}</span>
                    <a className={styles.txLink} href={txUrl(s.signature)} target="_blank" rel="noopener noreferrer">{L(T3.txVerify)}</a>
                  </div>
                ) : null}

                {s.compensationSignature ? (
                  <div className={styles.txRow}>
                    <span className={styles.txLabelComp}>{L(T3.txCompensated)}</span>
                    <span className={styles.txHash}>{s.compensationSignature}</span>
                    <a className={styles.txLink} href={txUrl(s.compensationSignature)} target="_blank" rel="noopener noreferrer">{L(T3.txVerify)}</a>
                  </div>
                ) : null}

                {s.error ? (
                  <div className={styles.stepError}>{s.error}</div>
                ) : null}
              </div>
            ))}
          </section>

          {/* ---------- outcome ---------- */}
          {flowState === FLOW_STATE.COMPLETED ? (
            <div className={styles.outcomeOk}>
              <strong>{L(T3.outOkStrong)}</strong>{L(T3.outOk)}
            </div>
          ) : null}

          {flowState === FLOW_STATE.FAILED_COMPENSATED ? (
            <div className={styles.outcomeComp}>
              <strong>{L(T3.outCompStrong)}</strong>{L(T3.outComp)}
            </div>
          ) : null}

          {flowState === FLOW_STATE.FAILED_INCOMPLETE ? (
            <div className={styles.outcomeBad}>
              <strong>{L(T3.outBadStrong)}</strong>{L(T3.outBad)}
            </div>
          ) : null}

          <p className={styles.disclaimer}>{L(T3.disclaimer)}</p>

        </div>
      </main>

      <Footer />
    </>
  )
}
