/*
 * ─── EDIT ME ───────────────────────────────────────────────────────────
 * This is the only file you need to touch to keep the site up to date.
 * Add shows, change the set list, update links. No build step needed.
 * ───────────────────────────────────────────────────────────────────────
 */
window.SZ = {
  email: "contact@spottedzebra.party",

  /*
   * Where the booking form (and mailing list signup) sends. FormSubmit (free,
   * no account) emails each one to the address at the end. It stays on
   * booking@ because that address is already activated with FormSubmit;
   * visitors never see it. Both booking@ and contact@ forward to the band's
   * Gmail through Cloudflare Email Routing. The very first booking sends an
   * "Activate form" email there instead; click it once and you're set.
   * Leave it as "" to fall back to opening the visitor's email app.
   */
  formEndpoint: "https://formsubmit.co/ajax/booking@spottedzebra.party",

  socials: {
    instagram: "https://www.instagram.com/spottedzebramusic",
    facebook: "https://www.facebook.com/spottedzebramusic/",
    youtube: "https://www.youtube.com/@SpottedZebraMusic",
  },

  /*
   * Upcoming shows. Past dates are hidden automatically.
   * date: "YYYY-MM-DD"   time: like "9 PM" or "8:30 PM"   link: optional (tickets / event page)
   * address: optional street address. Fill it in when you can: it helps the
   * show appear in Google's event listings.
   * Example:
   * { date: "2026-11-14", time: "9 PM", venue: "The Some Bar", address: "123 Main St", city: "Seattle, WA", link: "" },
   *
   * Optional extras (a show with a flyer gets the big featured layout):
   *   title: event name · with: other bands on the bill · doors: door time
   *   end: end time · price: ticket line · flyer: image path (full size)
   *   flyerSmall: smaller copy for the page (falls back to flyer)
   *
   * Pop-up: the next show that has both a flyer and a ticket link pops up
   * on the homepage (once per visit) with a "Buy tickets" button.
   * Add popup: false to a show to skip it, or set popup: false below to
   * turn the pop-up off entirely.
   */
  popup: true,

  shows: [
    {
      date: "2026-11-28",
      time: "8 PM",
      end: "11 PM",
      doors: "7 PM",
      title: "Second Serving Saturday",
      venue: "Jules Maes Saloon",
      address: "5919 Airport Way S",
      city: "Seattle, WA",
      with: ["Lark vs Owl", "Pink-182"],
      price: "$10 advance · $15 at the door",
      flyer: "/assets/shows/2026-11-28-second-serving-saturday.jpg",
      flyerSmall: "/assets/shows/2026-11-28-second-serving-saturday-800.webp",
      link: "https://tickets.venuepilot.com/e/spotted-zebra-pink-182-lark-v-owl-2026-11-28-jules-maes-seattle-acaacf",
    },
  ],
};
