/* lib/payDetails.js (added 2026-11-13) — SERVER ONLY.
   Bank wire details. Moved out of pages/pay.js so they are no longer in
   the JavaScript every visitor's browser downloads: /api/orders sends them
   back only after a wire order has been saved, which matches the Payment
   page ("payment details are not displayed publicly on this website").

   Note: the GitHub repository is public, so anything in this file can
   still be read there. To keep the account number out of GitHub too, make
   the repository private (or ask for the details to be moved into Vercel
   environment variables). */

export const WIRE = [
  { k: { en: 'Beneficiary', zh: '收款人' }, v: 'COSMOS LEDGER LABS INC.', copy: true },
  { k: { en: 'Beneficiary address', zh: '收款人地址' }, v: 'Suite 1400, 18 King St E, Toronto, ON M5C 1C4, Canada', copy: true },
  { k: { en: 'Bank', zh: '銀行' }, v: 'Royal Bank of Canada' },
  { k: { en: 'Bank address', zh: '銀行地址' }, v: '101 Dundas St W, Toronto, ON M5G 1C4, Canada', copy: true },
  { k: { en: 'Institution number', zh: '銀行代號' }, v: '003', copy: true },
  { k: { en: 'Transit number', zh: '分行代號' }, v: '02146', copy: true },
  { k: { en: 'Account number', zh: '帳號' }, v: '100-104-9', copy: true },
  { k: { en: 'SWIFT / BIC (international)', zh: 'SWIFT / BIC（國際匯款）' }, v: 'ROYCCAT2', copy: true },
]
