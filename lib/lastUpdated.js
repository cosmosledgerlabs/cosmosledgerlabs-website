/* lib/lastUpdated.js
 *
 * "Last updated" dates for the legal pages (privacy, disclaimer, payment).
 *
 * Each page's date is the date of the last GitHub commit that changed THAT
 * page's own file. Changing the video, the services page or any other file
 * does not move a legal page's date.
 *
 * The date is looked up once, when Vercel builds the site (every commit
 * triggers a new build). Visitors' browsers never contact GitHub.
 *
 * If GitHub cannot be reached, is slow, or refuses the request, the page
 * shows the typed-in fallback date instead. The page never breaks and never
 * shows a blank date.
 *
 * Optional: if a GITHUB_TOKEN environment variable is set in Vercel, it is
 * used for the lookup (higher GitHub request limit). Not required, because
 * the repository is public.
 */

const REPO = 'cosmosledgerlabs/cosmosledgerlabs-website'
const BRANCH = 'main'

export async function lastUpdated(filePath, fallback) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'cosmosledgerlabs-website-build',
    }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    const url = `https://api.github.com/repos/${REPO}/commits?sha=${BRANCH}&path=${encodeURIComponent(filePath)}&per_page=1`
    const res = await fetch(url, { headers, signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return fallback

    const data = await res.json()
    const iso = data && data[0] && data[0].commit && data[0].commit.committer && data[0].commit.committer.date
    if (!iso) return fallback

    // Shown as YYYY-MM-DD in Toronto time, matching the existing format.
    const date = new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallback
  } catch (e) {
    return fallback
  }
}
