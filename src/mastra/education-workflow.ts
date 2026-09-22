import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { educationRequirementsAgent, educationSdlcSelectionAgent } from './education-agents';
import { textFromGenerateResult } from './telegram-utils';
import { workspaceRoot } from './workspace';

const previewDir = join(workspaceRoot, 'artifacts/education-sdlc');

const htmlPreview = (markdown: string) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Education SDLC Recommendation</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css"/>
<style>body{box-sizing:border-box;min-width:200px;max-width:1100px;margin:0 auto;padding:45px;}</style></head>
<body class="markdown-body"><div id="content"></div>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(markdown)});</script>
</body></html>`;

const profileRequirements = createStep({
  id: 'profile-education-requirements',
  description: 'Create an evidence-grounded requirements profile for an education product.',
  inputSchema: z.object({ prompt: z.string() }),
  outputSchema: z.object({ requirements: z.string() }),
  execute: async ({ inputData }) => {
    const result = await educationRequirementsAgent.generate(inputData.prompt);
    const requirements = textFromGenerateResult(result);
    if (!requirements) throw new Error('Education Requirements Agent returned no text');
    return { requirements };
  },
});

const recommendEducationSdlc = createStep({
  id: 'recommend-education-sdlc',
  description: 'Rank SDLC options and produce a project-specific education workflow.',
  inputSchema: z.object({ requirements: z.string() }),
  outputSchema: z.object({ requirements: z.string(), sdlc: z.string(), document: z.string() }),
  execute: async ({ inputData }) => {
    const result = await educationSdlcSelectionAgent.generate(
      `Recommend an SDLC for this education-software requirements profile.\n\n${inputData.requirements}`,
    );
    const sdlc = textFromGenerateResult(result);
    if (!sdlc) throw new Error('Education SDLC Recommendation Agent returned no text');
    return { requirements: inputData.requirements, sdlc, document: `${inputData.requirements.trim()}\n\n---\n\n${sdlc.trim()}` };
  },
});

const writeEducationPreview = createStep({
  id: 'write-education-preview',
  description: 'Write Markdown and HTML education SDLC recommendation previews.',
  inputSchema: z.object({ requirements: z.string(), sdlc: z.string(), document: z.string() }),
  outputSchema: z.object({ requirements: z.string(), sdlc: z.string(), document: z.string(), markdownPath: z.string(), htmlPath: z.string() }),
  execute: async ({ inputData }) => {
    await mkdir(previewDir, { recursive: true });
    const markdownPath = join(previewDir, 'latest.md');
    const htmlPath = join(previewDir, 'latest.html');
    await writeFile(markdownPath, `${inputData.document.trim()}\n`, 'utf8');
    await writeFile(htmlPath, htmlPreview(inputData.document), 'utf8');
    return { ...inputData, markdownPath, htmlPath };
  },
});

export const educationRequirementsThenSdlc = createWorkflow({
  id: 'education-requirements-then-sdlc',
  description: 'Education flow: profile requirements, rank SDLC options, and write an evidence-grounded workflow.',
  inputSchema: z.object({ prompt: z.string() }),
  outputSchema: z.object({ requirements: z.string(), sdlc: z.string(), document: z.string(), markdownPath: z.string(), htmlPath: z.string() }),
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
