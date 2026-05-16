// Screens: Splash, Input, Handoff (Activating replaced by AgentSpotlight)
// =================================================================

const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// 01. SPLASH — sophisticated dark, signature lime accent
// ─────────────────────────────────────────────────────────────
function SplashScreen({ onStart }) {
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* top bar */}
      <div className="pad-x" style={{ paddingTop: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="eyebrow">v1.0 / beta</span>
        <span className="mono small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)' }} className="pulse"></span>
          <span className="mute-fg">4 agents online</span>
        </span>
      </div>

      {/* hero */}
      <div className="pad-x" style={{ marginTop: 36 }}>
        <span className="sticker"><span style={{ color: 'var(--accent)' }}>{'\u25C6'}</span> due diligence · 12 seconds</span>
        <h1 style={{ margin: '14px 0 0', fontFamily: 'Instrument Serif, serif', fontSize: 68, lineHeight: 0.9, letterSpacing: '-0.025em' }}>
          Vibe<br/>
          <span className="serif-i" style={{ color: 'var(--accent)' }}>Invest.</span>
        </h1>
        <p className="body mute-fg" style={{ marginTop: 14, maxWidth: 320 }}>
          type any startup. four AI agents research the web, financials, and brand. you get the verdict.
        </p>
      </div>

      {/* agent roster */}
      <div className="pad-x" style={{ marginTop: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>{'\u25B8'} the room</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {AGENT_LIST.map((a, i) => (
            <div key={a.key} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 12,
              border: '1px solid var(--line)', background: 'var(--surface)',
              animation: `slideUp .5s ${i * 0.07}s both`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'var(--elev)', border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, position: 'relative', flexShrink: 0,
              }}>
                {a.emoji}
                <span style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: 99, background: a.avatarBg, border: '1.5px solid var(--surface)' }}></span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                <div className="mono mute-fg" style={{ marginTop: 0, fontSize: 10.5 }}>{a.tag}</div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>{'\u2192'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA + marquee dock */}
      <div style={{ position: 'absolute', bottom: 44, left: 0, right: 0 }}>
        <div style={{
          borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
          padding: '8px 0', background: 'var(--surface)', marginBottom: 14,
        }} className="marquee">
          <div className="marquee-track serif-i" style={{ fontSize: 18 }}>
            {Array(2).fill(0).map((_, i) => (
              <span key={i}>
                <span style={{ margin: '0 18px' }}>invest</span>
                <span style={{ margin: '0 18px', color: 'var(--accent)' }}>{'\u2726'}</span>
                <span style={{ margin: '0 18px' }}>iterate</span>
                <span style={{ margin: '0 18px', color: 'var(--violet)' }}>{'\u2726'}</span>
                <span style={{ margin: '0 18px' }}>pivot</span>
                <span style={{ margin: '0 18px', color: 'var(--gold)' }}>{'\u2726'}</span>
                <span style={{ margin: '0 18px' }}>pass</span>
                <span style={{ margin: '0 18px', color: 'var(--punch)' }}>{'\u2726'}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="pad-x">
          <button className="btn accent" onClick={onStart}>
            <span>vibe check a startup</span>
            <span style={{ fontSize: 22 }}>{'\u2192'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 02. INPUT — sophisticated, monospace-coded form field
// ─────────────────────────────────────────────────────────────
function InputScreen({ onBack, onSubmit }) {
  const [value, setValue] = useState('Bazaar Technologies');
  const trending = ['Airlift', 'Bazaar Technologies', 'Krave Mart', 'Retailo', 'Tag', 'Truck.it'];

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div className="pad-x" style={{ paddingTop: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="chip" onClick={onBack} style={{ padding: '6px 12px', fontSize: 12 }}>{'\u2190'} back</button>
        <span className="eyebrow">step 01 / 04</span>
      </div>

      <div className="pad-x" style={{ marginTop: 40 }}>
        <span className="eyebrow accent-fg">{'\u25B8'} input</span>
        <h1 className="h1" style={{ margin: '10px 0 0', fontSize: 38, lineHeight: 1.05 }}>
          drop a name.<br/>
          <span className="serif-i accent-fg">we{'\u2019'}ll roast it.</span>
        </h1>
        <p className="body mute-fg" style={{ marginTop: 14 }}>
          any startup, public or stealth. our agents do the dirty work.
        </p>
      </div>

      {/* input */}
      <div className="pad-x" style={{ marginTop: 28 }}>
        <div style={{
          border: '1px solid var(--line-strong)', borderRadius: 16,
          background: 'var(--surface)', padding: '4px 4px 4px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span className="mono mute-fg" style={{ fontSize: 13 }}>{'>'}</span>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="type a startup..."
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 500,
              padding: '14px 0', color: 'var(--ink)',
            }}
          />
          <button
            onClick={() => value.trim() && onSubmit(value.trim())}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--accent)', color: '#0A0A0C',
              border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 700,
            }}
          >{'\u2192'}</button>
        </div>
        <div className="mono small mute-fg" style={{ marginTop: 10, display: 'flex', gap: 10 }}>
          <span>{'\u25CF'} web scan</span>
          <span>{'\u25CF'} financials</span>
          <span>{'\u25CF'} brand</span>
        </div>
      </div>

      {/* trending */}
      <div className="pad-x" style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="eyebrow">trending in PK</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {trending.map(t => (
            <button key={t} className={'chip ' + (t === value ? 'active' : '')} onClick={() => setValue(t)}>
              {t === value && <span style={{ color: 'var(--accent)' }}>{'\u25CF'}</span>}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* live counter */}
      <div className="pad-x" style={{ position: 'absolute', bottom: 50, left: 0, right: 0 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)' }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)' }} className="pulse"></div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">vibes checked today</div>
            <div className="h3" style={{ marginTop: 4 }}>2,847 startups <span className="accent-fg">{'\u2197'}</span></div>
          </div>
          <span className="serif-i accent-fg" style={{ fontSize: 30 }}>{'\u2728'}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 04. HANDOFF CHAT — agents discussing findings
// ─────────────────────────────────────────────────────────────
const CHAT_SCRIPT = [
  { agent: 'skeptic', text: 'yo team. did the deep scan. 47 articles, 12 funding rounds reviewed.' },
  { agent: 'skeptic', text: 'competitors: Foodpanda (consumer), Cheetay (DEAD), HungerHut. but Bazaar is B2B kirana \u2192 much less crowded.' },
  { agent: 'skeptic', text: 'red flag: logistics burn in tier-2 cities. risk = high.', flag: true },
  { handoff: 'skeptic \u2192 munshi' },
  { agent: 'munshi', text: 'okay let me crunch. $50M raised across A & B. GMV ~$200M annualized.' },
  { agent: 'munshi', text: 'burn ~Rs 38M/mo. runway 14 months. tight but viable.' },
  { agent: 'munshi', text: 'margins thin (~6%). need to fix or bleed. but b2b fintech upside is real.' },
  { handoff: 'munshi \u2192 hype' },
  { agent: 'hype', text: 'okay slay. B2B kiranas as the target? chef\u2019s kiss.' },
  { agent: 'hype', text: 'founder ex-Careem = credibility. twitter game: 12k engaged. press: TechCrunch + Reuters.' },
  { agent: 'hype', text: 'brand vibes: trustworthy, gritty, very PK-coded. regional potential.' },
  { handoff: '3 reports \u2192 CVO' },
  { agent: 'cvo', text: 'synthesizing. skeptic flagged logistics. munshi confirms margin risk. hype says trust is the moat.' },
  { agent: 'cvo', text: 'weighting risk \u00D7 upside \u00D7 vibe...' },
  { agent: 'cvo', text: 'verdict locked. tap to reveal the aura score.', final: true },
];

function HandoffScreen({ startup, onReveal, onSkip }) {
  const [step, setStep] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (step >= CHAT_SCRIPT.length) return;
    const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 400 : 950);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [step]);

  const messages = CHAT_SCRIPT.slice(0, step);
  const final = step >= CHAT_SCRIPT.length;

  return (
    <div className="screen" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div className="pad-x" style={{ paddingTop: 58, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="eyebrow"><span className="pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 99, background: 'var(--accent)', marginRight: 6, verticalAlign: 'middle' }}></span>agent room · live</span>
          <button onClick={onSkip} className="mono small mute-fg" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>skip {'\u2192'}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, minWidth: 0 }}>
          <h3 className="h3" style={{ margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{startup}</h3>
          <span className="sticker ghost" style={{ flexShrink: 0 }}>4 in room</span>
        </div>
        <div style={{ display: 'flex', marginTop: 10 }}>
          {AGENT_LIST.map((a, i) => (
            <div key={a.key} style={{
              width: 24, height: 24, borderRadius: 7,
              background: 'var(--elev)', border: '1px solid var(--line-strong)',
              marginLeft: i ? -6 : 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 12,
              position: 'relative',
            }}>
              {a.emoji}
              <span style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, borderRadius: 99, background: a.avatarBg, border: '1.5px solid var(--bg)' }}></span>
            </div>
          ))}
        </div>
      </div>

      {/* chat */}
      <div ref={scrollRef} className="scroll" style={{ flex: 1, padding: '16px 18px' }}>
        {messages.map((m, i) => {
          if (m.handoff) {
            return (
              <div key={i} className="slide-up" style={{
                display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0',
              }}>
                <div style={{ flex: 1, height: 1 }} className="dotline"></div>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{m.handoff}</span>
                <div style={{ flex: 1, height: 1 }} className="dotline"></div>
              </div>
            );
          }
          const a = AGENTS[m.agent];
          return (
            <div key={i} className="slide-up" style={{
              display: 'flex', gap: 10, marginBottom: 12,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'var(--elev)', border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, position: 'relative',
              }}>
                {a.emoji}
                <span style={{ position: 'absolute', bottom: -2, right: -2, width: 9, height: 9, borderRadius: 99, background: a.avatarBg, border: '1.5px solid var(--bg)' }}></span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{a.name.replace('The ', '')}</span>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--mute)' }}>{a.role}</span>
                </div>
                <div className={'bubble' + (m.flag ? ' flagged' : '')} style={{
                  background: m.final ? 'var(--accent)' : 'var(--surface)',
                  color: m.final ? '#0A0A0C' : 'var(--ink)',
                  borderColor: m.final ? 'var(--accent)' : (m.flag ? 'rgba(255,107,107,0.45)' : 'var(--line)'),
                }}>
                  {m.flag && <span className="sticker punch" style={{ fontSize: 9, marginRight: 6, padding: '2px 8px' }}>{'\u26A0'} flag</span>}
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        {!final && (
          <div style={{ display: 'flex', gap: 10, padding: '6px 0' }}>
            <div style={{ width: 34 }}></div>
            <div className="mono small pulse mute-fg">{'\u25CF\u25CF\u25CF'}</div>
          </div>
        )}
      </div>

      {/* CTA dock */}
      {final && (
        <div className="pad-x slide-up" style={{ paddingBottom: 50, paddingTop: 12, borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
          <button className="btn accent" onClick={onReveal}>
            <span>reveal aura score</span>
            <span className="serif-i" style={{ fontSize: 22 }}>{'\u2728'} {'\u2192'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SplashScreen, InputScreen, HandoffScreen });
