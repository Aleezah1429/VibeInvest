// Screens: Aura Score Reveal, Full Report, Actions — dark aesthetic
// =================================================================

// ─────────────────────────────────────────────────────────────
// 05. AURA SCORE REVEAL
// ─────────────────────────────────────────────────────────────
function ScoreReveal({ startup, score = 810, breakdown, verdict = 'INVEST', onNext }) {
  const [n, setN] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const target = score;
    const duration = 1800;
    const start = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        setStage(1);
        setTimeout(() => setStage(2), 700);
        setTimeout(() => setStage(3), 1500);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* ambient lime glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,255,61,0.18), transparent 60%)',
        pointerEvents: 'none',
      }}></div>

      {/* top */}
      <div className="pad-x" style={{ paddingTop: 58, display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        <span className="eyebrow accent-fg">{'\u25B8'} aura score · final</span>
        <span className="mono small mute-fg">cvo verdict</span>
      </div>

      <div className="pad-x" style={{ paddingTop: 20, position: 'relative' }}>
        <span className="sticker"><span style={{ fontSize: 12 }}>{'\uD83D\uDC51'}</span> {startup.toLowerCase()}</span>
      </div>

      {/* big score */}
      <div style={{ textAlign: 'center', marginTop: 8, position: 'relative' }}>
        <div className="score-num accent-fg" style={{
          textShadow: '0 0 80px rgba(212,255,61,0.35)',
        }}>{n}</div>
        <div style={{ marginTop: -10 }}>
          <span className="mono small mute-fg">/ 1000</span>
        </div>
      </div>

      {/* breakdown */}
      <div className="pad-x" style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: stage >= 1 ? 1 : 0, transition: 'opacity .5s' }}>
          {breakdown.map((b, i) => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20, width: 26, textAlign: 'center' }}>{b.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{b.label}</span>
                  <span className="mono" style={{ fontSize: 12, color: b.color, fontWeight: 600 }}>
                    {b.value}<span className="mute-fg" style={{ fontWeight: 400 }}>/10</span>
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--elev)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: stage >= 1 ? `${b.value * 10}%` : '0%',
                    height: '100%', background: b.color,
                    transition: `width .9s cubic-bezier(.2,.7,.2,1) ${i * 0.12}s`,
                  }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* verdict stamp */}
      <div style={{
        textAlign: 'center', marginTop: 32, height: 80,
        opacity: stage >= 2 ? 1 : 0,
        transform: stage >= 2 ? 'scale(1) rotate(-5deg)' : 'scale(0.5) rotate(-5deg)',
        transition: 'all .5s cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{
          display: 'inline-block', padding: '12px 26px',
          border: '3px solid var(--accent)', color: 'var(--accent)',
          fontFamily: 'Space Grotesk', fontWeight: 700,
          fontSize: 30, letterSpacing: '0.1em',
          borderRadius: 10,
        }}>{verdict}</div>
      </div>

      {/* CVO quote */}
      <div className="pad-x" style={{ marginTop: 10, opacity: stage >= 2 ? 1 : 0, transition: 'opacity .6s .2s' }}>
        <div className="card" style={{ display: 'flex', gap: 10, background: 'var(--surface)' }}>
          <span style={{ fontSize: 22 }}>{'\uD83D\uDC51'}</span>
          <p className="serif-i" style={{ fontSize: 16, lineHeight: 1.3, margin: 0 }}>
            {'\u201C'}solid bet. risk is real but moat is realer. write the check {'\u2014'} but lead with margin questions.{'\u201D'}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="pad-x" style={{ position: 'absolute', bottom: 50, left: 0, right: 0, opacity: stage >= 3 ? 1 : 0, transition: 'opacity .5s' }}>
        <button className="btn accent" onClick={onNext}>
          <span>read full report</span>
          <span style={{ fontSize: 22 }}>{'\u2192'}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 06. FULL REPORT
// ─────────────────────────────────────────────────────────────
const REPORT_TABS = ['Overview', 'Funding', 'Market', 'Risks', 'Strengths'];

