# SAI — Software Architecture Intelligence for Education

SAI is a local-first AI assistant for **education software requirements and SDLC recommendation**. It combines local model inference, document retrieval, agent workflows, persistent storage, and optional Telegram access in one independent project.

SAI uses two education-specific agents in sequence:

1. **Education Requirements Agent** creates an evidence-grounded requirements profile.
2. **Education SDLC Recommendation Agent** ranks SDLC options and generates a project-specific workflow.

The workflow is available in Mastra Studio as `education-requirements-then-sdlc`. It writes Markdown and HTML previews under `artifacts/education-sdlc/`.

## What SAI produces

SAI identifies stakeholders, product context, functional and non-functional requirements, acceptance criteria, verification methods, traceability, risks, and open questions. It then evaluates requirement stability, learner and child-safety criticality, privacy, accessibility, technical uncertainty, integrations, change frequency, testing formality, failure consequence, and approval needs.

The recommendation can rank Waterfall, V-Model, Spiral, Agile, DevSecOps, or a named hybrid. Scores are explicitly heuristic decision support rather than measured probabilities. SAI separates observed evidence from project-specific reasoning and marks unsupported jurisdiction, safeguarding, privacy, accessibility, institutional-policy, procurement, and retention claims as `NEEDS-VALIDATION`.

Final requirements baselines, privacy and safeguarding interpretations, accessibility claims, security-critical design, SDLC choice, and production readiness require human approval.

## Verified education corpus

The indexed corpus is under `docs/ingested/education/`. It contains eight education software projects and 57 source entries:

- Moodle
- Open edX
- Sakai
- Kolibri
- Oppia
- Canvas LMS
- OpenBoard
- BigBlueButton

The corpus reports documented public practices. It does not claim that undocumented internal practices do not exist. Named SDLC methodologies are used only when a project source explicitly names them.

## Architecture

SAI uses the following architecture:

- **Mastra** for agents, workflows, memory, and Studio.
- **LM Studio** for local OpenAI-compatible model inference.
- **LibSQL** for session storage.
- **BM25 retrieval** over the education corpus.
- **Telegram** as an optional mobile interface.
- **Skills** under `skills/` for domain behavior.

The runtime registers only the SAI Coordinator, Education Requirements Agent, Education SDLC Recommendation Agent, and `education-requirements-then-sdlc` workflow.

## Quick start

### Prerequisites

- Node.js >= 22.13
- LM Studio with a local chat model
- Telegram bot credentials only if Telegram access is required

### Install and configure

```bash
git clone <your-sai-repository-url>
cd SAI
npm install
cp .env.example .env
```

Configure `.env`:

```bash
LM_STUDIO_BASE_URL=http://127.0.0.1:1234/v1
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_MODEL=qwen/qwen3.5-9b
MASTRA_DATABASE_URL=file:./sai.db
```

### Run

```bash
npm run dev
```

Open Mastra Studio and select `education-requirements-then-sdlc`.

Example prompt:

```text
Design an offline-first learning management system for secondary schools. It should
support teachers, students, administrators, accessibility features, course content,
assessments, progress tracking, parent access, and integration with an existing
student information system.
```

### Validate

```bash
npm run check
```

## Project structure

```text
SAI/
├── docs/ingested/education/       # verified education SDLC corpus
├── skills/education-sdlc-recommendation/
├── src/mastra/education-agents.ts
├── src/mastra/education-prompts.ts
├── src/mastra/education-workflow.ts
├── src/mastra/sai-coordinator.ts
├── src/mastra/telegram-sai.ts
├── src/mastra/rag.ts
└── src/mastra/index.ts
```

## License

MIT — see `LICENSE`.

## Qwen 3.5 / LM Studio setup

This version is configured for a local LM Studio OpenAI-compatible server and Qwen 3.5. The RAG workspace is used only for corpus indexing/search and is not attached to agents or the global Mastra instance, preventing workspace/skill context from becoming extra system messages. The RAG processor also collapses system context and retrieved evidence into one system message because Qwen 3.5 requires the system message to be first.

1. Use Node.js 22.13+.
2. Copy `.env.example` to `.env` and set `LM_STUDIO_MODEL` to the exact model ID returned by `curl http://127.0.0.1:1234/v1/models`.
3. Start the Qwen 3.5 model in LM Studio and enable its local server on port 1234.
4. Run `npm install` and then `npm run dev`.
