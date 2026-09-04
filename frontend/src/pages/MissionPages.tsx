import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Difficulty, Empty, ErrorBox, Loading } from '../components/Status';
import { api } from '../services/api';
import type { Mission } from '../types';

function MissionsHeader({
  activeCategory,
  onSelectCategory,
}: {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}) {
  const categories = [
    'All',
    'BOLA / IDOR',
    'SQL Injection',
    'XSS',
    'SSRF',
    'CSRF',
    'File Upload',
    'JWT',
    'Business Logic',
    'Misconfiguration',
    'Supply Chain',
    'Logging & Alerting',
    'Exceptional Conditions',
    'Authentication Failures',
    'Cryptographic Failures',
  ];

  return (
    <div className="mb-6">
      <p className="eyebrow">Mission control · OWASP Top 10:2025</p>
      <h1 className="page-title mt-2">Exploit curriculum</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Choose an objective, start the attempt, interact with the isolated target workbench, and submit evidence.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`pill px-3 py-1 text-xs cursor-pointer transition-colors ${
              activeCategory === cat
                ? 'border-cyan bg-cyan/10 text-cyan font-semibold'
                : 'hover:border-line hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Missions() {
  const [data, setData] = useState<Mission[]>();
  const [error, setError] = useState<unknown>();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    api<{ missions: Mission[] }>('/api/missions')
      .then((x) => setData(x.missions))
      .catch(setError);
  }, []);

  const filtered = data
    ? selectedCategory === 'All'
      ? data
      : data.filter((m) => m.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : [];

  return (
    <>
      <MissionsHeader activeCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      {error ? (
        <ErrorBox error={error} />
      ) : !data ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty>No missions loaded for category "{selectedCategory}".</Empty>
      ) : (
        <div className="grid-auto">
          {filtered.map((m) => (
            <Link key={m.id} to={`/missions/${m.id}`} className="card group relative overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 w-1 ${
                  m.status === 'completed'
                    ? 'bg-acid'
                    : m.status === 'in_progress'
                    ? 'bg-cyan'
                    : 'bg-line'
                }`}
              />
              <div className="flex items-center justify-between">
                <span className="eyebrow">{m.id}</span>
                <Difficulty value={m.difficulty} />
              </div>
              <h2 className="mt-4 text-xl font-semibold group-hover:text-cyan">{m.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{m.objective}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="pill">{m.category}</span>
                <span className="font-mono text-xs uppercase text-acid">{m.status.replace('_', ' ')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function Output({ value }: { value: unknown }) {
  return value ? (
    <pre className="mt-4 max-h-72 overflow-auto rounded-md border border-line bg-black/40 p-4 font-mono text-xs leading-5 text-cyan">
      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </pre>
  ) : null;
}

function LabWorkbench({ mission }: { mission: Mission }) {
  const [out, setOut] = useState<unknown>();
  const [error, setError] = useState<unknown>();
  const [value, setValue] = useState('');
  const [token, setToken] = useState('');
  const [file, setFile] = useState<File>();

  const run = async (path: string, options: RequestInit = {}) => {
    setError(undefined);
    try {
      setOut(await api(path, options));
    } catch (e) {
      setError(e);
    }
  };

  const common = (
    <>
      {error ? (
        <div className="mt-4">
          <ErrorBox error={error} />
        </div>
      ) : null}
      <Output value={out} />
    </>
  );

  if (mission.id === 'VF-001')
    return (
      <div>
        <label>
          <span className="label">Order ID</span>
          <input className="input" value={value || '1001'} onChange={(e) => setValue(e.target.value)} />
        </label>
        <button className="btn mt-3" onClick={() => run(`/api/lab/orders/${value || 1001}`)}>
          Request order
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-002')
    return (
      <div>
        <label>
          <span className="label">Search query</span>
          <input
            className="input font-mono"
            placeholder="Training Router"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() => run(`/api/lab/products/search?q=${encodeURIComponent(value)}`)}
        >
          Search lab catalog
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-003')
    return (
      <div>
        <label>
          <span className="label">Stored ticket message</span>
          <textarea
            className="input font-mono"
            placeholder="Try harmless HTML, then inspect rendering"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <div className="mt-3 flex gap-2">
          <button
            className="btn"
            onClick={() =>
              run('/api/lab/xss/tickets', {
                method: 'POST',
                body: JSON.stringify({ subject: 'Lab render test', message: value }),
              })
            }
          >
            Store payload
          </button>
          <button
            className="btn-ghost"
            onClick={async () => {
              try {
                const x = await api<{ tickets: Array<{ message: string }> }>('/api/lab/xss/tickets');
                setOut(x);
                const preview = document.getElementById('unsafe-preview');
                if (preview) preview.innerHTML = x.tickets.map((t) => t.message).join('<hr>');
              } catch (e) {
                setError(e);
              }
            }}
          >
            Load unsafe preview
          </button>
        </div>
        <div id="unsafe-preview" className="mt-4 min-h-16 rounded border border-red-500/30 bg-red-500/5 p-3 text-sm" />
        <p className="mt-2 text-xs text-red-300">Dedicated unsafe lab render context. Never reuse this pattern in core UI.</p>
        {common}
      </div>
    );

  if (mission.id === 'VF-004')
    return (
      <div>
        <label>
          <span className="label">Destination URL</span>
          <input
            className="input font-mono"
            placeholder="http://lab-internal.local/status"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() => run('/api/lab/ssrf/fetch', { method: 'POST', body: JSON.stringify({ url: value }) })}
        >
          Ask server to fetch
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-005')
    return (
      <div>
        <label>
          <span className="label">New synthetic contact email</span>
          <input
            className="input"
            placeholder="changed@example.local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() => run('/api/lab/csrf/change-email', { method: 'POST', body: JSON.stringify({ email: value }) })}
        >
          Change without CSRF token
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-006')
    return (
      <div>
        <label>
          <span className="label">Harmless training file</span>
          <input className="input" type="file" onChange={(e) => setFile(e.target.files?.[0])} />
        </label>
        <button
          className="btn mt-3"
          onClick={() => {
            if (!file) {
              setError(new Error('Choose a file'));
              return;
            }
            const body = new FormData();
            body.append('file', file);
            run('/api/lab/upload', { method: 'POST', body });
          }}
        >
          Upload to weak validator
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-007')
    return (
      <div className="space-y-3">
        <button
          className="btn-ghost"
          onClick={async () => {
            try {
              const x = await api<{ auth: { token: string } }>('/api/lab/jwt/login', {
                method: 'POST',
                body: JSON.stringify({ username: 'lab-learner', password: 'TrainingJWT!' }),
              });
              setToken(x.auth.token);
              setOut(x);
            } catch (e) {
              setError(e);
            }
          }}
        >
          Issue lab token
        </button>
        <label>
          <span className="label">Bearer token (decode and modify)</span>
          <textarea
            className="input min-h-28 font-mono text-xs"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
        <button
          className="btn"
          onClick={() => run('/api/lab/jwt/profile', { headers: { Authorization: `Bearer ${token}` } })}
        >
          Validate token
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-008')
    return (
      <div>
        <p className="mb-3 text-sm text-muted">
          Catalog product 1 is priced at 12900 cents. The vulnerable request exposes a client-owned unit price.
        </p>
        <label>
          <span className="label">Client unit price (cents)</span>
          <input
            className="input"
            type="number"
            value={value || '12900'}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() =>
            run('/api/lab/checkout', {
              method: 'POST',
              body: JSON.stringify({ productId: 1, quantity: 1, unitPriceCents: Number(value || 12900) }),
            })
          }
        >
          Synthetic checkout
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-009')
    return (
      <div>
        <p className="text-sm text-muted">Enumerate the dedicated lab namespace and operational hints.</p>
        <button className="btn mt-3" onClick={() => run('/api/lab/debug/config')}>
          Inspect debug route
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-010')
    return (
      <div>
        <label>
          <span className="label">Email SQL Payload</span>
          <input
            className="input font-mono"
            placeholder="' OR '1'='1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() =>
            run('/api/lab/sqli/login', {
              method: 'POST',
              body: JSON.stringify({ email: value || "' OR '1'='1", password: 'any' }),
            })
          }
        >
          Execute SQLi login
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-011')
    return (
      <div>
        <p className="text-sm text-muted">Inspect the software supply chain component manifest and lockfile details.</p>
        <button className="btn mt-3" onClick={() => run('/api/lab/supply-chain/manifest')}>
          Retrieve component manifest
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-012')
    return (
      <div>
        <label>
          <span className="label">Log Message (Try adding newlines %0A or \n)</span>
          <textarea
            className="input font-mono text-xs min-h-20"
            placeholder={"User login event\n[CRITICAL] Admin session forged"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() =>
            run('/api/lab/logging/event', {
              method: 'POST',
              body: JSON.stringify({ message: value }),
            })
          }
        >
          Submit log payload
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-013')
    return (
      <div>
        <p className="text-sm text-muted">
          Send malformed payload (or triggerNull: true) to throw an unhandled exception in evaluator state.
        </p>
        <label>
          <span className="label">Payload JSON</span>
          <textarea
            className="input font-mono text-xs min-h-20"
            placeholder='{"triggerNull": true}'
            value={value || '{"triggerNull": true}'}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() => {
            let parsed = {};
            try {
              parsed = JSON.parse(value || '{"triggerNull": true}');
            } catch {
              parsed = { triggerNull: true };
            }
            run('/api/lab/exceptions/process', {
              method: 'POST',
              body: JSON.stringify(parsed),
            });
          }}
        >
          Process evaluator payload
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-014')
    return (
      <div>
        <label>
          <span className="label">Password Guess</span>
          <input
            className="input font-mono"
            placeholder="SuperSecretLabPassword123!"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() =>
            run('/api/lab/auth/bruteforce', {
              method: 'POST',
              body: JSON.stringify({ password: value || 'SuperSecretLabPassword123!' }),
            })
          }
        >
          Test auth attempt
        </button>
        {common}
      </div>
    );

  if (mission.id === 'VF-015')
    return (
      <div>
        <label>
          <span className="label">MD5 Hash Lookup</span>
          <input
            className="input font-mono"
            placeholder="5d41402abc4b2a76b9719d911017c592"
            value={value || '5d41402abc4b2a76b9719d911017c592'}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          className="btn mt-3"
          onClick={() =>
            run('/api/lab/crypto/hash', {
              method: 'POST',
              body: JSON.stringify({ hash: value || '5d41402abc4b2a76b9719d911017c592' }),
            })
          }
        >
          Lookup hash record
        </button>
        {common}
      </div>
    );

  return (
    <div>
      <p className="text-sm text-muted">Enumerate the dedicated lab namespace and operational hints.</p>
      <button className="btn mt-3" onClick={() => run('/api/lab/debug/config')}>
        Inspect debug route
      </button>
      {common}
    </div>
  );
}

export function MissionDetail() {
  const { id } = useParams();
  const [mission, setMission] = useState<Mission>();
  const [error, setError] = useState<unknown>();
  const [hintCount, setHintCount] = useState(0);
  const [evidence, setEvidence] = useState('');
  const [result, setResult] = useState<{ passed: boolean; feedback: string }>();

  const load = () =>
    api<{ mission: Mission }>(`/api/missions/${id}`)
      .then((x) => setMission(x.mission))
      .catch(setError);

  useEffect(() => {
    void load();
  }, [id]);

  if (error) return <ErrorBox error={error} />;
  if (!mission) return <Loading />;

  async function start() {
    try {
      const x = await api<{ mission: Mission }>(`/api/missions/${id}/start`, { method: 'POST' });
      setMission(x.mission);
    } catch (e) {
      setError(e);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const x = await api<{ passed: boolean; feedback: string; mission: Mission }>(
        `/api/missions/${id}/attempt`,
        {
          method: 'POST',
          body: JSON.stringify({ evidence: { notes: evidence, target: mission!.target } }),
        }
      );
      setResult(x);
      setMission(x.mission);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <Link to="/missions" className="eyebrow">
        ← mission board
      </Link>
      <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow">
                {mission.id} · {mission.category}
              </span>
              <Difficulty value={mission.difficulty} />
              <span className="pill">{mission.status}</span>
            </div>
            <h1 className="page-title mt-4">{mission.title}</h1>
            <p className="mt-4 leading-7 text-muted">{mission.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="label">Objective</span>
                <p>{mission.objective}</p>
              </div>
              <div>
                <span className="label">Target</span>
                <code className="text-sm text-cyan">{mission.target}</code>
              </div>
            </div>
            {mission.status === 'available' && (
              <button className="btn mt-6" onClick={start}>
                Start mission
              </button>
            )}
          </section>
          {mission.status !== 'available' && (
            <section className="card">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Attack mode</p>
                  <h2 className="mt-1 text-xl font-semibold">Target workbench</h2>
                </div>
                <span className="pill border-red-500/30 text-red-300">local scope only</span>
              </div>
              <LabWorkbench mission={mission} />
            </section>
          )}
          {mission.status !== 'available' && mission.status !== 'completed' && (
            <form className="card" onSubmit={submit}>
              <p className="eyebrow">Evidence submission</p>
              <h2 className="mt-1 text-xl font-semibold">Request validation</h2>
              <p className="mt-2 text-sm text-muted">
                Describe the request, interesting response, and controlled impact. The backend also requires a matching
                lab event recorded after mission start.
              </p>
              <textarea
                className="input mt-4 min-h-32"
                required
                minLength={20}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Endpoint, modified input, response, and why it demonstrates the weakness…"
              />
              <button className="btn mt-3">Submit attempt</button>
              {result && (
                <div className={`mt-4 ${result.passed ? 'alert' : 'error'}`}>{result.feedback}</div>
              )}
            </form>
          )}
          {mission.defense && (
            <section className="card border-acid/30">
              <p className="eyebrow text-acid">Defense mode unlocked</p>
              <h2 className="mt-2 text-2xl font-semibold">From exploit to control</h2>
              <div className="mt-6 space-y-5">
                <div>
                  <span className="label">Root cause</span>
                  <p>{mission.defense.rootCause}</p>
                </div>
                <div>
                  <span className="label">Remediation</span>
                  <p>{mission.defense.remediation}</p>
                </div>
                <div>
                  <span className="label">Retest</span>
                  <p>{mission.defense.retest}</p>
                </div>
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-4">
          <div className="card">
            <p className="eyebrow">Allowed scope</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Only this local VulnForge instance, synthetic identities, and documented lab targets. No public or
              unrelated private systems.
            </p>
          </div>
          <div className="card">
            <p className="eyebrow">Guided mode</p>
            <p className="mt-3 text-sm text-muted">
              Reveal progressive methodology without immediately disclosing a full exploit.
            </p>
            {mission.hints.slice(0, hintCount).map((h, i) => (
              <div className="alert mt-3" key={h}>
                <b>Hint {i + 1}</b>
                <br />
                {h}
              </div>
            ))}
            {hintCount < mission.hints.length && (
              <button
                className="btn-ghost mt-4 w-full"
                onClick={() => setHintCount((x) => x + 1)}
              >
                Reveal hint {hintCount + 1}
              </button>
            )}
          </div>
          <div className="card">
            <span className="label">Expected evidence</span>
            <p className="text-sm text-muted">{mission.expectedEvidence}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