function FullReport({ startup, score, verdict, onNext, onBack }) {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="screen" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ background: 'var(--surface)', paddingTop: 56, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
        <div className="pad-x" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onBack} className="chip" style={{ padding: '5px 11px', fontSize: 12 }}>{'\u2190'} score</button>
          <span className="mono small mute-fg">report · 4 agents</span>
        </div>
        <div className="pad-x" style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <span className="eyebrow">target</span>
            <div className="h2" style={{ marginTop: 4, fontSize: 28 }}>{startup}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="serif-i accent-fg" style={{ fontSize: 50, lineHeight: 0.9 }}>{score}</div>
            <div className="mono small mute-fg">/ 1000</div>
          </div>
        </div>
        <div className="pad-x" style={{ marginTop: 12, display: 'flex', gap: 6 }}>
          <span className="sticker accent">{verdict}</span>
          <span className="sticker ghost">B2B · seed→A</span>
          <span className="sticker ghost">karachi, pk</span>
        </div>
      </div>

      {/* tabs */}
      <div style={{ borderBottom: '1px solid var(--line)', padding: '12px 18px', background: 'var(--bg)' }}>
        <div className="tabs">
          {REPORT_TABS.map(t => (
            <button key={t} className={'tab ' + (tab === t ? 'active' : '')} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, padding: '16px 18px 110px' }}>
        {tab === 'Overview' && <OverviewTab />}
        {tab === 'Funding' && <FundingTab />}
        {tab === 'Market' && <MarketTab />}
        {tab === 'Risks' && <RisksTab />}
        {tab === 'Strengths' && <StrengthsTab />}
      </div>

      <div className="pad-x" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingBottom: 50, paddingTop: 12,
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
      }}>
        <button className="btn accent" onClick={onNext}>
          <span>generate deliverables</span>
          <span className="serif-i" style={{ fontSize: 22 }}>{'\u2728'} {'\u2192'}</span>
        </button>
      </div>
    </div>
  );
}

function AgentNote({ agent, text }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: 'var(--elev)', border: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0, position: 'relative',
      }}>
        {agent.emoji}
        <span style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: 99, background: agent.avatarBg, border: '1.5px solid var(--bg)' }}></span>
      </div>
      <div className="bubble" style={{ flex: 1, padding: '10px 12px' }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--mute)', marginBottom: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{agent.name.replace('The ', '')}</div>
        <div style={{ fontSize: 13 }}>{text}</div>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="slide-up">
      <div className="eyebrow" style={{ marginBottom: 10 }}>executive vibe check</div>
      <div className="card" style={{ marginBottom: 14 }}>
        <p className="body" style={{ margin: 0 }}>
          Bazaar Technologies is a B2B SaaS-enabled marketplace for kirana stores in PK. Strong founder pedigree (ex-Careem). Solid funding ($50M). <span className="accent-fg">Margin pressure is the real story.</span>
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <Stat label="founded" value="2020" />
        <Stat label="hq" value="karachi" />
        <Stat label="employees" value="~600" />
        <Stat label="total raised" value="$50M+" />
      </div>
      <div className="eyebrow" style={{ marginBottom: 10 }}>what each agent thinks</div>
      <AgentNote agent={AGENTS.skeptic} text="competitor moat is thinner than they think. logistics still a beast." />
      <AgentNote agent={AGENTS.munshi} text="margins thin. layer fintech (BNPL for kiranas) = unlock." />
      <AgentNote agent={AGENTS.hype} text="brand trust w/ small shopkeepers is unfair advantage. ride it." />
      <AgentNote agent={AGENTS.cvo} text="net: invest, but lead with margin questions in your first meeting." />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="eyebrow">{label}</div>
      <div className="h3" style={{ marginTop: 6 }}>{value}</div>
    </div>
  );
}

function FundingTab() {
  const rounds = [
    { round: 'Pre-seed', amount: '$1.3M', year: '2020', lead: 'Indus Valley Capital' },
    { round: 'Seed',     amount: '$6.5M', year: '2021', lead: 'Defy Partners' },
    { round: 'Series A', amount: '$30M',  year: '2021', lead: 'Wavemaker' },
    { round: 'Series B', amount: '$70M',  year: '2022', lead: 'Tiger Global' },
  ];
  return (
    <div className="slide-up">
      <div className="eyebrow" style={{ marginBottom: 12 }}>funding history</div>
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        <div style={{ position: 'absolute', left: 6, top: 10, bottom: 10, width: 1, background: 'var(--line-strong)' }}></div>
        {rounds.map((r, i) => (
          <div key={i} style={{ position: 'relative', marginBottom: 12 }}>
            <div style={{
              position: 'absolute', left: -20, top: 14,
              width: 13, height: 13, borderRadius: 99,
              background: i === rounds.length - 1 ? 'var(--accent)' : 'var(--bg)',
              border: '2px solid ' + (i === rounds.length - 1 ? 'var(--accent)' : 'var(--line-strong)'),
            }}></div>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.round}</span>
                <span className="mono small mute-fg">{r.year}</span>
              </div>
              <div className="serif-i" style={{ fontSize: 30, lineHeight: 1, marginTop: 4 }}>{r.amount}</div>
              <div className="mono small mute-fg" style={{ marginTop: 6 }}>lead {'\u2022'} {r.lead}</div>
            </div>
          </div>
        ))}
      </div>
      <AgentNote agent={AGENTS.munshi} text="tiger came in hot at Series B. valuation probably ~$300M. current GMV multiple sits at ~1.5×. fair, not bubbly." />
    </div>
  );
}

