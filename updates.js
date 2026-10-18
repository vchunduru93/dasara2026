// What's new on the site, newest first (dates are when each day's last change went live).
// The footers show the newest one as "Last updated".
window.UPDATES = [
  {
    date: '2026-10-18T16:55:00-07:00',
    title: 'Gallery and full-screen reading',
    items: [
      'New Gallery page: every day’s photo album and reel in one place. Tap a day’s name to open it on the home page.',
      'The home page opens with the Gallery, the Zoom details and the 10-day schedule all on the first screen.',
      'Page titles stay at the top as you scroll.',
      'Full screen in the puja and bhajan pages: tap ⛶ to hide everything but the text, with a big ▶ button to start and pause auto scroll.',
      'Language is now the 🌐 button in the toolbar, and the first time you open a puja you’re asked to pick your language.'
    ]
  },
  {
    date: '2026-10-18T16:22:00-07:00',
    title: 'Finer scroll control and more photos',
    items: [
      'Every step of the Ganapati and Devi pujas now has a short, simple note on what to do, in every language.',
      'Coconut water (nārikēḷa jalaṃ) added to the abhishekam in Devi Puja Part 1.',
      'ગુજરાતી: the whole site can now be read in Gujarati, our eighth language.',
      'Tap the Zoom meeting ID or passcode on the home page to copy it.',
      'The puja page header now shows each day’s thithi next to the date.',
      'Easier pickers: language, step, section and bhajan lists open as a big, tappable menu.',
      'The ♫ button on the puja page opens a quick list to jump straight to any bhajan.',
      'A small blue dot next to “Last updated” means there’s something new you haven’t seen yet.',
      'This Updates page: tap “Last updated” at the bottom of any page to see what’s new.',
      'Auto-scroll speed now runs from 0.25x to 2x in small steps, with − and + buttons beside both sliders for exact adjustments.',
      'New ashtottarams for Day 9 (Mahishasura Mardini) and Day 10 (Raja Rajeswari) in every language, courtesy of Stotra Nidhi.',
      'Name, verse and stanza numbers now sit quietly at the right edge, so the text itself reads cleanly.',
      'Day 6 and Day 7 photo albums and reels are on the home page.',
      'Khadgamala no longer includes “garimāsiddhē”, matching how we chant it together.',
      'Easier-to-read lines in Jay Ambe Gauri and Ambe Tu Hai.'
    ]
  },
  {
    date: '2026-10-17T23:21:00-07:00',
    title: 'Hands-free reading',
    items: [
      'Auto scroll: tap ▶ and the text moves on its own, keeping the screen awake. Rest a finger on the screen to pause.',
      'Text-size slider that shows the exact reading size.',
      'Reader pages use the full screen width, and the toolbar tucks away with the small tab at the right.',
      'Repeated chorus lines appear as a short ↻ cue instead of being written out every time.',
      'Section headings in Khadgamala, and Kumari Puja shlokas for each day.',
      'New bhajans: Amba Shankari Parameshwari, Aaragimpavamma, Sri Lalitha Sivajyothi and Hey Sharde Maa.',
      'Today’s day is centered in the home page schedule.'
    ]
  },
  {
    date: '2026-10-16T18:57:00-07:00',
    title: 'The puja reader',
    items: [
      'Step-by-step puja reader: every chant for the day, one step at a time, with Next and Back (arrow keys work on a keyboard).',
      'A Bhajans page with every bhajan in one place.',
      'Read in English, Telugu, Hindi, Kannada, Tamil, Malayalam or Bengali.',
      'Add the site to your phone’s home screen; pages you’ve opened also work offline.',
      'Daily Alankaram photos and reels, and a Join our Community button for the WhatsApp group.',
      'Om Jai Lakshmi Mata Aarti added; larger, easier-to-tap buttons throughout.'
    ]
  },
  {
    date: '2026-10-14T21:38:00-07:00',
    title: 'Puja Vidhanam and daily colors',
    items: [
      'Each day shows its dress color.',
      'Ganapati Puja, Devi Puja and Kumari Puja guides.',
      'Jay Ambe Gauri and Ambe Tu Hai Jagdambe aartis.'
    ]
  },
  {
    date: '2026-10-12T20:40:00-07:00',
    title: 'Bhajans and Zoom',
    items: [
      'A Common Bhajans list on the home page.',
      'Sri Suktam, Manthrapushpam and Devi Kumari Puja added to the daily order.',
      'A Zoom panel for joining from afar.'
    ]
  },
  {
    date: '2026-10-07T21:23:00-07:00',
    title: 'Site launched',
    items: ['The Sri Devi Navaratri 2026 schedule and invitation went live.']
  }
];

// "Oct 18, 2026, 9:25 AM" in the reader's own time zone
function formatUpdateDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// Fill any "Last updated" footer link on the page, with a small dot when there's news this reader hasn't opened
(() => {
  const latest = UPDATES[0].date;
  let seen = null;
  try { seen = localStorage.getItem('updatesSeen'); } catch (e) {}
  const onUpdatesPage = /updates\.html$/.test(location.pathname);
  if (onUpdatesPage) { try { localStorage.setItem('updatesSeen', latest); } catch (e) {} }
  const unseen = !onUpdatesPage && (!seen || new Date(seen) < new Date(latest));
  document.querySelectorAll('[data-last-updated]').forEach(el => {
    el.textContent = formatUpdateDate(latest);
    const link = el.closest('a');
    if (unseen && link) {
      link.insertAdjacentHTML('afterend', '<span class="inline-block align-top ml-1 w-1.5 h-1.5 rounded-full bg-sky-400" role="img" aria-label="New updates" title="New updates"></span>');
    }
  });
})();
