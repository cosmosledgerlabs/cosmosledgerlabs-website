/* Email links (2026-09-21).
   Every place the site shows the company email address, tapping or clicking it
   opens the visitor's email app with the address already filled in (mailto:).
   The address keeps the look of the text around it. */
export const MAIL = 'info@cosmosledgerlabs.com'
export const MAILTO = 'mailto:' + MAIL

const MAIL_SPLIT = /(info@cosmosledgerlabs\.com)/

export function MailLink({ className, children }) {
  return (
    <a href={MAILTO} className={className ? `mail-link ${className}` : 'mail-link'}>
      {children || MAIL}
    </a>
  )
}

/* Turns every email address inside a piece of text into an email link.
   Text without the address is returned unchanged. */
export function linkMail(text) {
  if (typeof text !== 'string' || text.indexOf(MAIL) === -1) return text
  return text.split(MAIL_SPLIT).map((part, i) =>
    part === MAIL ? <MailLink key={i} /> : part
  )
}
