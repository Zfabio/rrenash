Rrenash — The Albanian Bluff Card Game

    Play directly in your browser — no downloads, no installs, no account required.

Rrenash is an exciting online implementation of the classic Albanian bluff card game. Challenge players from anywhere in the world (or friends in the same room) through a real-time, browser-based experience built with React, Vite, Tailwind CSS, and shadcn/ui.


🌐 Play Online

The fastest way to play Rrenash is straight from the web — just open the link and start a game.

    ✅ No installation needed

    ✅ Works on desktop, tablet, and mobile browsers

    ✅ Shareable game link — send it to friends and play instantly

    ✅ Runs on any modern browser (Chrome, Firefox, Safari, Edge)

    Hosting your own server? See the Self-Hosting section below to deploy your own instance in minutes.

🎮 About the Game

Rrenash (Albanian for "liar") is a thrilling bluff card game where deception and strategy collide. Players take turns claiming cards and challenging each other's honesty. One wrong call and the consequences hit hard — can you keep a poker face long enough to win?

Key features:

    Online multiplayer — play with friends or anyone on the same hosted instance

    Real-time game state — cards, turns, and challenges update live in the browser

    Clean, responsive UI — fully playable on both desktop and mobile

    Fast sessions — games are quick, intense, and highly replayable

🚀 Self-Hosting

Want to host your own public or private Rrenash server so anyone can join your game room with a link? Follow these steps:
1. Prerequisites

Make sure you have Node.js installed (v18+ recommended).
2. Install & Run Locally

text
git clone <your-repo-url>
cd rrenash
npm install
npm run dev

Open your browser and navigate to http://localhost:5173 — you're live!
3. Invite Others to Your Local Game

To let friends on the same network join, share your local IP address:

text
http://<your-local-ip>:5173

🌍 Deploy for Global Online Play

To make Rrenash available to anyone on the internet, build and deploy to any static hosting provider:

text
npm run build

This generates an optimized production build in the dist/ folder. Upload it to any of the following platforms — most have free tiers and deploy in under a minute:
Platform	Free Tier	Deploy Method	Notes
Vercel	✅ Yes	Git push / drag & drop	Recommended — zero config
Netlify	✅ Yes	Git push / drag & drop	Great for static sites
GitHub Pages	✅ Yes	GitHub Actions	Ideal if code is on GitHub
Any web host	Varies	FTP / file upload	Upload dist/ contents

Once deployed, share your URL and anyone in the world can load up the game instantly in their browser — no sign-up, no app store, no waiting.
🛠️ Development
Command	Description
npm run dev	Start local development server with hot reload
npm run build	Build optimized production assets to dist/
npm run preview	Preview the production build locally before deploying
📦 Tech Stack

    React — component-based UI

    Vite — blazing-fast dev server and bundler

    Tailwind CSS — utility-first styling

    shadcn/ui — accessible, composable UI components

📄 License

MIT — free to use, fork, and deploy your own online Rrenash instance.