function MarketTab() {
  const competitors = [
    { name: 'Tazah',   status: 'active', strength: 6 },
    { name: 'Retailo', status: 'active', strength: 7 },
    { name: 'Jugnu',   status: 'active', strength: 5 },
    { name: 'Cheetay', status: 'shut',   strength: 0 },
  ];
  return (
    <div className="slide-up">
      <div className="eyebrow" style={{ marginBottom: 12 }}>competitor landscape</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {competitors.map(c => (
          <div key={c.name} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: c.status === 'shut' ? 'var(--surface)' : 'var(--elev)',
              color: c.status === 'shut' ? 'var(--mute)' : 'var(--ink)',
              border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 14,
            }}>{c.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
              <div className="mono small mute-fg" style={{ marginTop: 2 }}>
                {c.status === 'shut' ? 'shut down · 2023' : `competitor strength ${c.strength}/10`}
              </div>
            </div>
            {c.status === 'shut' ? (
              <span className="sticker punch" style={{ fontSize: 9 }}>DEAD</span>
            ) : (
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{
                    width: 3, height: 14,
                    background: i < c.strength ? 'var(--ink)' : 'var(--elev)',
                    borderRadius: 1,
                  }}></div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <AgentNote agent={AGENTS.skeptic} text="3 alive competitors. cheetay closing is a tailwind. bazaar leads on capital + execution speed. moat = relationships with 50k+ kiranas." />
    </div>
  );
}

function RisksTab() {
  const risks = [
    { sev: 'high', label: 'Logistics burn in tier-2 cities', note: 'each new city = 6-9 mo to unit-econ positive.' },
    { sev: 'high', label: 'Thin margins (~6%)', note: 'one bad quarter and runway shrinks fast.' },
    { sev: 'med',  label: 'Pakistan macro risk',  note: 'currency volatility hits dollar-denominated raises.' },
    { sev: 'low',  label: 'Founder concentration', note: 'product depth on 2 cofounders. bus factor.' },
  ];
  const sevColor = { high: 'var(--punch)', med: 'var(--orange)', low: 'var(--gold)' };
  return (
    <div className="slide-up">
      <div className="eyebrow" style={{ marginBottom: 12 }}>{'\u26A0'} risks & red flags</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {risks.map(r => (
          <div key={r.label} className="card" style={{ padding: 14, borderLeft: `3px solid ${sevColor[r.sev]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</span>
              <span style={{
                fontFamily: 'JetBrains Mono', fontSize: 9, padding: '2px 8px',
                background: sevColor[r.sev] + '22', color: sevColor[r.sev], borderRadius: 99,
                textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em',
                border: `1px solid ${sevColor[r.sev]}55`,
              }}>{r.sev}</span>
            </div>
            <p className="small mute-fg" style={{ margin: '6px 0 0' }}>{r.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrengthsTab() {
  const strengths = [
    { emoji: '\uD83C\uDFC6', label: 'Founder pedigree',           note: 'ex-Careem leadership. they\u2019ve scaled this region before.' },
    { emoji: '\uD83D\uDD17', label: '50k+ kirana relationships',  note: 'the actual moat. takes 5 years to replicate.' },
    { emoji: '\uD83D\uDCB8', label: 'Capital efficiency',         note: 'raised less than indian peers w/ similar GMV.' },
    { emoji: '\u26A1',       label: 'Fintech optionality',        note: 'BNPL/lending layer = 3× revenue potential without new acquisition.' },
  ];
  return (
    <div className="slide-up">
      <div className="eyebrow" style={{ marginBottom: 12 }}>{'\uD83D\uDCAA'} strengths</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {strengths.map(s => (
          <div key={s.label} className="card" style={{ padding: 14, display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</div>
              <p className="small mute-fg" style={{ margin: '4px 0 0' }}>{s.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 07. ACTIONS — CVO-generated deliverables
// ─────────────────────────────────────────────────────────────
function ActionsScreen({ startup, onBack, onRestart }) {
  const [open, setOpen] = useState('brief');

  const deliverables = [
    {
      key: 'brief', emoji: '\uD83D\uDCC4', title: 'Investor Brief',
      sub: '2-page PDF · tl;dr + appendix', color: 'var(--accent)',
      bullets: [
        'Aura Score: 810 / 1000',
        'Verdict: INVEST',
        'Stage: Series A \u2192 B bridge',
        'Suggested check size: $250k–$500k',
        'Co-investor signal: Tiger, Defy, Wavemaker on cap table',
      ],
    },
    {
      key: 'questions', emoji: '\u2754', title: 'Questions to Ask',
      sub: '12 sharp questions for the founder', color: 'var(--violet)',
      bullets: [
        'How do you plan to push margins above 10%?',
        'What\u2019s the path to fintech revenue per kirana?',
        'When do tier-2 cities turn unit-econ positive?',
        'What\u2019s your dollar-denominated raise hedge?',
        'Who owns the kirana relationship — you or the rep?',
        '+ 7 more',
      ],
    },
    {
      key: 'memo', emoji: '\uD83D\uDCDD', title: 'Deal Memo Draft',
      sub: 'Editable doc · 800 words', color: 'var(--gold)',
      bullets: [
        'Thesis · why now',
        'Market · $25B TAM, 5M kiranas',
        'Team · ex-Careem, executed 2× before',
        'Risks · margin, logistics, macro',
        'Recommendation · INVEST · $300k @ $350M valuation',
      ],
    },
  ];

  return (
    <div className="screen" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div className="pad-x" style={{ paddingTop: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="chip" onClick={onBack} style={{ padding: '6px 12px', fontSize: 12 }}>{'\u2190'}</button>
        <span className="eyebrow">step 04 / 04 · final</span>
      </div>

      <div className="pad-x" style={{ marginTop: 14 }}>
        <span className="eyebrow accent-fg">{'\u2728'} cvo auto-generated</span>
        <h1 className="h1" style={{ margin: '8px 0 4px', fontSize: 34 }}>
          your <span className="serif-i accent-fg">3 deliverables</span>
        </h1>
        <p className="body mute-fg" style={{ margin: 0 }}>ready to send. ready to share.</p>
      </div>

      <div className="scroll" style={{ flex: 1, padding: '18px 18px 110px' }}>
        {deliverables.map((d, i) => {
          const isOpen = open === d.key;
          return (
            <div key={d.key} style={{
              marginBottom: 10,
              animation: `slideUp .5s ${i * 0.1}s both`,
            }}>
              <button
                onClick={() => setOpen(isOpen ? null : d.key)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderLeft: `3px solid ${d.color}`,
                  borderRadius: isOpen ? '16px 16px 0 0' : 16,
                  borderBottomWidth: isOpen ? 0 : '1px',
                  padding: 14, cursor: 'pointer',
                  color: 'var(--ink)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  fontFamily: 'inherit',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--elev)', border: '1px solid var(--line-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>{d.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{d.title}</div>
                  <div className="mono small mute-fg" style={{ marginTop: 2 }}>{d.sub}</div>
                </div>
                <span className="mute-fg" style={{ fontSize: 20, transform: isOpen ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform .2s' }}>+</span>
              </button>
              {isOpen && (
                <div style={{
                  border: '1px solid var(--line)', borderTop: 'none', borderLeft: `3px solid ${d.color}`,
                  borderRadius: '0 0 16px 16px', background: 'var(--surface)',
                  padding: 14,
                }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {d.bullets.map((b, j) => (
                      <li key={j} style={{ display: 'flex', gap: 10, fontSize: 13, lineHeight: 1.45 }}>
                        <span className="mono mute-fg" style={{ fontSize: 11 }}>{String(j + 1).padStart(2, '0')}</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button className="chip" style={{ flex: 1, justifyContent: 'center' }}>{'\u2193'} download</button>
                    <button className="chip" style={{ flex: 1, justifyContent: 'center' }}>{'\u2197'} share</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* footer */}
        <div className="card" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, var(--accent), var(--violet), var(--punch), var(--gold), var(--accent))',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18 }}>{'\u2728'}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">vibe·invest</div>
            <div className="h3" style={{ marginTop: 3 }}>that{'\u2019'}s a wrap on {startup}.</div>
          </div>
        </div>
      </div>

      <div className="pad-x" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingBottom: 50, paddingTop: 12,
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
      }}>
        <button className="btn accent" onClick={onRestart}>
          <span>vibe check another startup</span>
          <span style={{ fontSize: 22 }}>{'\u2192'}</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ScoreReveal, FullReport, ActionsScreen });
