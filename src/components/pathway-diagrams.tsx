// Original animated pathway diagrams for study reference.
// These are hand-built illustrations created for this app — not sourced or
// traced from any textbook. Colors follow the app's own topic palette.

function Step({ x, y, w = 108, h = 40, label, sub, color }: { x: number; y: number; w?: number; h?: number; label: string; sub?: string; color: { bg: string; fg: string } }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={color.bg} stroke={color.fg} strokeOpacity={0.25} />
      <text x={x + w / 2} y={y + (sub ? 18 : 25)} textAnchor="middle" fontSize="12" fontWeight={700} fill={color.fg}>{label}</text>
      {sub && <text x={x + w / 2} y={y + 31} textAnchor="middle" fontSize="9.5" fill={color.fg} opacity={0.85}>{sub}</text>}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-muted-foreground)" strokeWidth={1.6} markerEnd="url(#arrowhead)" opacity={0.55} />;
}

function ArrowDefs() {
  return (
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-muted-foreground)" opacity={0.7} />
      </marker>
    </defs>
  );
}

const violet = { bg: "oklch(0.93 0.09 300)", fg: "oklch(0.36 0.17 300)" };
const teal = { bg: "oklch(0.92 0.08 195)", fg: "oklch(0.34 0.09 210)" };
const amber = { bg: "oklch(0.92 0.11 75)", fg: "oklch(0.36 0.1 60)" };
const rose = { bg: "oklch(0.92 0.1 15)", fg: "oklch(0.4 0.16 15)" };

export function GlycolysisDiagram() {
  const steps = [
    { label: "Glucose", sub: "" },
    { label: "G6P", sub: "Hexokinase" },
    { label: "F6P", sub: "" },
    { label: "F1,6BP", sub: "PFK-1 ★" },
    { label: "G3P ×2", sub: "" },
    { label: "1,3-BPG", sub: "" },
    { label: "3-PG", sub: "" },
    { label: "2-PG", sub: "" },
    { label: "PEP", sub: "" },
    { label: "Pyruvate", sub: "Pyruvate kinase ★" },
  ];
  const colW = 122;
  const width = steps.length * colW + 20;
  return (
    <svg viewBox={`0 0 ${width} 130`} className="w-full" role="img" aria-label="Glycolysis pathway diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        const color = i === 3 || i === 9 ? amber : teal;
        return (
          <g key={s.label}>
            <Step x={x} y={45} w={104} label={s.label} sub={s.sub} color={color} />
            {i < steps.length - 1 && <Arrow x1={x + 104} y1={65} x2={x + colW - 6} y2={65} />}
          </g>
        );
      })}
      <circle r="5" fill={teal.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path={`M ${10 + 52} 65 ${steps.map((_, i) => `L ${10 + i * colW + 52} 65`).join(" ")}`} />
      </circle>
      <text x={width / 2} y={18} textAnchor="middle" fontSize="11" fill="var(--color-muted-foreground)">★ = rate-limiting, irreversible step (gluconeogenesis must bypass)</text>
    </svg>
  );
}

