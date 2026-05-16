// Main app: screen routing, theme tweaks, mounts in iOS frame
// =================================================================

const { useState: useS, useEffect: useE } = React;

const PALETTES = {
  onyx:    { bg: '#0A0A0C', surface: '#131318', elev: '#1C1C22', ink: '#F2F0EA', paper: '#131318', mute: '#7C7C86', line: '#26262C', 'line-strong': '#3A3A42', accent: '#D4FF3D', violet: '#A78BFA', punch: '#FF6B6B', orange: '#FF9F5A', gold: '#FFC83C' },
  ivory:   { bg: '#F4F1EA', surface: '#FBF9F3', elev: '#FFFFFF', ink: '#0E0E10', paper: '#FBF9F3', mute: '#6B6B72', line: '#E5E0D5', 'line-strong': '#C7C1B2', accent: '#3E5A1A', violet: '#5B4BD6', punch: '#C73E3E', orange: '#D67318', gold: '#B58A0C' },
  terminal:{ bg: '#000000', surface: '#0A0F0A', elev: '#121912', ink: '#E8FFD4', paper: '#0A0F0A', mute: '#5C8050', line: '#1A2A1A', 'line-strong': '#2E4A2E', accent: '#5CFF66', violet: '#A8FF9E', punch: '#FF6B6B', orange: '#FFA94D', gold: '#FFD24A' },
  noir:    { bg: '#0E0B14', surface: '#181221', elev: '#22192E', ink: '#F2EAFF', paper: '#181221', mute: '#8074A0', line: '#2A2138', 'line-strong': '#3E3252', accent: '#C8A6FF', violet: '#FF8FE0', punch: '#FF6B9A', orange: '#FFB07A', gold: '#FFC83C' },
};

const SCREENS = ['splash', 'input', 'spotlight', 'handoff', 'reveal', 'report', 'actions'];

function VibeApp({ t }) {
  const [screen, setScreen] = useS('splash');
  const [startup, setStartup] = useS(t.startup || 'Bazaar Technologies');

  useE(() => {
    const p = PALETTES[t.palette] || PALETTES.onyx;
    const root = document.documentElement;
    Object.entries(p).forEach(([k, v]) => root.style.setProperty('--' + k, v));
  }, [t.palette]);

  const breakdown = [
    { label: 'Market position',  value: 9, color: 'var(--accent)', emoji: '\uD83C\uDFAF' },
    { label: 'Financial health', value: 7, color: 'var(--gold)',   emoji: '\uD83D\uDCB0' },
    { label: 'Brand vibes',      value: 8, color: 'var(--violet)', emoji: '\u2728' },
  ];

  const go = (s) => setScreen(s);
  const stepIdx = SCREENS.indexOf(screen);
  const showSteps = t.showStepDots && stepIdx >= 1 && stepIdx <= 5;

  return (
    <div className="vi-app">
      {screen === 'splash' && <SplashScreen onStart={() => go('input')} />}
      {screen === 'input' && <InputScreen onBack={() => go('splash')} onSubmit={(s) => { setStartup(s); go('spotlight'); }} />}
      {screen === 'spotlight' && <AgentSpotlight startup={startup} onDone={() => go('handoff')} />}
      {screen === 'handoff' && <HandoffScreen startup={startup} onReveal={() => go('reveal')} onSkip={() => go('reveal')} />}
      {screen === 'reveal' && <ScoreReveal startup={startup} score={810} verdict="INVEST" breakdown={breakdown} onNext={() => go('report')} />}
      {screen === 'report' && <FullReport startup={startup} score={810} verdict="INVEST" onNext={() => go('actions')} onBack={() => go('reveal')} />}
      {screen === 'actions' && <ActionsScreen startup={startup} onBack={() => go('report')} onRestart={() => go('input')} />}

      {showSteps && (
        <div style={{
          position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 4, zIndex: 5, pointerEvents: 'none',
        }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: stepIdx === i ? 16 : 4, height: 4, borderRadius: 99,
              background: stepIdx >= i ? 'var(--ink)' : 'var(--line-strong)',
              transition: 'all .3s',
            }}></div>
          ))}
        </div>
      )}
    </div>
  );
}

function Mount() {
  const [t, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "palette": "onyx",
    "startup": "Bazaar Technologies",
    "showStepDots": false
  }/*EDITMODE-END*/);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#161618',
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
      backgroundSize: '24px 24px',
      padding: 20,
    }}>
      <IOSDevice width={390} height={844} dark={t.palette !== 'ivory'}>
        <VibeApp t={t} />
      </IOSDevice>

      <TweaksPanel title="Vibe Settings">
        <TweakSection label="Palette">
          <TweakRadio
            label="theme"
            value={t.palette}
            options={['onyx','ivory','terminal','noir']}
            onChange={(v) => setTweak('palette', v)}
          />
        </TweakSection>
        <TweakSection label="Demo">
          <TweakText label="startup name" value={t.startup} onChange={(v) => setTweak('startup', v)} />
          <TweakToggle label="step dots" value={t.showStepDots} onChange={(v) => setTweak('showStepDots', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Mount />);
