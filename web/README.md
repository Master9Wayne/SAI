# SAI Web UI

This is a separate React/Vite frontend for SAI. Keep it in the `web/` directory at the root of the SAI project:

```text
SAI/
├── src/mastra/          # Existing Mastra backend, agents, RAG, and workflows
├── docs/                # Education evidence corpus
├── skills/              # SAI skills
├── web/                 # This separate React UI
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── package.json
```

## Run it

Terminal 1: start the existing SAI/Mastra backend from the project root.

```bash
cd SAI
npm install
npm run dev
```

Mastra should be available at `http://localhost:4111`.

Terminal 2: start this frontend.

```bash
cd SAI/web
npm install
npm run dev
```

Open `http://localhost:3000`.

The Vite development proxy forwards `/api` requests to `http://localhost:4111`, so the browser does not need a separate CORS configuration during local development.

## Backend endpoints used

The UI calls the existing Mastra agent API endpoints:

```text
POST /api/agents/education-requirements-agent/generate
POST /api/agents/education-sdlc-selection-agent/generate
```

The requirements tab calls the first agent. The SDLC recommendation tab calls the second agent with the entered project brief or requirements text.

If the installed Mastra version exposes a different API prefix, update the two calls in `src/api.ts`; no visual components need to change.

## Production build

```bash
cd SAI/web
npm run build
npm run preview
```

The generated static site is placed in `web/dist/`.
