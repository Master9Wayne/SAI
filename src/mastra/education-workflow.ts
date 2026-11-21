import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { educationRequirementsAgent, educationSdlcSelectionAgent } from './education-agents';
import { textFromGenerateResult } from './telegram-utils';
import { workspaceRoot } from './workspace';

const baseDir = join(workspaceRoot, 'artifacts/education-sdlc');

const htmlPreview = (markdown: string) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Education SDLC Recommendation</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css"/>
<style>body{box-sizing:border-box;min-width:200px;max-width:1100px;margin:0 auto;padding:45px;}</style></head>
<body class="markdown-body"><div id="content"></div>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(markdown)});</script>
</body></html>`;

// Each run gets its own folder so concurrent Telegram requests don't overwrite each other.
const newRunDir = () => join(baseDir, new Date().toISOString().replace(/[:.]/g, '-'));

// Slice "## Heading" sections out of a markdown file, keeping file order.
const pickSections = (md: string, names: string[]) =>
  md
    .split(/^(?=## )/m)
    .filter((part) => names.some((name) => part.startsWith(`## ${name}`)))
    .map((part) => part.trim())
    .join('\n\n');

// What the SDLC agent actually needs: Summary, Decision factors, Requirements, Risks.
const sdlcDigest = (requirements: string) => {
  const digest = pickSections(requirements, ['Summary', 'Decision factors', 'Requirements', 'Risks']);
  // Fallback if the model ignored the headings.
  return digest || requirements.slice(0, 6000);
};

// Step 1: Requirements agent -> writes requirements.md
const profileRequirements = createStep({
  id: 'profile-education-requirements',
  description: 'Create an evidence-grounded requirements profile and save it as a file.',
  inputSchema: z.object({ prompt: z.string() }),
  outputSchema: z.object({ runDir: z.string(), requirementsPath: z.string() }),
  execute: async ({ inputData }) => {
    const result = await educationRequirementsAgent.generate(inputData.prompt);
    const requirements = textFromGenerateResult(result);
    if (!requirements) throw new Error('Education Requirements Agent returned no text');

    const runDir = newRunDir();
    await mkdir(runDir, { recursive: true });
    const requirementsPath = join(runDir, 'requirements.md');
    await writeFile(requirementsPath, `${requirements.trim()}\n`, 'utf8');
    return { runDir, requirementsPath };
  },
});

// Step 2: SDLC agent gets a trimmed digest of the requirements FILE -> writes sdlc.md
const recommendEducationSdlc = createStep({
  id: 'recommend-education-sdlc',
  description: 'Read the requirements file and produce a project-specific SDLC recommendation.',
  inputSchema: z.object({ runDir: z.string(), requirementsPath: z.string() }),
  outputSchema: z.object({
    runDir: z.string(),
    requirementsPath: z.string(),
    sdlcPath: z.string(),
    requirements: z.string(),
    sdlc: z.string(),
  }),
  execute: async ({ inputData }) => {
    const requirements = (await readFile(inputData.requirementsPath, 'utf8')).trim();
    if (!requirements) throw new Error(`Requirements file is empty: ${inputData.requirementsPath}`);

    const result = await educationSdlcSelectionAgent.generate(
      `Recommend an SDLC for this requirements digest (from ${inputData.requirementsPath}).\n\n${sdlcDigest(requirements)}`,
    );
    const sdlc = textFromGenerateResult(result);
    if (!sdlc) throw new Error('Education SDLC Recommendation Agent returned no text');

    const sdlcPath = join(inputData.runDir, 'sdlc.md');
    await writeFile(sdlcPath, `${sdlc.trim()}\n`, 'utf8');
    return { ...inputData, sdlcPath, requirements, sdlc };
  },
});

// Step 3: Combine into final document + HTML preview (also copied to latest.*)
const writeEducationPreview = createStep({
  id: 'write-education-preview',
  description: 'Write combined Markdown and HTML previews.',
  inputSchema: z.object({
    runDir: z.string(),
    requirementsPath: z.string(),
    sdlcPath: z.string(),
    requirements: z.string(),
    sdlc: z.string(),
  }),
  outputSchema: z.object({
    requirements: z.string(),
    sdlc: z.string(),
    document: z.string(),
    requirementsPath: z.string(),
    sdlcPath: z.string(),
    markdownPath: z.string(),
    htmlPath: z.string(),
  }),
  execute: async ({ inputData }) => {
    const document = `${inputData.requirements.trim()}\n\n---\n\n${inputData.sdlc.trim()}`;
    const markdownPath = join(inputData.runDir, 'final.md');
    const htmlPath = join(inputData.runDir, 'final.html');
    await writeFile(markdownPath, `${document}\n`, 'utf8');
    await writeFile(htmlPath, htmlPreview(document), 'utf8');

    // Keep the old "latest" entry points working for the Telegram handler.
    await copyFile(markdownPath, join(baseDir, 'latest.md'));
    await copyFile(htmlPath, join(baseDir, 'latest.html'));

    return {
      requirements: inputData.requirements,
      sdlc: inputData.sdlc,
      document,
      requirementsPath: inputData.requirementsPath,
      sdlcPath: inputData.sdlcPath,
      markdownPath,
      htmlPath,
    };
  },
});

export const educationRequirementsThenSdlc = createWorkflow({
  id: 'education-requirements-then-sdlc',
  description: 'Requirements agent writes requirements.md; SDLC agent reads that file and recommends a lifecycle.',
  inputSchema: z.object({ prompt: z.string() }),
  outputSchema: z.object({
    requirements: z.string(),
    sdlc: z.string(),
    document: z.string(),
    requirementsPath: z.string(),
    sdlcPath: z.string(),
    markdownPath: z.string(),
    htmlPath: z.string(),
  }),
})
  .then(profileRequirements)
  .then(recommendEducationSdlc)
  .then(writeEducationPreview)
  .commit();

export const runEducationRequirementsThenSdlc = async (prompt: string) => {
  const run = await educationRequirementsThenSdlc.createRun();
  const result = await run.start({ inputData: { prompt } });
  if (result.status !== 'success') {
    const message = result.status === 'failed' ? result.error.message : result.status;
    throw new Error(`Education workflow failed: ${message}`);
  }
  return result.result;
};