export function TCACycleDiagram() {
  const intermediates = ["Acetyl-CoA", "Citrate", "Isocitrate", "α-KG", "Succinyl-CoA", "Succinate", "Fumarate", "Malate", "Oxaloacetate"];
  const cx = 210, cy = 140, r = 95;
  const n = intermediates.length - 1; // Acetyl-CoA feeds in separately
  const points = intermediates.slice(1).map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 420 280" className="w-full" role="img" aria-label="TCA cycle diagram">
      <ArrowDefs />
      <path d={pathD} fill="none" stroke="var(--color-muted-foreground)" strokeOpacity={0.3} strokeWidth={1.5} />
      {points.map((p, i) => {
        const name = intermediates[i + 1]!;
        const isRegulated = name === "Isocitrate" || name === "α-KG";
        return (
          <g key={name}>
            <circle cx={p.x} cy={p.y} r={30} fill={isRegulated ? amber.bg : violet.bg} stroke={isRegulated ? amber.fg : violet.fg} strokeOpacity={0.3} />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10.5" fontWeight={700} fill={isRegulated ? amber.fg : violet.fg}>{name}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={34} fill={rose.bg} stroke={rose.fg} strokeOpacity={0.3} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10.5" fontWeight={700} fill={rose.fg}>Acetyl-CoA</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill={rose.fg}>enters cycle</text>
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="7s" repeatCount="indefinite" path={pathD} />
      </circle>
      <text x="210" y="20" textAnchor="middle" fontSize="11" fill="var(--color-muted-foreground)">Rate-limiting: isocitrate dehydrogenase (★ amber nodes) — 3 NADH, 1 FADH₂, 1 GTP per turn</text>
    </svg>
  );
}

export function UreaCycleDiagram() {
  const cytosolic = ["Citrulline", "Argininosuccinate", "Arginine"];
  const mito = ["Ornithine", "Carbamoyl-P", "Citrulline"];
  return (
    <svg viewBox="0 0 420 260" className="w-full" role="img" aria-label="Urea cycle diagram">
      <ArrowDefs />
      <rect x="10" y="20" width="195" height="220" rx="14" fill={teal.bg} opacity={0.35} />
      <text x="107" y="38" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={teal.fg}>Mitochondria</text>
      <rect x="215" y="20" width="195" height="220" rx="14" fill={violet.bg} opacity={0.35} />
      <text x="312" y="38" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={violet.fg}>Cytosol</text>

      <Step x={35} y={55} w={150} label="Ornithine" color={teal} />
      <Step x={35} y={110} w={150} label="Carbamoyl-P" sub="CPS-I ★ (needs N-acetylglutamate)" color={amber} />
      <Step x={35} y={165} w={150} label="Citrulline" color={teal} />
      <Arrow x1={110} y1={95} x2={110} y2={108} />
      <Arrow x1={110} y1={150} x2={110} y2={163} />

      <Step x={240} y={165} w={150} label="Citrulline" color={teal} />
      <Step x={240} y={110} w={150} label="Argininosuccinate" color={violet} />
      <Step x={240} y={55} w={150} label="Arginine" color={violet} />
      <Arrow x1={315} y1={163} x2={315} y2={150} />
      <Arrow x1={315} y1={108} x2={315} y2={95} />

      <Arrow x1={185} y1={185} x2={238} y2={185} />
      <text x="211" y="180" textAnchor="middle" fontSize="8.5" fill="var(--color-muted-foreground)">transport</text>
      <Arrow x1={240} y1={75} x2={187} y2={75} />
      <text x="213" y="70" textAnchor="middle" fontSize="8.5" fill="var(--color-muted-foreground)">→ Ornithine + Urea</text>

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="7s" repeatCount="indefinite" path="M 110 75 L 110 130 L 110 185 L 315 185 L 315 130 L 315 75 L 110 75" />
      </circle>
      <text x="210" y="252" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Ammonia disposal — 1 urea = 2 N (1 from NH₄⁺, 1 from aspartate), costs 4 ATP equivalents</text>
    </svg>
  );
}

export function ElectronTransportDiagram() {
  const complexes = [
    { label: "Complex I", sub: "NADH → Q" },
    { label: "Complex II", sub: "FADH₂ → Q" },
    { label: "Complex III", sub: "Q → cyt c" },
    { label: "Complex IV", sub: "→ O₂ → H₂O" },
    { label: "ATP synthase", sub: "Complex V" },
  ];
  const colW = 100;
  return (
    <svg viewBox="0 0 520 160" className="w-full" role="img" aria-label="Electron transport chain diagram">
      <ArrowDefs />
      <rect x="0" y="70" width="520" height="26" fill="var(--color-muted)" opacity={0.5} rx={4} />
      <text x="8" y="87" fontSize="9" fill="var(--color-muted-foreground)">Inner mitochondrial membrane</text>
      {complexes.map((c, i) => {
        const x = 20 + i * colW;
        const color = c.label === "ATP synthase" ? rose : i % 2 === 0 ? violet : teal;
        return (
          <g key={c.label}>
            <Step x={x} y={40} w={84} label={c.label} sub={c.sub} color={color} />
            {i < complexes.length - 1 && <Arrow x1={x + 84} y1={60} x2={x + colW - 4} y2={60} />}
          </g>
        );
      })}
      <circle r="4.5" fill={violet.fg}>
        <animateMotion dur="5.5s" repeatCount="indefinite" path={`M 62 60 L 162 60 L 262 60 L 362 60`} />
      </circle>
      <text x="260" y="20" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Electrons flow I/II → III → IV; proton gradient drives ATP synthase</text>
      <text x="260" y="150" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Rotenone blocks Complex I · Cyanide blocks Complex IV · Oligomycin blocks ATP synthase</text>
    </svg>
  );
}
