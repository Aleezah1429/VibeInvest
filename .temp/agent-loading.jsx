// Agent-specific loading scenes — full-screen "thinking" animations
// Each agent gets a distinct visual character.

// ──────────────────────────────────────────────────────────────────
// SKEPTIC — magnifier sweeps over scrolling web intel
// ──────────────────────────────────────────────────────────────────
function SkepticScene() {
  const lines = [
    'GET techcrunch.com/bazaar-tech-funding ......... 200',
    'PARSING article: "bazaar raises $70M series B" ✓',
    '> founder background: ex-careem ......... [✓]',
    '> competitor scan: foodpanda ......... [active]',
    <span><span className="flag">{'>'} competitor scan: cheetay ......... [SHUT 2023]</span></span>,
    'PARSING reuters.com/bazaar-b2b-kirana ......... ✓',
    '> market saturation in PK b2b grocery .. <span class="hit">low</span>',
    'FETCH dealstreetasia.com/pak-startups ......... ✓',
    <span><span className="flag">{'>'} risk flag: logistics burn tier-2 cities</span></span>,
    'PARSING crunchbase.com/bazaar-technologies ✓',
    '> 47 articles indexed · 12 risks surfaced',
    'GET twitter.com/hamzajawaid ......... 200',
    '> founder twitter activity: 87 posts/mo',
    <span><span className="flag">{'>'} risk flag: margin erosion in q3</span></span>,
    'CROSS-REF investors: tiger, defy, wavemaker ✓',
  ];
  return (
    <div className="skeptic-stage">
      <div className="intel-feed">
        <div>
          {[...lines, ...lines].map((l, i) => (
            <div key={i}>{typeof l === 'string' ? <span dangerouslySetInnerHTML={{ __html: l }} /> : l}</div>
          ))}
        </div>
      </div>
      <div className="magnifier"></div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// MUNSHI — calculator strip + flickering burn-rate counter
// ──────────────────────────────────────────────────────────────────
function MunshiScene() {
  const lines = [
    'GMV annualized .................. Rs 56.0B',
    'CAC per kirana .................. Rs 480',
    'LTV (24mo) ...................... Rs 1,920',
    'LTV / CAC ........................ 4.0×  ✓',
    'gross margin .................... 6.2%   ⚠',
    'net margin ...................... -3.1%  ⚠',
    'monthly burn .................... Rs 38.4M',
    'cash on hand .................... Rs 540M',
    'runway .......................... 14 mo',
    'series A valuation .............. $50M',
    'series B valuation .............. $300M',
    'gmv multiple .................... 1.5×   ok',
    'fintech upside (BNPL) ........... +3× rev',
    'unit econ verdict ............... viable',
  ];
  const [tick, setTick] = useState('Rs 38.4M');
  useEffect(() => {
    const burns = ['Rs 38.4M','Rs 41.2M','Rs 39.8M','Rs 42.1M','Rs 40.6M','Rs 37.9M'];
    let i = 0;
    const id = setInterval(() => { setTick(burns[i % burns.length]); i++; }, 380);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="munshi-stage">
      <div className="calc-strip">
        <div>
          {[...lines, ...lines].map((l, i) => (
            <div key={i} className={l.includes('⚠') ? 'neg' : l.includes('verdict') ? 'total' : ''}>{l}</div>
          ))}
        </div>
      </div>
      <div className="digit-counter">
        <div>
          <div className="label">live burn rate</div>
          <div style={{ marginTop: 2 }}>{tick}<span style={{ fontSize: 14, opacity: 0.6 }}>/mo</span></div>
        </div>
        <div style={{ fontSize: 30, transform: 'rotate(-8deg)', opacity: 0.7 }}>{'\uD83D\uDCB8'}</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// HYPE — glitchy headline + sparkles + marquee
// ──────────────────────────────────────────────────────────────────
function HypeScene() {
  const sparks = [
    { top: '10%', left: '15%', delay: 0 },
    { top: '70%', left: '20%', delay: 0.3 },
    { top: '20%', left: '78%', delay: 0.6 },
    { top: '55%', left: '85%', delay: 0.9 },
    { top: '38%', left: '8%', delay: 1.2 },
    { top: '78%', left: '60%', delay: 0.45 },
    { top: '5%', left: '50%', delay: 0.75 },
  ];
  return (
    <div className="hype-stage">
      {sparks.map((s, i) => (
        <div key={i} className="spark" style={{ top: s.top, left: s.left, animationDelay: `${s.delay}s` }}></div>
      ))}
      <div className="hype-glitch" data-text="ICONIC">ICONIC</div>
      <div style={{
        position: 'absolute', top: 60, left: 20, right: 20,
        display: 'flex', gap: 6, flexWrap: 'wrap',
        fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(167,139,250,0.7)',
      }}>
        <span>{'>'} scraping social...</span>
        <span style={{ marginLeft: 'auto', color: 'var(--violet)' }}>{'\u25CF'} 12.4k followers</span>
      </div>
      <div style={{
        position: 'absolute', bottom: 56, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(167,139,250,0.7)',
      }}>
        <span>brand sentiment +84%</span>
        <span>founder trust 9/10</span>
      </div>
      <div className="hype-marquee">
        <div>
          {Array(2).fill(0).map((_, i) => (
            <span key={i}>
              <span style={{ margin: '0 18px' }}>vibes</span><span style={{ margin: '0 18px' }}>{'\u2726'}</span>
              <span style={{ margin: '0 18px' }}>iconic</span><span style={{ margin: '0 18px' }}>{'\u2726'}</span>
              <span style={{ margin: '0 18px' }}>slay</span><span style={{ margin: '0 18px' }}>{'\u2726'}</span>
              <span style={{ margin: '0 18px' }}>main character</span><span style={{ margin: '0 18px' }}>{'\u2726'}</span>
              <span style={{ margin: '0 18px' }}>moat</span><span style={{ margin: '0 18px' }}>{'\u2726'}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// CVO — orchestrator: 3 source nodes flowing into rotating aura
// ──────────────────────────────────────────────────────────────────
function CVOScene() {
  return (
    <div className="cvo-stage">
      <div className="cvo-ring"></div>
      <span className="cvo-crown">{'\uD83D\uDC51'}</span>

      <div className="cvo-node n1" title="from skeptic">{'\uD83D\uDD0D'}</div>
      <div className="cvo-node n2" title="from munshi">{'\uD83D\uDCB0'}</div>
      <div className="cvo-node n3" title="from hype">{'\u2728'}</div>

      <div style={{
        position: 'absolute', top: 14, left: 14, right: 14,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--mute)',
      }}>
        <span>{'>'} synthesizing 47 datapoints</span>
        <span className="accent-fg">{'\u25CF'} weighing</span>
      </div>
      <div style={{
        position: 'absolute', bottom: 14, left: 14, right: 14,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--mute)',
      }}>
        <span>resolving 3 conflicts...</span>
        <span>verdict pending</span>
      </div>
    </div>
  );
}

const AGENT_SCENES = {
  skeptic: SkepticScene,
  munshi: MunshiScene,
  hype: HypeScene,
  cvo: CVOScene,
};

// ──────────────────────────────────────────────────────────────────
// SPOTLIGHT — full-screen agent thinking sequence
// Cycles through 4 agents, each ~3s, then onDone
// ──────────────────────────────────────────────────────────────────
function AgentSpotlight({ startup, onDone }) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 within current agent

  useEffect(() => {
    setProgress(0);
    const dur = 3200;
    const start = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        setTimeout(() => {
          if (idx < AGENT_LIST.length - 1) setIdx(idx + 1);
          else onDone();
        }, 350);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [idx]);

  const agent = AGENT_LIST[idx];
  const Scene = AGENT_SCENES[agent.key];

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* status bar row */}
      <div className="pad-x" style={{ paddingTop: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="eyebrow">{'\u25B8'} step 02 · agents working</span>
        <span className="mono small mute-fg">{idx + 1} / {AGENT_LIST.length}</span>
      </div>

      {/* target */}
      <div className="pad-x" style={{ marginTop: 14 }}>
        <span className="sticker ghost">target {'\u2192'} {startup.toLowerCase()}</span>
      </div>

      {/* agent header */}
      <div className="pad-x" style={{ marginTop: 18 }} key={agent.key}>
        <div className="slide-up" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--elev)', border: '1px solid var(--line-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, position: 'relative',
          }}>
            {agent.emoji}
            <span style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 14, height: 14, borderRadius: 99,
              background: agent.avatarBg, border: '2px solid var(--bg)',
            }}></span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ color: agent.avatarBg }}>
              {agent.role.toLowerCase()}
            </div>
            <div className="h1 serif-i" style={{ marginTop: 2 }}>{agent.name.toLowerCase()}</div>
          </div>
        </div>

        <p className="body mute-fg" style={{ marginTop: 14 }} key={'desc-' + idx}>
          <span className="slide-up">{agent.sayings[Math.floor(progress * (agent.sayings.length - 0.01))]}<span className="cursor"></span></span>
        </p>
      </div>

      {/* SCENE */}
      <div className="pad-x" style={{ marginTop: 20 }} key={'sc-' + idx}>
        <div className="fade-in"><Scene /></div>
      </div>

      {/* per-agent stat strip */}
      <div className="pad-x" style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {AGENT_LIST.map((a, i) => (
            <div key={a.key} style={{ flex: 1 }}>
              <div style={{ height: 3, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: i < idx ? '100%' : i === idx ? `${progress * 100}%` : '0%',
                  background: a.avatarBg,
                  transition: 'width .1s linear',
                }}></div>
              </div>
              <div className="mono" style={{ fontSize: 9, marginTop: 4, color: i <= idx ? 'var(--ink)' : 'var(--mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {a.name.replace('The ', '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* skip / hint */}
      <div className="pad-x" style={{ position: 'absolute', bottom: 50, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="mono small mute-fg">{'>'} 4 agents · ~12s irl</span>
        <button onClick={onDone} className="chip" style={{ padding: '6px 12px', fontSize: 12 }}>
          skip {'\u2192'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  SkepticScene, MunshiScene, HypeScene, CVOScene, AgentSpotlight,
});
