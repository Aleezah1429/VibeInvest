// Agent data + shared bits
const AGENTS = {
  skeptic: {
    key: 'skeptic',
    emoji: '🔍',
    name: 'The Skeptic',
    role: 'Market researcher',
    color: 'var(--punch)',
    tag: 'finds the cracks',
    voice: 'roast',
    avatarBg: '#FF6B6B',
    sayings: [
      "let me scan the web for receipts…",
      "found 4 competitors already doing this",
      "market saturation: HIGH 🚩",
      "logistics burn rate is gonna sting",
    ],
  },
  munshi: {
    key: 'munshi',
    emoji: '💰',
    name: 'The Munshi',
    role: 'Financial analyst (PKR)',
    color: 'var(--accent)',
    tag: 'roasts your math',
    voice: 'desi-finance',
    avatarBg: '#D4FF3D',
    sayings: [
      "okay let me pull out the calculator…",
      "CAC: Rs 480 · LTV: Rs 1,920 → 4× ratio, decent",
      "burn rate Rs 38M/mo. runway ≈ 14 months.",
      "unit economics: barely working. fix margins.",
    ],
  },
  hype: {
    key: 'hype',
    emoji: '✨',
    name: 'The Hype',
    role: 'Brand guru (Gen Z)',
    color: 'var(--violet)',
    tag: 'vibe-checks the brand',
    voice: 'genz',
    avatarBg: '#A78BFA',
    sayings: [
      "okay slay let me cook…",
      "logo is mid but the name slaps",
      "founder twitter? 12k engaged followers ✅",
      "tagline could go viral. wrote 3 options.",
    ],
  },
  cvo: {
    key: 'cvo',
    emoji: '👑',
    name: 'The CVO',
    role: 'Chief Vibe Officer',
    color: 'var(--gold)',
    tag: 'delivers the verdict',
    voice: 'orchestrator',
    avatarBg: '#FFC83C',
    sayings: [
      "synthesizing reports from all 3 agents…",
      "resolving conflicts: Skeptic vs Hype",
      "weighting risk × upside × vibe…",
      "verdict locked in. revealing aura score.",
    ],
  },
};

const AGENT_LIST = [AGENTS.skeptic, AGENTS.munshi, AGENTS.hype, AGENTS.cvo];

// shared mini badge with emoji + label
function AgentChip({ agent, mini = false }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: mini ? '4px 8px 4px 4px' : '5px 12px 5px 5px',
      border: '1.5px solid var(--ink)', borderRadius: 999,
      background: 'var(--paper)',
      fontSize: mini ? 11 : 13, fontWeight: 600,
    }}>
      <span style={{
        width: mini ? 18 : 22, height: mini ? 18 : 22, borderRadius: 6,
        background: agent.avatarBg, display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', fontSize: mini ? 11 : 13,
      }}>{agent.emoji}</span>
      <span>{agent.name.replace('The ', '')}</span>
    </div>
  );
}

function AgentAvatar({ agent, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 14,
      border: '1.5px solid var(--ink)',
      background: agent.avatarBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, flexShrink: 0,
    }}>{agent.emoji}</div>
  );
}

Object.assign(window, { AGENTS, AGENT_LIST, AgentChip, AgentAvatar });
