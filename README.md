# Hussein Alsaadi — Portfolio

A single-page personal portfolio for **Hussein Alsaadi** — Mobile Communications &
Computing Engineer (IoT · Flutter · Full-Stack). Warm-cream **neumorphism** surfaces
layered with **glassmorphism** cards, fully responsive, animated — and with **no build
step**: it's one HTML file with inline CSS and a few lines of vanilla JS.

## View it

Open [`index.html`](index.html) in any modern browser — that's it.

## Structure

```
index.html          The whole site (HTML + inline CSS + vanilla JS)
intro.js            Entrance intro (plays once per session; add ?intro to replay)
serve.mjs           Optional local preview server: node serve.mjs -> http://localhost:3000
assets/
  person/           Portrait cutouts (waving, laptop)
  props/            Retro-tech decorative props (Game Boy, robot arm, cameras…)
  projects/         (create this) your project screenshots for the lightbox
```

## Sections

- **Navigation** — the normal bar shows at the top of the page. Once you scroll it turns into a
  small dark **dynamic island** (current section + scroll progress) that opens into the full menu
  when you hover, focus or tap it.
- **Hero** — rotating role line, floating props, glass portrait frame (the person floats), **parallax depth**
  (layers move at different speeds on scroll; the portrait tilts with the mouse on desktop)
- **About** — bio + tech pills
- **Skills** — an interactive console: four disciplines (Networking & IT, IT Support & Hardware,
  AI & Automation, Development) as tabs, each with its own animated illustration
- **Work** — bento grid of seven real projects; click a card's picture to open the **lightbox**
- **Contact** — email, GitHub, LinkedIn, WhatsApp

## Intro

`intro.js` has two layouts from the design handoff: a 1920×1080 landscape version and a
1080×1920 portrait version for phones. The right one is chosen from the screen shape.
It plays once per browser session. **Skip** or **Esc** jumps to the end, `?intro` replays it,
and `?intro=4.2` freezes it on one frame (seconds) for design review.

## Lightbox (project pictures)

There is one gallery of **five pictures**. Five project cards show a cover picture; clicking one
opens a native `<dialog>` lightbox over a dark scrim. The arrow buttons, the Left / Right keys or
a swipe page through all five pictures (the caption follows the project, and it wraps around).
**Esc**, the close button or a click on the dark area closes it.

The pictures are placeholders for now. To use your own, put the files in `assets/projects/` and
edit the `SHOTS` list at the top of the script at the bottom of `index.html`:

```js
var SHOTS = {
  "01": ["assets/projects/fuel-tank.jpg"],
  // a project with no entry simply has no cover (07 and 05 have none right now)
};
```

The keys match the `PROJECT / 0N` label on each card, and the pictures are paged in card order.

## Motion and accessibility

- The **intro** always plays once per session. If a visitor's system has *reduce motion* turned on it
  plays a calm version (same drawing, a gentle fade instead of the zoom and split).
- **Parallax** (scroll- and mouse-linked movement) is switched off for *reduce motion*; the gentle
  floating of the portrait, chips and props always runs.
- If your own PC has Windows "Animation effects" turned off, browsers report *reduce motion* and you
  will not see parallax. Turn it on in Windows Settings → Accessibility → Visual effects.
- All links and buttons show a keyboard focus ring; the tabs, island and lightbox work with the keyboard.

## Contact

- **Email:** alsaadihusseinsaad@gmail.com
- **GitHub:** https://github.com/Alsaadi-Hussein
- **LinkedIn:** https://www.linkedin.com/in/hussein-alsaadi
