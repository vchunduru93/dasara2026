// The 10-day schedule, shared by the home page and the gallery.
// Each day's thumbnails live in assets/memories/dayN-album.jpg and dayN-reel.jpg: 600x800 (3:4).
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
      alankaram: "Sri Durga Devi"
    },
    {
      dayNumber: 9,
      dressColor: { name: "Purple", hex: "#7E22CE", alt: "any dark color" },
      date: "2026-10-19",
      dayOfWeek: "Monday",
      thithi: "Maharnavami",
      alankaram: "Sri Mahishasura Mardini Devi"
    },
    {
      dayNumber: 10,
      dressColor: { name: "Gold", hex: "#B8860B", alt: "anything colorful" },
      date: "2026-10-20",
      dayOfWeek: "Tuesday",
      thithi: "Vijaya Dasami",
      alankaram: "Sri Raja Rajeswari Devi"
    }
  ]
};
