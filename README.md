# SkiViz — Nordic Technique Visualizer

A PWA (Progressive Web App) for nordic ski coaches and athletes to compare technique side-by-side.

---

## What it does

- **Compare screen**: Two independent video players side-by-side. Upload any athlete video on the left; pick a reference video from your library on the right. Scrub each to your desired start point, then hit **Play Both**.
- **Library screen**: Browse your reference videos organized by category (Classic, Skate, Double Pole, etc.). Tap any video to load it into the reference player.
- **Settings**: Set default playback speed, loop behavior.
- Works on iPhone, Android, iPad, tablet — install to home screen for full-screen experience.

---

## Project structure

```
skiviz/
├── public/
│   ├── library.json        ← EDIT THIS to manage your video library
│   └── videos/             ← PUT YOUR MP4 FILES HERE
│       ├── classic-kick-ideal.mp4
│       ├── classic-kick-ideal-thumb.jpg
│       └── ...
├── src/
│   ├── components/
│   │   ├── VideoPlayer.jsx     ← single reusable player
│   │   ├── CompareScreen.jsx   ← side-by-side compare view
│   │   ├── LibraryScreen.jsx   ← video library browser
│   │   ├── SettingsScreen.jsx  ← settings
│   │   └── BottomNav.jsx       ← tab navigation
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## Adding videos to the library

1. Export/compress your video as MP4 (H.264, 720p is plenty). Free tool: **HandBrake**.
2. Drop the `.mp4` file into `/public/videos/`.
3. Optionally add a thumbnail `.jpg` (same name, `-thumb.jpg` suffix).
4. Open `public/library.json` and add an entry:

```json
{
  "id": "unique-id",
  "title": "Video title shown in library",
  "category": "Classic",
  "duration": "1:05",
  "file": "/videos/your-file.mp4",
  "thumbnail": "/videos/your-file-thumb.jpg",
  "description": "Optional description for coaches."
}
```

5. Save, commit, push to GitHub — Vercel auto-deploys in ~30 seconds.

**Categories** currently used: `Classic`, `Skate`, `Double Pole`. Add new ones freely.

---

## Local development setup (VS Code)

### Prerequisites — install these first

1. **Node.js** (v18 or higher): https://nodejs.org — download the LTS version
2. **VS Code**: https://code.visualstudio.com
3. **Git**: https://git-scm.com

### Recommended VS Code extensions

Open VS Code → Extensions panel (Ctrl/Cmd+Shift+X) → search and install:
- `ES7+ React/Redux/React-Native snippets` (dsznajder)
- `Prettier - Code formatter` (esbenp)
- `ESLint` (Microsoft)

### First-time setup

```bash
# 1. Open a terminal in VS Code (Ctrl+` or Terminal → New Terminal)

# 2. Navigate to the project folder
cd path/to/skiviz

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Open your browser to **http://localhost:5173** — the app loads instantly.
The dev server hot-reloads on every file save — no manual refresh needed.

### Build for production

```bash
npm run build
```

This creates a `/dist` folder — that's what gets deployed.

---

## Deploying to Vercel (free)

1. Push your project to a **GitHub** repository.
2. Go to https://vercel.com → Sign up with GitHub (free).
3. Click **Add New Project** → import your repo.
4. Leave all settings as default → click **Deploy**.
5. Done — you get a URL like `https://skiviz.vercel.app`.

Every time you push to GitHub, Vercel auto-deploys within ~30 seconds.

### Custom domain (optional)

In Vercel project settings → Domains → add your own domain (e.g. `skiviz.coach`).

---

## Installing as a home screen app

**iPhone/iPad (Safari)**:
1. Open the app URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome)**:
1. Open the app URL in Chrome
2. Tap the three-dot menu
3. Tap "Add to Home Screen" or "Install app"

---

## Notes for future development

- **Annotations**: draw lines/angles on a paused frame — good next feature to add
- **Athlete profiles**: save athlete video history per coach
- **Speed presets per category**: e.g. always default to 0.5× for technique drills
- **App icons**: replace `icon-192.png` and `icon-512.png` in `/public/` with real icons
