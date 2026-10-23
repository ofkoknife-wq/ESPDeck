import { SITE_URL, SUPPORT_EMAIL } from '@/lib/site'
import type { InfoPage } from '@/lib/info-pages'

export const INFO_PAGES_EN: Record<InfoPage['slug'], InfoPage> = {
  about: {
    slug: 'about',
    title: 'About',
    eyebrow: 'Origin story',
    lead: 'ESPDeck is a beginner-friendly ESP32 lab: one idea per lesson, open the page and practice.',
    seoTitle: 'About · Developer story · ESPDeck',
    seoDescription:
      'ESPDeck origin story: inspired by an Arduino-in-browser intro, a solo lab for newcomers to practice ESP32. espdeck.pixzens.com.',
    sections: [
      {
        heading: 'How it started',
        paragraphs: [
          'Someone shared an Arduino intro site on Twitter. Boards, LEDs, and buttons worked in the browser—hardware broken into tiny experiments instead of dense wiring diagrams.',
          'ESP32 was everywhere—dual core, Wi-Fi, Bluetooth, cheap—yet beginners got stuck on heavy samples, messy video desktops, and kits that assume you already know. As a solo developer who likes tidy steps, I wanted a web lab for ESP32 too.',
          'That’s ESPDeck. Basics use a 3D bench, one lesson at a time. Advanced stations add schematic, breadboard, PCB, faults, and quizzes. Simulation shows the idea first; real boards still need the datasheet.',
        ],
      },
      {
        heading: 'This lab',
        paragraphs: [
          'Progress stays in your browser—no account, no lesson locks. It’s free. Send feedback, request lessons, or tell us when a board doesn’t look real.',
        ],
      },
    ],
  },
  guide: {
    slug: 'guide',
    title: 'Guide',
    eyebrow: 'How to use',
    lead: 'Five minutes in: finish one lesson, then decide whether to open the advanced stations.',
    seoTitle: 'Guide · ESPDeck',
    seoDescription: 'ESPDeck guide: 3D basics lab, skip-ahead learning, schematics/PCB, fault injection, code fill-ins, and quizzes.',
    sections: [
      {
        heading: '1. Start on the basics bench',
        paragraphs: [
          'Open espdeck.pixzens.com for the basics lab. Pick any lesson on the left—no unlock order. Lesson one (“Meet the board”) is a good start: rotate the 3D board and match USB, module, antenna, BOOT / EN, and the onboard LED.',
          'The right panel has the story, wiring, and sample code. The toolbar rotates, zooms, resets, and toggles labels.',
        ],
      },
      {
        heading: '2. Hit Run and watch it move',
        paragraphs: [
          'Run simulates compile, flash, and reset, then the sketch runs. LEDs, RGB, servos, buzzers, and OLED text follow the lesson script. Buttons, knobs, touch, and temperature live in the controls.',
          'This is not a full circuit sim or official compiler—it shows “what this step roughly does.” On hardware, trust the datasheet and 3.3 V logic.',
        ],
      },
      {
        heading: '3. Progress stays on this device',
        paragraphs: [
          'Completed lessons are stored in localStorage. Clearing site data or switching devices resets them—no accounts, nothing uploaded.',
          'Skip ahead anytime. Advanced tracks are open too; after basics, the course list ends with the advanced workbench.',
        ],
      },
      {
        heading: '4. Open the advanced workbench',
        paragraphs: [
          'Use Advanced workbench in the header or at the end of the list. Each station switches among schematic, breadboard, and PCB, and covers observe, diagnose, code, quiz, and kit.',
          'Code and quizzes offer Show answer for solutions, tips, or correct choices.',
        ],
      },
      {
        heading: '5. When you’re stuck',
        paragraphs: [
          'Reread the overview and wiring, then the serial log. On advanced lessons, switch to the schematic or reset the view and zoom in.',
          `Still wrong or want a new lesson? Email ${SUPPORT_EMAIL} with the lesson name and what you saw.`,
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Terms',
    eyebrow: 'Terms',
    lead: 'ESPDeck is a free personal learning site. Using it means you accept these boundaries.',
    seoTitle: 'Terms · ESPDeck',
    seoDescription: 'ESPDeck terms: free personal learning tool. Web simulation does not replace datasheets or real hardware safety.',
    sections: [
      {
        heading: 'What the service is',
        paragraphs: [
          `ESPDeck (${SITE_URL.replace('https://', '')}) is maintained by a solo developer as a free ESP32 practice environment.`,
          'The site is provided as-is. Lessons and UI may change. It is not a training contract or hardware sale.',
        ],
      },
      {
        heading: 'Learning aid, not engineering substitute',
        paragraphs: [
          'Circuits and serial output are teaching scripts—not Spice, not the official SDK. For products or safety-critical work, use chip manuals and measurements.',
          'ESP32 is 3.3 V logic. Bad wiring can damage boards. Run does not control your physical board; real hardware risk is yours.',
        ],
      },
      {
        heading: 'How you may use it',
        paragraphs: [
          'Learn freely, screenshot notes, project in class. Don’t resell the site as a paid course or scrape it to impersonate an official product.',
          'Third-party marks (Espressif, ESP32, etc.) belong to their owners and appear only to describe hardware.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          `To the extent allowed by law, the developer is not liable for data loss, damaged boards, or similar from using the site. Questions: ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy',
    eyebrow: 'Privacy',
    lead: 'No account required. Practice stays in this browser by default.',
    seoTitle: 'Privacy · ESPDeck',
    seoDescription: `ESPDeck privacy: progress in local storage. Feedback email ${SUPPORT_EMAIL}.`,
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'Lesson progress and advanced quiz data use localStorage on this device. No accounts; we don’t ask for name or phone.',
          'Code drafts and sim logs stay local—they are not submitted as homework.',
        ],
      },
      {
        heading: 'Analytics',
        paragraphs: [
          'Production may load host analytics for traffic. It does not identify you personally or include your circuits or source.',
        ],
      },
      {
        heading: 'Links and tips',
        paragraphs: [
          'Support may open WeChat QR or Ko-fi. Payment details are handled by those platforms; ESPDeck never sees card numbers.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [`Clear this site’s data to wipe local progress. Mail to ${SUPPORT_EMAIL} is for replies only—never sold.`],
      },
    ],
  },
}

export const ABOUT_CONTACT_EN = {
  heading: 'Contact',
  intro: 'Rough edges, missing lessons, or a board that doesn’t look real—tell me.',
  siteLabel: 'Site: ',
  mailLabel: 'Email: ',
  supportLink: 'Want to support development? Visit Support and buy a coffee.',
}

export const SUPPORT_COPY_EN = {
  title: 'Support',
  seoTitle: 'Support · ESPDeck',
  seoDescription: 'If ESPDeck helped you learn ESP32, tip via WeChat or Ko-fi. Open the page. Get hands-on with ESP32.',
  back: 'Back to lab',
  eyebrow: 'Buy a coffee',
  greetingTitle: 'Thanks for opening this page',
  greetingP1: 'If the lab helped, a tip is a kind way to say so.',
  greetingP2: 'I’m a solo developer. Support becomes more lessons, 3D fixes, and stations—or just a coffee.',
  waysTitle: 'Ways to support',
  wechatTitle: 'WeChat tip',
  wechatDesc: 'Scan the QR above to tip with WeChat.',
  wechatAlt: 'WeChat tip QR code',
  kofiTitle: 'Ko-fi',
  kofiDesc: 'Friends abroad can support on Ko-fi.',
  kofiButton: 'Support on Ko-fi',
  meaningTitle: 'Your support goes toward',
  meaningDevTitle: 'More lessons',
  meaningDev: 'Turning more ESP32 scenarios into clickable, skippable experiments.',
  meaningHostTitle: 'Keeping the site up',
  meaningHost: 'Domain, hosting, and a lab that still opens on weak networks.',
  meaningThanksTitle: 'A signal',
  meaningThanks: 'Knowing someone is practicing makes it easier to fix what looks fake.',
  closing: `Any amount helps. Questions: ${SUPPORT_EMAIL}.`,
}
