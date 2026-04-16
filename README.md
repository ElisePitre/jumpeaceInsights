# JumPeace — Group 3

**CIS*3750 · University of Guelph**

> A full-stack web application with a Python/Flask backend, a Firebase Data Connect layer, and a Node.js-bundled frontend.

---

## Team

| Name | GitHub |
|------|--------|
| Elise Pitre | [@ElisePitre](https://github.com/ElisePitre) |
| Jian Min Lim | [@JianMin-Lim](https://github.com/JianMin-Lim) |
| Puneet Chaudhary | [@puneetchaudharyy](https://github.com/puneetchaudharyy) |
| Matthew Breen | [@mztttt](https://github.com/mztttt) |
| Eli Webster | [@EliWebster](https://github.com/EliWebster) |
| Amina Hassan | [@ahassana09](https://github.com/ahassana09) |
| Cole Burgi | [@CBurgi](https://github.com/CBurgi) |
| Umang Deval | [@umangdeval](https://github.com/umangdeval) |

📋 **Trello Board:** https://trello.com/w/cis3750group32/

---

## Repository Layout

```
project-setup-jumpeace_g3/
├── src/
│   ├── run.py                  # Flask entry point
│   ├── templates/
│   │   └── static/             # Frontend source (npm project lives here)
│   └── ...
├── tests/                      # Python test suite
├── labs/                       # Lab submissions
├── docs/
│   └── meeting_notes.md        # Weekly meeting notes
├── design.md                   # Requirements & design document
└── requirements.txt            # Python dependencies
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- Firebase CLI (`npm install -g firebase-tools`)

---

### 1 — Python Virtual Environment

```bash
python3 -m venv venv
or
python -m venv .venv
```

Activate it:

| Platform | Command |
|----------|---------|
| macOS / Linux | `source venv/bin/activate` |
| Windows | `venv\Scripts\activate` |

---

### 2 — Backend (Terminal 1)

```bash
cd project-setup-jumpeace_g3

pip install -r requirements.txt   # install Python dependencies

cd src

python3 run.py                    # start the Flask dev server
```

The API will be available at `http://localhost:5000`.

---

### 3 — Frontend (Terminal 2)

```bash
cd project-setup-jumpeace_g3/src/templates/static

npm install          # first time only — installs node_modules

npm run build        # compile/bundle assets
npm run watch        # recompile on file changes (keep this running during development)
```

---

### 4 — Open the App

Navigate to **http://localhost:5000** in your browser.

---

## Firebase Setup (First Time on a New Machine)

These steps only need to be done once per computer.

### 4.1 Authenticate & Select Project

```bash
firebase login
firebase use jumppeace-7c331
```

### 4.2 Generate the Data Connect SDK

```bash
firebase dataconnect:sdk:generate
```

### 4.3 Deploy Data Connect (schema/connector changes only)

```bash
firebase deploy --only dataconnect
```

> ⚠️ Only run this after modifying Data Connect schema or connector files — not on every run.

### Notes

- `firebase login` is required once per machine for Firebase CLI commands.
- App users may still need to sign in inside the app for user-protected queries.

---

## Development Workflow

| Task | Command |
|------|---------|
| Start backend | `python3 run.py` (from `src/`) |
| Build frontend (once) | `npm run build` (from `src/templates/static/`) |
| Watch frontend (dev) | `npm run watch` (from `src/templates/static/`) |
| Run tests | `pytest` (from project root) |
| Deploy Data Connect | `firebase deploy --only dataconnect` |

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes with clear messages.
3. Open a pull request and request a review from at least one teammate.
4. Document any meetings in `docs/meeting_notes.md`.
5. Keep `design.md` up to date as requirements evolve.

---

## Netlify Deployment (Frontend) + Search API

Authentication can work on Netlify while search fails if the Flask API is not reachable from the deployed frontend.

1. Deploy the Flask backend from `src/` to a backend host (for example Render/Railway/Fly.io).
2. Set Netlify environment variable `JUMPEACE_API_BASE_URL` to your backend URL (example: `https://your-backend.example.com`).
3. Redeploy Netlify so it regenerates `public/api-config.js` with that URL.
4. Ensure backend endpoint is available at `/api/query`.

Notes:
- Local development can continue using relative `/api/query` when `JUMPEACE_API_BASE_URL` is empty.
- Backend CORS is enabled for `/api/*` to allow cross-origin requests from Netlify.
