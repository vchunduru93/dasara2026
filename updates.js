// What's new on the site, newest first (dates are when each day's last change went live).
// The footers show the newest one as "Last updated".
window.UPDATES = [
  {
    date: '2026-10-18T09:41:00-07:00',
    title: 'Finer scroll control and more photos',
    items: [
      'The puja page header now shows each day’s thithi next to the date.',
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

// Fill any "Last updated" footer link on the page
document.querySelectorAll('[data-last-updated]').forEach(el => { el.textContent = formatUpdateDate(UPDATES[0].date); });
