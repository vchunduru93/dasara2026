// The 10-day schedule, shared by the home page and the gallery.
// Each day's thumbnails live in assets/memories/dayN-album.jpg and dayN-reel.jpg: 600x800 (3:4),
// plus a small copy of each in assets/memories/small/ (see sharpenThumbs below).
// For the album, use a full-setup shot (garland arch at the top, deity and puja items below), not a close-up,
// so every day looks the same in the gallery strip.
const scheduleData = {
  event: {
    startDate: "2026-10-11",
    endDate: "2026-10-20"
  },
  days: [
    {
      dayNumber: 1,
      memories: { album: "https://photos.app.goo.gl/KEYM3g8KTthJG2oZ6", reel: "https://www.instagram.com/reel/DeYmcxVumi7/" },
      dressColor: { name: "Yellow", hex: "#FACC15" },
      date: "2026-10-11",
      dayOfWeek: "Sunday",
      thithi: "Prathama",
      alankaram: "Sri Bala Tripura Sundari Devi"
    },
    {
      dayNumber: 2,
      memories: { album: "https://photos.app.goo.gl/LGKw2Y5GTy4FDHNZ8", reel: "https://www.instagram.com/reel/DebFctcu2oi/" },
      dressColor: { name: "Peach", hex: "#FB9E7A" },
      date: "2026-10-12",
      dayOfWeek: "Monday",
      thithi: "Dvitiya",
      alankaram: "Sri Gayatri Devi"
    },
    {
      dayNumber: 3,
      memories: { album: "https://photos.app.goo.gl/D9JwZYXbunUXhPHA8", reel: "https://www.instagram.com/reel/DedsizRu6sI/" },
      dressColor: { name: "Blue", hex: "#1D4ED8" },
      date: "2026-10-13",
      dayOfWeek: "Tuesday",
      thithi: "Tritiya",
      alankaram: "Sri Annapurna Devi"
    },
    {
      dayNumber: 4,
      memories: { album: "https://photos.app.goo.gl/SAK5kvjLux6tYKXR9", reel: "https://www.instagram.com/reel/DegP_9zuHW5/" },
      dressColor: { name: "Green", hex: "#15803D" },
      date: "2026-10-14",
      dayOfWeek: "Wednesday",
      thithi: "Chathurthi",
      alankaram: "Sri Meenakshi Devi"
    },
    {
      dayNumber: 5,
      memories: { album: "https://photos.app.goo.gl/JmLnEmCiFRbNZpyg6", reel: "https://www.instagram.com/reel/DeiyeORucCJ/" },
      dressColor: { name: "Red", hex: "#C81E1E" },
      date: "2026-10-15",
      dayOfWeek: "Thursday",
      thithi: "Panchami",
      alankaram: "Sri Lalita Devi"
    },
    {
      dayNumber: 6,
      dressColor: { name: "Pink", hex: "#EC4899" },
      date: "2026-10-16",
      dayOfWeek: "Friday",
      thithi: "Shashti",
      alankaram: "Sri Maha Lakshmi Devi",
      memories: { album: "https://photos.app.goo.gl/RQhuDd5fgnUxB8y7A", reel: "https://www.instagram.com/reel/DellfyJuzY9/" }
    },
    {
      dayNumber: 7,
      dressColor: { name: "White", hex: "#FFFFFF" },
      date: "2026-10-17",
      dayOfWeek: "Saturday",
      thithi: "Saptami",
      alankaram: "Sri Saraswati Devi",
      memories: { album: "https://photos.google.com/share/AF1QipPMdWzecrtoKRxFRoJ8VVzW0L4bIhX6Pqui5-alg_3Id9yaDcBz8VxyXn4w2UGf7Q?key=OTRfWHg3RGxyUTVhU2tFT3NrelEzS0EteS1FWGJR", reel: "https://www.instagram.com/p/DeoFwQvmyLG/" }
    },
    {
      dayNumber: 8,
      dressColor: { name: "Orange", hex: "#EA580C" },
      date: "2026-10-18",
      dayOfWeek: "Sunday",
      thithi: "Durgashtami",
      alankaram: "Sri Durga Devi",
      memories: { album: "https://photos.app.goo.gl/YVJJgYbfi89LfTj4A", reel: "https://www.instagram.com/reel/Deqj_BIu3-p/" }
    },
    {
      dayNumber: 9,
      dressColor: { name: "Purple", hex: "#7E22CE" },
      date: "2026-10-19",
      dayOfWeek: "Monday",
      thithi: "Maharnavami",
      alankaram: "Sri Mahishasura Mardini Devi"
    },
    {
      dayNumber: 10,
      dressColor: { name: "Gold", hex: "#B8860B" },
      date: "2026-10-20",
      dayOfWeek: "Tuesday",
      thithi: "Vijaya Dasami",
      alankaram: "Sri Raja Rajeswari Devi"
    }
  ]
};

// Line icons used in place of emoji, drawn like the site's button icons (outlined, in the text color).
const ICON_PATHS = {
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.5"/>',
  reel: '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  flower: '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/>',
  star: '<path d="M12 2.8l2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93z"/>',
  namaste: '<path d="M11.4 3.2c-.9-.3-1.7.3-1.9 1.2L8.3 10 5 14l3.5 4.5 3.5-2.5V4.5c0-.6-.2-1.1-.6-1.3z"/><path d="M12.6 3.2c.9-.3 1.7.3 1.9 1.2L15.7 10 19 14l-3.5 4.5-3.5-2.5V4.5c0-.6.2-1.1.6-1.3z"/><path d="M5 14l-2 2 4 5 1.5-2.5"/><path d="M19 14l2 2-4 5-1.5-2.5"/>',
};
function icon(name, cls = 'w-5 h-5') {
  return `<svg class="inline-block flex-shrink-0 ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

// Thumbnails show the small copy in assets/memories/small/ (240x320, about 10 KB, made with
// `sips -Z 320 -s formatOptions low`) first, then swap in the full one once it's near the screen.
function sharpenThumbs(root = document) {
  const upgrade = img => {
    const full = new Image();
    full.decoding = 'async';
    full.onload = () => { img.src = full.src; };
    full.src = img.dataset.full;
    delete img.dataset.full;
  };
  const imgs = root.querySelectorAll('img[data-full]');
  if (!('IntersectionObserver' in window)) { imgs.forEach(upgrade); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { io.unobserve(e.target); upgrade(e.target); }
  }), { rootMargin: '200px' });
  imgs.forEach(img => io.observe(img));
}
