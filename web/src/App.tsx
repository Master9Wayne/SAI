import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, Download, FileText, Layers, Leaf, Loader2, ShieldCheck, Sparkles, Workflow, X } from 'lucide-react';
import { detectRequirements, recommendSdlc, runPipeline } from './api';

type Mode = 'pipeline' | 'requirements' | 'sdlc';

type Result = {
  mode: Mode;
  text: string;
  runFolder?: string;
};

const modeLabels: Record<Mode, string> = {
  pipeline: 'Requirements profile + SDLC recommendation',
  requirements: 'Requirements profile',
  sdlc: 'SDLC recommendation',
};

const buttonLabels: Record<Mode, string> = {
  pipeline: 'Run full analysis',
  requirements: 'Detect requirements',
  sdlc: 'Recommend an SDLC',
};

const loadingCopy: Record<Mode, { title: string; body: string }> = {
  pipeline: {
    title: 'Running the full analysis',
    body: 'Step 1: profiling requirements. Step 2: recommending an SDLC from the saved requirements file. This can take a few minutes on a local model.',
  },
  requirements: {
    title: 'Profiling requirements',
    body: 'SAI is reading the brief and assembling the education-software context.',
  },
  sdlc: {
    title: 'Ranking lifecycle options',
    body: 'SAI is comparing SDLC options against the brief and the education-software evidence.',
  },
};

const examples = [
  'A university wants an AI-powered career guidance platform for students and counselors. Requirements will evolve through continuous feedback, and the university wants an early working version.',
  'Design an offline-first learning platform for secondary schools with teacher dashboards, assessments, accessibility support, parent access, and integration with a student information system.',
];

const folderOf = (path?: string) => (path ? path.replace(/[\\/][^\\/]+$/, '') : undefined);

function App() {
  const [mode, setMode] = useState<Mode>('pipeline');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const submit = async () => {
    if (!prompt.trim()) {
      setError('Enter a project brief before running the analysis.');
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError('');
    try {
      if (mode === 'pipeline') {
        const out = await runPipeline(prompt, controller.signal);
        setResult({ mode, text: out.document, runFolder: folderOf(out.requirementsPath) });
      } else {
        const response = mode === 'requirements'
          ? await detectRequirements(prompt, controller.signal)
          : await recommendSdlc(prompt, controller.signal);
        setResult({ mode, text: response.text });
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') {
        setError('Cancelled.');
      } else {
        setError(caught instanceof Error ? caught.message : 'SAI could not complete the request.');
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const cancel = () => abortRef.current?.abort();

  const useExample = (example: string) => {
    setPrompt(example);
    setError('');
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result.text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sai-${result.mode}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tab = (value: Mode, icon: React.ReactNode, label: string) => (
    <button
      className={mode === value ? 'mode active' : 'mode'}
      onClick={() => setMode(value)}
      role="tab"
      aria-selected={mode === value}
      disabled={loading}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="SAI home">
          <span className="brand-mark"><Leaf size={20} strokeWidth={2.4} /></span>
          <span><strong>SAI</strong><small>Education software workspace</small></span>
        </a>
        <div className="status"><span className="status-dot" /> Local workspace</div>
      </header>

      <main className="page">
        <section className="hero">
          <div className="eyebrow"><span className="eyebrow-line" /> Planning workspace</div>
          <h1>Turn an education idea into a <em>buildable plan.</em></h1>
          <p className="hero-copy">Define the requirements first, then choose a lifecycle that fits the project. SAI keeps the work practical, traceable, and ready for review.</p>
        </section>

        <div className="workspace-grid">
          <section className="panel brief-panel">
            <div className="panel-heading">
              <div><span className="step-label">STEP 01</span><h2>Project brief</h2></div>
              <ClipboardList size={22} />
            </div>
            <p className="panel-intro">Describe the education product, its users, constraints, and what you want to decide.</p>

            <div className="mode-switch" role="tablist" aria-label="Analysis type">
              {tab('pipeline', <Layers size={17} />, 'Full analysis')}
              {tab('requirements', <FileText size={17} />, 'Requirements')}
              {tab('sdlc', <Workflow size={17} />, 'SDLC only')}
            </div>
            {mode === 'sdlc' && (
              <p className="panel-intro">Best used with a requirements profile pasted in below. For a raw brief, use Full analysis.</p>
            )}

            <label className="field-label" htmlFor="brief">Education software brief</label>
            <textarea id="brief" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Example: A university wants to build..." rows={11} />
            <div className="textarea-footer"><span>{prompt.length} characters</span><span>Plain-language input is fine</span></div>

            <div className="examples">
              <span>Try an example</span>
              {examples.map((example, index) => <button key={example} onClick={() => useExample(example)}>Example {index + 1} <ArrowRight size={13} /></button>)}
            </div>

            {error && <div className="error-box" role="alert">{error}</div>}
            {loading ? (
              <button className="primary-button" onClick={cancel}>
                <X size={18} /> Cancel
              </button>
            ) : (
              <button className="primary-button" onClick={submit}>
                <Sparkles size={18} /> {buttonLabels[mode]} <ArrowRight size={18} />
              </button>
            )}
          </section>

          <section className="panel output-panel">
            <div className="panel-heading">
              <div><span className="step-label">STEP 02</span><h2>Analysis output</h2></div>
              {result && <button className="icon-button" onClick={downloadResult} title="Download Markdown"><Download size={18} /></button>}
            </div>

            {!result && !loading && (
              <div className="empty-state">
                <div className="empty-icon"><BookOpen size={24} /></div>
                <h3>Your result will appear here</h3>
                <p>Choose an analysis type, add your project brief, and run SAI. The output will include evidence, decisions, risks, and items needing human validation.</p>
                <div className="trust-list"><span><CheckCircle2 size={16} /> Evidence-aware</span><span><ShieldCheck size={16} /> Human review flagged</span></div>
              </div>
            )}

            {loading && (
              <div className="empty-state">
                <Loader2 size={28} className="spin green" />
                <h3>{loadingCopy[mode].title}</h3>
                <p>{loadingCopy[mode].body}</p>
              </div>
            )}

            {result && !loading && (
              <div className="result-wrap">
                <div className="result-meta">
                  <span className="result-tag">{modeLabels[result.mode]}</span>
                  <span className="result-note">Review before making a project decision</span>
                </div>
                <article className="result-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.text}</ReactMarkdown>
                </article>
                {result.runFolder && <div className="result-note">Saved to: {result.runFolder}</div>}
                <div className="review-note"><ShieldCheck size={18} /><span>SAI provides decision support. Confirm privacy, safeguarding, accessibility, security, and institutional requirements with the responsible reviewers.</span></div>
              </div>
            )}
          </section>
        </div>

        <section className="principles"><div><span className="principle-number">01</span><strong>Requirements before lifecycle</strong><p>Understand the product and its risks before choosing how to build it.</p></div><div><span className="principle-number">02</span><strong>Evidence over guesswork</strong><p>Use documented education-software practice as comparative evidence.</p></div><div><span className="principle-number">03</span><strong>People stay in control</strong><p>Privacy, safety, accessibility, and release decisions remain human-led.</p></div></section>
      </main>
      <footer className="footer"><span>SAI · Software Architecture Intelligence for Education</span><span>Local-first planning tool</span></footer>
    </div>
  );
}

export default App;
