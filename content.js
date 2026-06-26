/* =============================================================
   Rose — your daily picture & message
   =============================================================
   Photos are now chosen automatically by DATE (see photos.js,
   which is generated from your photo library). On a day that
   matches a photo's date — like 13 January, your wedding — she
   sees that memory ("On this day, N years ago"). On other days
   she sees a rotating picture from your collection.

   This file holds the two things you may want to tweak:
     1) CONFIG  — names + your anniversary date
     2) MESSAGES — the daily notes (one is shown per day)
   ============================================================= */

const CONFIG = {
  // Her name — shown in the daily greeting.
  recipientName: "Rose",

  // Your name for the sign-off (leave "" to hide the sign-off line).
  fromName: "",

  // Your wedding date as MM-DD — gets a special "Married N years ago" badge.
  anniversary: "01-13",

  // The year you got married — used to count the years in the anniversary message.
  weddingYear: 2023,

  // Rose's birth year — used to count her age in the birthday message ({age}).
  birthYear: 1966,
};

/* One of these is shown each day (it rotates, independent of the photo).
   Add as many as you like. Use \n for a line break. */
const MESSAGES = [
  "Good morning, my love.\nThe very first thing I wanted you to see today is a reminder of how much you're adored. That's all. Just that.",
  "Of all the ordinary days in the world, the best ones are the ones with you in them. I hope today is gentle to you.",
  "If I could give you one thing today, it would be the ability to see yourself the way I see you — wonderful, whole, and impossibly easy to love.",
  "A small note in your pocket: you are doing better than you think you are, and you are loved more than you know.",
  "I was thinking about your laugh this morning. It's still my favourite sound. Carry it with you today.",
  "Whatever today brings, you don't face it alone. I'm in your corner — always, quietly, completely.",
  "You make the hard days softer just by being you. Thank you for being exactly who you are.",
  "Here's your daily reminder that someone fell asleep last night grateful for you, and woke up feeling the same.",
  "I hope something makes you smile today. And if nothing does, let this be the thing: you are deeply, steadily loved.",
  "Some loves are loud. Ours is the kind that just keeps showing up, every single day. Like this. Like now.",
  "On the days you feel like too much, you are not. On the days you feel like not enough, you are. You are just right, and you are mine.",
  "Take a breath. Drink some water. Know that across however many miles, someone is thinking of you with the softest heart.",
  "I'd choose you again today. And tomorrow. And on the days that are nothing special at all — especially those.",
  "You are the best part of my every day. I just wanted today to start by telling you so.",
  "Sending you a little courage for whatever's ahead, and a lot of love for no reason at all except that you're you.",
  "However today goes, come home to this: you are wanted, you are cherished, and you are never, ever a burden.",
  "I hope you catch your reflection today and, just for a second, see the incredible person I get to love.",
  "Thank you for the little things — the way you care, the way you try, the way you make a house feel like us. I notice all of it.",
  "If today is heavy, set some of it down here. I'll help you carry it. That's what I'm for.",
  "Here we are, another day. Same love, only more of it. Have the loveliest day, you.",
];

/* Messages for specific calendar days (keyed by MM-DD). On those dates, the
   greeting + message below REPLACE the daily rotating note. In the anniversary
   message, {years} is filled in automatically from CONFIG.weddingYear. */
const SPECIAL_MESSAGES = {
  // 13 January — wedding anniversary
  "01-13": {
    greeting: "Happy anniversary 💍",
    message:
      "Happy anniversary, my love.\n{years} years ago today I married my favourite person in the world — and I would choose you again in a heartbeat, every day, every year, always. Thank you for this beautiful life. I love you more than ever.",
  },
  // 4 July — Rose's birthday ({age} counts her years from CONFIG.birthYear)
  "07-04": {
    greeting: "Happy birthday, Rose 🎂",
    message:
      "Happy birthday, my darling Rose.\n{age} years young today — and somehow lovelier, kinder, and more wonderfully you with every single one of them. This little app is one of your presents: a new memory of us for every day ahead, so you're reminded just how deeply you're loved — not only today, but always. Here's to you, and to many, many more. 🎂💕",
  },
};

/* Hand-picked photo for a specific calendar day (MM-DD → photo path).
   When set, this exact photo is shown on that date instead of the
   automatic pick. Use the picker (pick.html) to choose these. */
const PINNED = {
  "01-13": "photos/p0510.jpg",   // anniversary — the two of you laughing by the water
  "07-04": "photos/p0768.jpg",   // birthday — her party
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG, MESSAGES, SPECIAL_MESSAGES, PINNED };
} else {
  window.ROSE = { CONFIG, MESSAGES, SPECIAL_MESSAGES, PINNED };
}
