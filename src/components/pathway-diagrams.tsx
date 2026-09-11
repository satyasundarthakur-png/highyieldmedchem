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

const emerald = { bg: "oklch(0.92 0.09 155)", fg: "oklch(0.35 0.1 155)" };
const blue = { bg: "oklch(0.91 0.09 250)", fg: "oklch(0.36 0.12 255)" };
const magenta = { bg: "oklch(0.91 0.1 340)", fg: "oklch(0.38 0.16 340)" };
const lime = { bg: "oklch(0.92 0.1 125)", fg: "oklch(0.37 0.11 130)" };

export function HmpShuntDiagram() {
  return (
    <svg viewBox="0 0 460 220" className="w-full" role="img" aria-label="HMP shunt diagram">
      <ArrowDefs />
      <Step x={20} y={20} w={140} label="Glucose-6-P" color={teal} />
      <Arrow x1={90} y1={60} x2={90} y2={80} />
      <text x="150" y="75" fontSize="9.5" fill={amber.fg} fontWeight={700}>G6PD ★ (rate-limiting)</text>
      <Step x={20} y={85} w={140} label="6-P-Gluconate" color={teal} />
      <Arrow x1={90} y1={125} x2={90} y2={145} />
      <Step x={20} y={150} w={140} label="Ribulose-5-P" color={teal} />

      <rect x="200" y="20" width="240" height="80" rx="12" fill={amber.bg} opacity={0.4} />
      <text x="320" y="38" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={amber.fg}>Oxidative phase output</text>
      <text x="320" y="58" textAnchor="middle" fontSize="12" fontWeight={700} fill={amber.fg}>2 NADPH</text>
      <text x="320" y="76" textAnchor="middle" fontSize="9.5" fill={amber.fg}>fuels glutathione reduction, fatty-acid &amp; steroid synthesis</text>
      <Arrow x1={160} y1={60} x2={198} y2={60} />

      <rect x="200" y="140" width="240" height="65" rx="12" fill={violet.bg} opacity={0.4} />
      <text x="320" y="160" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={violet.fg}>Non-oxidative phase</text>
      <text x="320" y="180" textAnchor="middle" fontSize="10" fill={violet.fg}>Ribose-5-P → nucleotide synthesis</text>
      <Arrow x1={160} y1={170} x2={198} y2={170} />

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M 90 40 L 90 105 L 90 170 L 320 170 L 320 60 L 90 40" />
      </circle>
      <text x="230" y="215" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">G6PD deficiency → ↓NADPH → oxidative RBC hemolysis</text>
    </svg>
  );
}

export function BetaOxidationDiagram() {
  const steps = ["Fatty acyl-CoA", "Oxidation", "Hydration", "Oxidation", "Thiolysis"];
  const colW = 96;
  return (
    <svg viewBox="0 0 520 190" className="w-full" role="img" aria-label="Beta-oxidation spiral diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        const color = i === 0 ? rose : lime;
        return (
          <g key={i}>
            <Step x={x} y={20} w={82} h={38} label={s} color={color} />
            {i < steps.length - 1 && <Arrow x1={x + 82} y1={39} x2={x + colW - 4} y2={39} />}
          </g>
        );
      })}
      <Arrow x1={452} y1={39} x2={480} y2={39} />
      <text x="490" y="43" fontSize="10.5" fontWeight={700} fill={lime.fg}>+ Acetyl-CoA</text>

      <path d="M 480 55 C 480 100, 40 100, 40 60" fill="none" stroke={lime.fg} strokeOpacity={0.4} strokeWidth={1.6} markerEnd="url(#arrowhead)" />
      <text x="260" y="115" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Cycle repeats — chain shortens by 2 carbons each turn, releasing 1 acetyl-CoA, 1 NADH, 1 FADH₂</text>

      <rect x="40" y="140" width="440" height="40" rx="10" fill={amber.bg} opacity={0.5} />
      <text x="260" y="164" textAnchor="middle" fontSize="10.5" fill={amber.fg}>Carnitine shuttle carries long-chain fatty acyl-CoA into the mitochondrial matrix (CPT-I is rate-limiting)</text>

      <circle r="4.5" fill={lime.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M 40 39 L 500 39 C 500 90, 40 90, 40 39" />
      </circle>
    </svg>
  );
}

export function LipoproteinTransportDiagram() {
  const particles = [
    { label: "Chylomicrons", sub: "dietary fat → tissues", color: rose },
    { label: "VLDL", sub: "liver → tissues (TG)", color: amber },
    { label: "LDL", sub: "cholesterol → tissues", color: violet },
    { label: "HDL", sub: "reverse cholesterol transport", color: emerald },
  ];
  return (
    <svg viewBox="0 0 460 220" className="w-full" role="img" aria-label="Lipoprotein transport diagram">
      <ArrowDefs />
      <rect x="20" y="20" width="420" height="46" rx="12" fill={teal.bg} opacity={0.5} />
      <text x="230" y="48" textAnchor="middle" fontSize="11" fontWeight={700} fill={teal.fg}>Intestine (chylomicrons) and Liver (VLDL) package triglycerides for transport</text>

      {particles.map((p, i) => {
        const x = 20 + i * 110;
        return (
          <g key={p.label}>
            <circle cx={x + 45} cy={130} r={42} fill={p.color.bg} stroke={p.color.fg} strokeOpacity={0.3} />
            <text x={x + 45} y={126} textAnchor="middle" fontSize="11" fontWeight={700} fill={p.color.fg}>{p.label}</text>
            <text x={x + 45} y={142} textAnchor="middle" fontSize="8" fill={p.color.fg}>{p.sub}</text>
          </g>
        );
      })}
      <Arrow x1={107} y1={130} x2={128} y2={130} />
      <Arrow x1={217} y1={130} x2={238} y2={130} />
      <Arrow x1={327} y1={130} x2={348} y2={130} />
      <path d="M 400 172 C 400 210, 65 210, 65 172" fill="none" stroke={emerald.fg} strokeOpacity={0.5} strokeWidth={1.6} markerEnd="url(#arrowhead)" />
      <text x="230" y="205" textAnchor="middle" fontSize="9.5" fill={emerald.fg}>HDL returns cholesterol to the liver (reverse transport, via LCAT)</text>

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="7s" repeatCount="indefinite" path="M 65 130 L 175 130 L 285 130 L 395 130" />
      </circle>
      <text x="230" y="14" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Lipoprotein lipase (on capillary endothelium) unloads triglycerides from chylomicrons/VLDL</text>
    </svg>
  );
}

export function HemeSynthesisDiagram() {
  const steps = [
    { label: "Glycine + Succinyl-CoA", sub: "ALA synthase ★ (B6-dependent)", compartment: "mito" },
    { label: "ALA", sub: "", compartment: "mito" },
    { label: "Porphobilinogen", sub: "cytosol", compartment: "cyto" },
    { label: "Uroporphyrinogen", sub: "cytosol", compartment: "cyto" },
    { label: "Coproporphyrinogen", sub: "→ back to mitochondria", compartment: "mito" },
    { label: "Protoporphyrin IX", sub: "", compartment: "mito" },
    { label: "Heme", sub: "Ferrochelatase + Fe²⁺", compartment: "mito" },
  ];
  const colW = 128;
  return (
    <svg viewBox={`0 0 ${steps.length * colW + 20} 140`} className="w-full" role="img" aria-label="Heme synthesis pathway diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        const color = s.compartment === "mito" ? rose : blue;
        return (
          <g key={s.label}>
            <Step x={x} y={45} w={114} h={44} label={s.label} sub={s.sub} color={color} />
            {i < steps.length - 1 && <Arrow x1={x + 114} y1={67} x2={x + colW - 6} y2={67} />}
          </g>
        );
      })}
      <circle r="5" fill={rose.fg}>
        <animateMotion dur="8s" repeatCount="indefinite" path={`M 67 67 ${steps.map((_, i) => `L ${10 + i * colW + 57} 67`).join(" ")}`} />
      </circle>
      <text x={(steps.length * colW + 20) / 2} y={20} textAnchor="middle" fontSize="11" fill="var(--color-muted-foreground)">First and last 3 steps are mitochondrial; middle steps are cytosolic. Lead poisoning blocks ALA dehydratase &amp; ferrochelatase.</text>
    </svg>
  );
}

export function DnaReplicationDiagram() {
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="DNA replication fork diagram">
      <ArrowDefs />
      <path d="M 40 40 Q 200 40 230 100 Q 200 40 40 40" fill="none" />
      <path d="M 230 100 L 420 30" stroke={blue.fg} strokeWidth={3} strokeOpacity={0.5} />
      <path d="M 230 100 L 420 60" stroke={blue.fg} strokeWidth={3} strokeOpacity={0.5} />
      <path d="M 230 100 L 420 140" stroke={magenta.fg} strokeWidth={3} strokeOpacity={0.5} />
      <path d="M 230 100 L 420 170" stroke={magenta.fg} strokeWidth={3} strokeOpacity={0.5} />
      <circle cx="230" cy="100" r="14" fill={amber.bg} stroke={amber.fg} strokeOpacity={0.5} />
      <text x="230" y="104" textAnchor="middle" fontSize="8" fontWeight={700} fill={amber.fg}>Helicase</text>

      <text x="425" y="26" fontSize="10.5" fontWeight={700} fill={blue.fg}>Leading strand</text>
      <text x="425" y="42" fontSize="9" fill={blue.fg}>continuous, 5'→3', one primer</text>
      <text x="425" y="136" fontSize="10.5" fontWeight={700} fill={magenta.fg}>Lagging strand</text>
      <text x="425" y="152" fontSize="9" fill={magenta.fg}>Okazaki fragments, ligase joins them</text>

      <rect x="20" y="175" width="420" height="22" rx="6" fill={teal.bg} opacity={0.5} />
      <text x="230" y="190" textAnchor="middle" fontSize="9.5" fill={teal.fg}>DNA polymerase III (bacteria) / δ &amp; ε (eukaryotes) extend; primase lays RNA primers; topoisomerase relieves supercoiling ahead of the fork</text>

      <circle r="5" fill={amber.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 40 100 L 230 100" />
      </circle>
    </svg>
  );
}

export function InsulinGlucagonDiagram() {
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="Insulin vs glucagon see-saw diagram">
      <ArrowDefs />
      <line x1="230" y1="40" x2="230" y2="110" stroke="var(--color-muted-foreground)" strokeWidth={4} strokeLinecap="round" />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-6 230 110; 6 230 110; -6 230 110" dur="4s" repeatCount="indefinite" />
        <line x1="70" y1="110" x2="390" y2="110" stroke="var(--color-muted-foreground)" strokeWidth={5} strokeLinecap="round" />
        <g>
          <circle cx="90" cy="110" r="38" fill={emerald.bg} stroke={emerald.fg} strokeOpacity={0.4} />
          <text x="90" y="106" textAnchor="middle" fontSize="11" fontWeight={700} fill={emerald.fg}>Insulin</text>
          <text x="90" y="120" textAnchor="middle" fontSize="8" fill={emerald.fg}>fed state</text>
        </g>
        <g>
          <circle cx="370" cy="110" r="38" fill={rose.bg} stroke={rose.fg} strokeOpacity={0.4} />
          <text x="370" y="106" textAnchor="middle" fontSize="11" fontWeight={700} fill={rose.fg}>Glucagon</text>
          <text x="370" y="120" textAnchor="middle" fontSize="8" fill={rose.fg}>fasting state</text>
        </g>
      </g>

      <text x="90" y="170" textAnchor="middle" fontSize="9" fill={emerald.fg}>↑Glycogen, fat &amp; protein synthesis</text>
      <text x="90" y="183" textAnchor="middle" fontSize="9" fill={emerald.fg}>↓Gluconeogenesis, lipolysis</text>
      <text x="370" y="170" textAnchor="middle" fontSize="9" fill={rose.fg}>↑Glycogenolysis, gluconeogenesis</text>
      <text x="370" y="183" textAnchor="middle" fontSize="9" fill={rose.fg}>↑Lipolysis, ketogenesis</text>

      <text x="230" y="20" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Reciprocal regulation — both act mainly on liver, muscle, and adipose tissue</text>
    </svg>
  );
}

export function EnzymeKineticsDiagram() {
  const vmax = 90, km = 140;
  const curve = "M 40 170 C 90 60, 220 40, 420 38";
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="Michaelis-Menten enzyme kinetics diagram">
      <ArrowDefs />
      <line x1="40" y1="170" x2="440" y2="170" stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
      <line x1="40" y1="170" x2="40" y2="20" stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
      <text x="240" y="196" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">[Substrate] →</text>
      <text x="16" y="95" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)" transform="rotate(-90 16 95)">Velocity →</text>

      <path d={curve} fill="none" stroke={violet.fg} strokeWidth={2.5} />
      <line x1="40" y1={vmax} x2="440" y2={vmax} stroke={amber.fg} strokeOpacity={0.5} strokeDasharray="4 4" />
      <text x="445" y={vmax + 4} fontSize="10" fontWeight={700} fill={amber.fg}>Vmax</text>
      <line x1="40" y1={vmax + (170 - vmax) / 2} x2="150" y2={vmax + (170 - vmax) / 2} stroke={teal.fg} strokeOpacity={0.5} strokeDasharray="4 4" />
      <line x1="150" y1={170} x2="150" y2={vmax + (170 - vmax) / 2} stroke={teal.fg} strokeOpacity={0.5} strokeDasharray="4 4" />
      <text x="150" y="186" textAnchor="middle" fontSize="10" fontWeight={700} fill={teal.fg}>Km</text>
      <text x="90" y={vmax + (170 - vmax) / 2 - 8} fontSize="9" fill={teal.fg}>½ Vmax</text>

      <circle r="5" fill={violet.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path={curve} />
      </circle>
      <text x="240" y="14" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Km = substrate conc. at half-max velocity — low Km means high enzyme affinity</text>
      <text x="240" y="150" textAnchor="middle" fontSize="9" fill="var(--color-muted-foreground)" opacity={0.001}>{km}</text>
    </svg>
  );
}

export function GlycogenMetabolismDiagram() {
  return (
    <svg viewBox="0 0 460 210" className="w-full" role="img" aria-label="Glycogenesis and glycogenolysis diagram">
      <ArrowDefs />
      <Step x={30} y={80} w={140} label="Glycogen" color={violet} />
      <Step x={290} y={80} w={140} label="Glucose-1-P" color={teal} />

      <path d="M 172 92 L 288 92" stroke={emerald.fg} strokeWidth={2} markerEnd="url(#arrowhead)" opacity={0.7} />
      <text x="230" y="82" textAnchor="middle" fontSize="9.5" fontWeight={700} fill={emerald.fg}>Glycogen phosphorylase ★</text>
      <text x="230" y="108" textAnchor="middle" fontSize="8.5" fill={emerald.fg}>(glycogenolysis — glucagon/epinephrine ↑)</text>

      <path d="M 288 110 L 172 110" stroke={rose.fg} strokeWidth={2} markerEnd="url(#arrowhead)" opacity={0.7} />
      <text x="230" y="132" textAnchor="middle" fontSize="9.5" fontWeight={700} fill={rose.fg}>Glycogen synthase ★</text>
      <text x="230" y="148" textAnchor="middle" fontSize="8.5" fill={rose.fg}>(glycogenesis — insulin ↑)</text>

      <rect x="30" y="20" width="400" height="38" rx="10" fill={amber.bg} opacity={0.5} />
      <text x="230" y="43" textAnchor="middle" fontSize="10" fill={amber.fg}>Liver glycogen → maintains blood glucose. Muscle glycogen → used locally only (lacks glucose-6-phosphatase).</text>

      <rect x="30" y="170" width="400" height="30" rx="8" fill={teal.bg} opacity={0.4} />
      <text x="230" y="189" textAnchor="middle" fontSize="9.5" fill={teal.fg}>McArdle disease: muscle phosphorylase deficiency → exercise intolerance, no rise in lactate</text>

      <circle r="4.5" fill={emerald.fg}>
        <animateMotion dur="3.5s" repeatCount="indefinite" path="M 172 92 L 288 92" />
      </circle>
      <circle r="4.5" fill={rose.fg}>
        <animateMotion dur="3.5s" begin="1.75s" repeatCount="indefinite" path="M 288 110 L 172 110" />
      </circle>
    </svg>
  );
}

export function TransaminationDiagram() {
  return (
    <svg viewBox="0 0 460 180" className="w-full" role="img" aria-label="Transamination reaction diagram">
      <ArrowDefs />
      <Step x={20} y={30} w={150} label="Amino acid" color={teal} />
      <Step x={20} y={110} w={150} label="α-Ketoglutarate" color={amber} />
      <Step x={290} y={30} w={150} label="α-Keto acid" color={teal} />
      <Step x={290} y={110} w={150} label="Glutamate" color={amber} />

      <circle cx="230" cy="90" r="34" fill={violet.bg} stroke={violet.fg} strokeOpacity={0.4} />
      <text x="230" y="86" textAnchor="middle" fontSize="10" fontWeight={700} fill={violet.fg}>ALT / AST</text>
      <text x="230" y="99" textAnchor="middle" fontSize="8" fill={violet.fg}>needs PLP (B6)</text>

      <Arrow x1={170} y1={50} x2={198} y2={78} />
      <Arrow x1={198} y1={102} x2={170} y2={130} />
      <Arrow x1={262} y1={78} x2={290} y2={50} />
      <Arrow x1={290} y1={130} x2={262} y2={102} />

      <circle r="4.5" fill={violet.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 170 50 L 230 90 L 290 50 M 290 130 L 230 90 L 170 130" />
      </circle>
      <text x="230" y="16" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Transfers an amino group — funnels nitrogen from many amino acids into glutamate for the urea cycle</text>
      <text x="230" y="168" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">High ALT/AST in serum = hepatocyte injury marker</text>
    </svg>
  );
}

export function PurineDegradationDiagram() {
  const steps = ["Adenine / Guanine", "Hypoxanthine / Xanthine", "Xanthine", "Uric Acid"];
  const colW = 130;
  return (
    <svg viewBox={`0 0 ${steps.length * colW + 20} 150`} className="w-full" role="img" aria-label="Purine degradation to uric acid diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s}>
            <Step x={x} y={50} w={116} h={40} label={s} color={i === 3 ? rose : teal} />
            {i < steps.length - 1 && <Arrow x1={x + 116} y1={70} x2={x + colW - 6} y2={70} />}
          </g>
        );
      })}
      <text x={(2 * colW) + 60} y="30" textAnchor="middle" fontSize="9.5" fontWeight={700} fill={amber.fg}>Xanthine oxidase ★</text>
      <rect x="10" y="105" width={steps.length * colW - 10} height="34" rx="8" fill={amber.bg} opacity={0.5} />
      <text x={(steps.length * colW) / 2} y="126" textAnchor="middle" fontSize="10" fill={amber.fg}>Allopurinol inhibits xanthine oxidase → treats gout &amp; tumor lysis syndrome</text>
      <circle r="5" fill={rose.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path={`M 68 70 ${steps.map((_, i) => `L ${10 + i * colW + 58} 70`).join(" ")}`} />
      </circle>
    </svg>
  );
}

export function CholesterolSynthesisDiagram() {
  const steps = ["Acetyl-CoA", "HMG-CoA", "Mevalonate", "Squalene", "Cholesterol"];
  const colW = 100;
  return (
    <svg viewBox="0 0 520 120" className="w-full" role="img" aria-label="Cholesterol synthesis pathway diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s}>
            <Step x={x} y={40} w={86} label={s} sub={i === 1 ? "HMG-CoA reductase ★" : ""} color={i === 1 ? amber : violet} />
            {i < steps.length - 1 && <Arrow x1={x + 86} y1={60} x2={x + colW - 4} y2={60} />}
          </g>
        );
      })}
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path={`M 53 60 ${steps.map((_, i) => `L ${10 + i * colW + 43} 60`).join(" ")}`} />
      </circle>
      <text x="260" y="20" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Statins competitively inhibit HMG-CoA reductase, the rate-limiting step</text>
      <text x="260" y="108" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Synthesis occurs mainly in the liver; regulated by SREBP in response to cellular cholesterol</text>
    </svg>
  );
}

export function DigestionJourneyDiagram() {
  const stops = [
    { label: "Mouth", sub: "salivary amylase" },
    { label: "Stomach", sub: "pepsin, HCl" },
    { label: "Duodenum", sub: "bile + pancreatic enzymes" },
    { label: "Jejunum/Ileum", sub: "brush-border digestion, absorption" },
    { label: "Colon", sub: "water absorption, bacterial fermentation" },
  ];
  const colW = 100;
  return (
    <svg viewBox="0 0 520 130" className="w-full" role="img" aria-label="Digestive tract journey diagram">
      <ArrowDefs />
      {stops.map((s, i) => {
        const x = 10 + i * colW;
        const color = [teal, amber, violet, emerald, rose][i % 5]!;
        return (
          <g key={s.label}>
            <Step x={x} y={40} w={86} h={44} label={s.label} sub={s.sub} color={color} />
            {i < stops.length - 1 && <Arrow x1={x + 86} y1={62} x2={x + colW - 4} y2={62} />}
          </g>
        );
      })}
      <circle r="5" fill={amber.fg}>
        <animateMotion dur="7s" repeatCount="indefinite" path={`M 53 62 ${stops.map((_, i) => `L ${10 + i * colW + 43} 62`).join(" ")}`} />
      </circle>
      <text x="260" y="20" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">One bolus, five stages — each releases a different set of enzymes</text>
    </svg>
  );
}

export function AcidBaseBufferDiagram() {
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Bicarbonate buffer system diagram">
      <ArrowDefs />
      <Step x={20} y={70} w={110} label="CO₂ + H₂O" color={teal} />
      <Step x={175} y={70} w={110} label="H₂CO₃" color={amber} />
      <Step x={330} y={70} w={110} label="H⁺ + HCO₃⁻" color={rose} />
      <path d="M 130 82 L 173 82" stroke={violet.fg} strokeWidth={2} markerEnd="url(#arrowhead)" />
      <path d="M 173 98 L 130 98" stroke={violet.fg} strokeWidth={2} markerEnd="url(#arrowhead)" />
      <text x="152" y="68" textAnchor="middle" fontSize="9" fill={violet.fg}>carbonic anhydrase</text>
      <path d="M 285 82 L 328 82" stroke={violet.fg} strokeWidth={2} markerEnd="url(#arrowhead)" />
      <path d="M 328 98 L 285 98" stroke={violet.fg} strokeWidth={2} markerEnd="url(#arrowhead)" />

      <rect x="20" y="20" width="200" height="34" rx="8" fill={teal.bg} opacity={0.5} />
      <text x="120" y="41" textAnchor="middle" fontSize="9.5" fill={teal.fg}>Lungs blow off CO₂ — fast, respiratory control</text>
      <rect x="240" y="20" width="200" height="34" rx="8" fill={rose.bg} opacity={0.5} />
      <text x="340" y="41" textAnchor="middle" fontSize="9.5" fill={rose.fg}>Kidneys excrete H⁺, reabsorb HCO₃⁻ — slow, metabolic control</text>

      <rect x="20" y="140" width="420" height="34" rx="8" fill={amber.bg} opacity={0.5} />
      <text x="230" y="161" textAnchor="middle" fontSize="10" fill={amber.fg}>Henderson-Hasselbalch: pH = 6.1 + log([HCO₃⁻] / 0.03 × pCO₂)</text>

      <circle r="4.5" fill={violet.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 75 82 L 230 82 L 385 82 L 230 98 L 75 98" />
      </circle>
    </svg>
  );
}

export function PcrCycleDiagram() {
  const cx = 230, cy = 120, r = 78;
  const phases = [
    { label: "Denaturation", sub: "95 °C — strands separate", angle: -90 },
    { label: "Annealing", sub: "~55 °C — primers bind", angle: 30 },
    { label: "Extension", sub: "72 °C — Taq polymerase", angle: 150 },
  ];
  return (
    <svg viewBox="0 0 460 260" className="w-full" role="img" aria-label="PCR thermal cycle diagram">
      <ArrowDefs />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-muted-foreground)" strokeOpacity={0.3} strokeWidth={1.5} />
      {phases.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        const color = p.label === "Denaturation" ? rose : p.label === "Annealing" ? teal : amber;
        return (
          <g key={p.label}>
            <circle cx={x} cy={y} r={44} fill={color.bg} stroke={color.fg} strokeOpacity={0.35} />
            <text x={x} y={y - 4} textAnchor="middle" fontSize="10.5" fontWeight={700} fill={color.fg}>{p.label}</text>
            <text x={x} y={y + 10} textAnchor="middle" fontSize="8" fill={color.fg}>{p.sub}</text>
          </g>
        );
      })}
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="4.5s" repeatCount="indefinite" path={`M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx + r - 0.01} ${cy}`} />
      </circle>
      <text x={cx} y="20" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">One cycle ≈ 2 minutes; 30+ cycles amplify target DNA exponentially (2ⁿ copies)</text>
      <text x={cx} y="250" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Taq polymerase is heat-stable — survives repeated 95 °C denaturation steps</text>
    </svg>
  );
}


export function FattyAcidSynthesisDiagram() {
  const steps = ["Acetyl-CoA", "Malonyl-CoA", "→ 7 cycles →", "Palmitate (C16)"];
  const colW = 130;
  return (
    <svg viewBox="0 0 540 120" className="w-full" role="img" aria-label="Fatty acid synthesis diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s}>
            <Step x={x} y={40} w={112} h={40} label={s} sub={i === 1 ? "Acetyl-CoA carboxylase ★" : ""} color={i === 1 ? amber : emerald} />
            {i < steps.length - 1 && <Arrow x1={x + 112} y1={60} x2={x + colW - 6} y2={60} />}
          </g>
        );
      })}
      <circle r="5" fill={emerald.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path={`M 66 60 ${steps.map((_, i) => `L ${10 + i * colW + 56} 60`).join(" ")}`} />
      </circle>
      <text x="270" y="20" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Cytosolic pathway; fatty acid synthase uses NADPH (from HMP shunt). ACC is the rate-limiting, biotin-dependent step.</text>
      <text x="270" y="105" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Citrate carries acetyl groups out of mitochondria — links TCA cycle to fatty acid synthesis</text>
    </svg>
  );
}

export function KetogenesisDiagram() {
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Ketogenesis diagram">
      <ArrowDefs />
      <Step x={20} y={20} w={160} label="2 × Acetyl-CoA" color={teal} />
      <Arrow x1={100} y1={60} x2={100} y2={80} />
      <Step x={20} y={85} w={160} label="Acetoacetyl-CoA" color={teal} />
      <Arrow x1={100} y1={125} x2={100} y2={145} />
      <Step x={20} y={150} w={160} label="HMG-CoA" sub="(liver mitochondria only)" color={amber} />

      <Arrow x1={185} y1={170} x2={230} y2={170} />
      <Step x={240} y={150} w={200} label="Acetoacetate" color={rose} />
      <Arrow x1={340} y1={150} x2={340} y2={120} />
      <Step x={240} y={70} w={95} label="Acetone" sub="(breath odor)" color={magenta} />
      <Step x={345} y={70} w={95} label="β-OH-butyrate" color={magenta} />
      <Arrow x1={300} y1={148} x2={280} y2={112} />
      <Arrow x1={370} y1={148} x2={385} y2={112} />

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M 100 40 L 100 105 L 100 170 L 340 170 L 340 90" />
      </circle>
      <text x="230" y="14" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Made only in liver mitochondria — the liver cannot use ketones itself (lacks thiophorase/CoA transferase)</text>
    </svg>
  );
}

export function OneCarbonFolateDiagram() {
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="One-carbon folate cycle diagram">
      <ArrowDefs />
      <Step x={20} y={70} w={150} label="Homocysteine" color={rose} />
      <Step x={290} y={70} w={150} label="Methionine" color={emerald} />
      <circle cx="230" cy="90" r="34" fill={violet.bg} stroke={violet.fg} strokeOpacity={0.4} />
      <text x="230" y="86" textAnchor="middle" fontSize="9.5" fontWeight={700} fill={violet.fg}>Methionine</text>
      <text x="230" y="98" textAnchor="middle" fontSize="9.5" fontWeight={700} fill={violet.fg}>synthase</text>
      <text x="230" y="45" textAnchor="middle" fontSize="9" fill={violet.fg}>needs B12 + N5-methyl-THF (folate)</text>
      <Arrow x1={170} y1={90} x2={196} y2={90} />
      <Arrow x1={264} y1={90} x2={290} y2={90} />

      <rect x="20" y="130" width="420" height="42" rx="10" fill={amber.bg} opacity={0.5} />
      <text x="230" y="150" textAnchor="middle" fontSize="10" fill={amber.fg}>B12 or folate deficiency → ↑homocysteine, megaloblastic anemia. Methionine → SAM, the universal methyl donor.</text>

      <circle r="4.5" fill={violet.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 95 90 L 290 90" />
      </circle>
    </svg>
  );
}

export function AdrenalSteroidogenesisDiagram() {
  const branches = [
    { label: "Cortisol", sub: "zona fasciculata", color: amber },
    { label: "Aldosterone", sub: "zona glomerulosa", color: teal },
    { label: "Androgens", sub: "zona reticularis", color: magenta },
  ];
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="Adrenal steroidogenesis diagram">
      <ArrowDefs />
      <Step x={20} y={20} w={150} label="Cholesterol" color={violet} />
      <Arrow x1={95} y1={60} x2={95} y2={80} />
      <Step x={20} y={85} w={150} label="Pregnenolone" color={violet} />
      <Arrow x1={170} y1={105} x2={200} y2={105} />
      <text x="185" y="98" fontSize="8.5" fill={violet.fg}>StAR ★</text>

      {branches.map((b, i) => {
        const x = 210 + i * 85;
        return (
          <g key={b.label}>
            <Arrow x1={95} y1={125} x2={x + 35} y2={160} />
            <circle cx={x + 35} cy={175} r={0} />
            <Step x={x} y={155} w={75} h={38} label={b.label} sub={b.sub} color={b.color} />
          </g>
        );
      })}
      <text x="230" y="14" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">StAR protein (rate-limiting) moves cholesterol into mitochondria; CAH enzyme defects block specific branches</text>
      <circle r="4.5" fill={violet.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 95 40 L 95 105" />
      </circle>
    </svg>
  );
}

export function ThyroidHormoneSynthesisDiagram() {
  const steps = ["Iodide trapping", "Oxidation (TPO)", "Organification", "Coupling", "T3 / T4 release"];
  const colW = 100;
  return (
    <svg viewBox="0 0 520 120" className="w-full" role="img" aria-label="Thyroid hormone synthesis diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s}>
            <Step x={x} y={40} w={86} h={40} label={s} color={i === 1 ? amber : teal} />
            {i < steps.length - 1 && <Arrow x1={x + 86} y1={60} x2={x + colW - 4} y2={60} />}
          </g>
        );
      })}
      <circle r="4.5" fill={teal.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path={`M 53 60 ${steps.map((_, i) => `L ${10 + i * colW + 43} 60`).join(" ")}`} />
      </circle>
      <text x="260" y="20" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Thyroid peroxidase (TPO) drives oxidation, organification, and coupling — blocked by propylthiouracil/methimazole</text>
      <text x="260" y="108" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Thyroglobulin is the scaffold; T4 (more) and T3 (more active) are stored and released into blood</text>
    </svg>
  );
}

export function CoagulationCascadeDiagram() {
  return (
    <svg viewBox="0 0 460 210" className="w-full" role="img" aria-label="Coagulation cascade diagram">
      <ArrowDefs />
      <Step x={20} y={20} w={170} label="Extrinsic pathway" sub="Tissue factor + VII (PT)" color={rose} />
      <Step x={270} y={20} w={170} label="Intrinsic pathway" sub="XII→XI→IX+VIII (PTT)" color={teal} />
      <Arrow x1={105} y1={60} x2={200} y2={100} />
      <Arrow x1={355} y1={60} x2={260} y2={100} />
      <Step x={155} y={100} w={150} label="Factor X → Xa" sub="common pathway" color={amber} />
      <Arrow x1={230} y1={140} x2={230} y2={160} />
      <Step x={130} y={160} w={200} label="Prothrombin → Thrombin → Fibrin" color={violet} />

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 105 45 L 230 120 L 230 180" />
      </circle>
      <text x="230" y="205" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Warfarin blocks vitamin K-dependent factors (II, VII, IX, X) — PT/INR monitors this pathway</text>
    </svg>
  );
}

export function CalciumRegulationDiagram() {
  const regulators = [
    { label: "PTH", sub: "↑Ca²⁺, ↓PO₄³⁻", color: amber },
    { label: "Vitamin D", sub: "↑gut Ca²⁺ absorption", color: teal },
    { label: "Calcitonin", sub: "↓Ca²⁺ (weak effect)", color: rose },
  ];
  const cx = 230, cy = 110, r = 70;
  return (
    <svg viewBox="0 0 460 220" className="w-full" role="img" aria-label="Calcium regulation diagram">
      <ArrowDefs />
      <circle cx={cx} cy={cy} r={40} fill={violet.bg} stroke={violet.fg} strokeOpacity={0.4} />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fontWeight={700} fill={violet.fg}>Serum</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fontWeight={700} fill={violet.fg}>Ca²⁺</text>
      {regulators.map((reg, i) => {
        const angle = (i / 3) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return (
          <g key={reg.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--color-muted-foreground)" strokeOpacity={0.3} />
            <circle cx={x} cy={y} r={38} fill={reg.color.bg} stroke={reg.color.fg} strokeOpacity={0.4} />
            <text x={x} y={y - 3} textAnchor="middle" fontSize="10.5" fontWeight={700} fill={reg.color.fg}>{reg.label}</text>
            <text x={x} y={y + 10} textAnchor="middle" fontSize="7.5" fill={reg.color.fg}>{reg.sub}</text>
          </g>
        );
      })}
      <text x="230" y="205" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Vitamin D must be activated: skin/diet → liver (25-OH) → kidney (1,25-(OH)₂, PTH-stimulated)</text>
    </svg>
  );
}

export function BilirubinMetabolismDiagram() {
  const steps = [
    { label: "Heme", sub: "RBC breakdown (spleen)" },
    { label: "Unconjugated bilirubin", sub: "albumin-bound" },
    { label: "Conjugated bilirubin", sub: "liver, UGT1A1 ★" },
    { label: "Urobilinogen", sub: "gut bacteria" },
    { label: "Stercobilin / urobilin", sub: "stool / urine color" },
  ];
  const colW = 108;
  return (
    <svg viewBox={`0 0 ${steps.length * colW + 20} 130`} className="w-full" role="img" aria-label="Bilirubin metabolism diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s.label}>
            <Step x={x} y={45} w={96} h={44} label={s.label} sub={s.sub} color={i === 2 ? amber : rose} />
            {i < steps.length - 1 && <Arrow x1={x + 96} y1={67} x2={x + colW - 6} y2={67} />}
          </g>
        );
      })}
      <circle r="5" fill={rose.fg}>
        <animateMotion dur="7s" repeatCount="indefinite" path={`M 58 67 ${steps.map((_, i) => `L ${10 + i * colW + 48} 67`).join(" ")}`} />
      </circle>
      <text x={(steps.length * colW + 20) / 2} y={20} textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">Gilbert syndrome / neonatal jaundice: reduced UGT1A1 activity → unconjugated hyperbilirubinemia</text>
    </svg>
  );
}

export function MethionineTranssulfurationDiagram() {
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="Methionine transsulfuration diagram">
      <ArrowDefs />
      <Step x={20} y={20} w={140} label="Methionine" color={emerald} />
      <Arrow x1={90} y1={60} x2={90} y2={78} />
      <Step x={20} y={83} w={140} label="SAM" sub="methyl donor" color={amber} />
      <Arrow x1={90} y1={123} x2={90} y2={141} />
      <Step x={20} y={146} w={140} label="SAH → Homocysteine" color={rose} />

      <Arrow x1={165} y1={168} x2={250} y2={168} />
      <Step x={260} y={146} w={180} label="Cystathionine → Cysteine" sub="cystathionine β-synthase, B6-dependent" color={teal} />

      <rect x="200" y="20" width="240" height="80" rx="10" fill={violet.bg} opacity={0.4} />
      <text x="320" y="42" textAnchor="middle" fontSize="10" fontWeight={700} fill={violet.fg}>Remethylation (alternative)</text>
      <text x="320" y="60" textAnchor="middle" fontSize="9.5" fill={violet.fg}>Homocysteine + N5-methyl-THF</text>
      <text x="320" y="76" textAnchor="middle" fontSize="9.5" fill={violet.fg}>→ Methionine (B12-dependent)</text>

      <circle r="4.5" fill={rose.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M 90 40 L 90 103 L 90 168 L 350 168" />
      </circle>
      <text x="230" y="192" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">CBS deficiency (homocystinuria) causes marfanoid habitus, lens dislocation, and thrombosis</text>
    </svg>
  );
}

export function TranslationCycleDiagram() {
  const cx = 230, cy = 110, r = 75;
  const phases = [
    { label: "Initiation", sub: "mRNA + small subunit + Met-tRNA", angle: -90 },
    { label: "Elongation", sub: "aminoacyl-tRNA entry, peptide bond, translocation", angle: 30 },
    { label: "Termination", sub: "stop codon, release factor", angle: 150 },
  ];
  return (
    <svg viewBox="0 0 460 230" className="w-full" role="img" aria-label="Protein translation cycle diagram">
      <ArrowDefs />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-muted-foreground)" strokeOpacity={0.3} strokeWidth={1.5} />
      {phases.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        const color = p.label === "Initiation" ? teal : p.label === "Elongation" ? amber : rose;
        return (
          <g key={p.label}>
            <circle cx={x} cy={y} r={46} fill={color.bg} stroke={color.fg} strokeOpacity={0.35} />
            <text x={x} y={y - 6} textAnchor="middle" fontSize="10.5" fontWeight={700} fill={color.fg}>{p.label}</text>
            <foreignObject x={x - 40} y={y - 2} width="80" height="40">
              <p style={{ fontSize: "7px", textAlign: "center", color: color.fg, lineHeight: 1.2, margin: 0 }}>{p.sub}</p>
            </foreignObject>
          </g>
        );
      })}
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path={`M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx + r - 0.01} ${cy}`} />
      </circle>
      <text x={cx} y="20" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Aminoglycosides distort the 30S subunit (misreading); macrolides block the 50S exit tunnel</text>
    </svg>
  );
}

export function CampSignalingDiagram() {
  const steps = ["Hormone", "GPCR", "Gs protein", "Adenylate cyclase", "cAMP", "Protein kinase A", "Phosphorylated target"];
  const colW = 88;
  return (
    <svg viewBox={`0 0 ${steps.length * colW + 20} 110`} className="w-full" role="img" aria-label="cAMP signaling cascade diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s}>
            <Step x={x} y={35} w={76} h={40} label={s} color={i === 4 ? amber : violet} />
            {i < steps.length - 1 && <Arrow x1={x + 76} y1={55} x2={x + colW - 4} y2={55} />}
          </g>
        );
      })}
      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="7s" repeatCount="indefinite" path={`M 48 55 ${steps.map((_, i) => `L ${10 + i * colW + 38} 55`).join(" ")}`} />
      </circle>
      <text x={(steps.length * colW + 20) / 2} y="18" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Second-messenger amplification — one hormone molecule activates many PKA targets (signal cascade)</text>
      <text x={(steps.length * colW + 20) / 2} y="100" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Cholera toxin locks Gs "on"; pertussis toxin locks Gi "off" — both raise cAMP</text>
    </svg>
  );
}

export function VitaminDActivationDiagram() {
  const steps = [
    { label: "7-Dehydrocholesterol", sub: "skin, UV light" },
    { label: "Cholecalciferol (D3)", sub: "skin/diet" },
    { label: "25-OH-D", sub: "liver hydroxylation" },
    { label: "1,25-(OH)₂-D", sub: "kidney, PTH-stimulated ★" },
  ];
  const colW = 128;
  return (
    <svg viewBox={`0 0 ${steps.length * colW + 20} 120`} className="w-full" role="img" aria-label="Vitamin D activation pathway diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s.label}>
            <Step x={x} y={40} w={114} h={44} label={s.label} sub={s.sub} color={i === 3 ? amber : teal} />
            {i < steps.length - 1 && <Arrow x1={x + 114} y1={62} x2={x + colW - 6} y2={62} />}
          </g>
        );
      })}
      <circle r="5" fill={teal.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path={`M 67 62 ${steps.map((_, i) => `L ${10 + i * colW + 57} 62`).join(" ")}`} />
      </circle>
      <text x={(steps.length * colW + 20) / 2} y="20" textAnchor="middle" fontSize="10.5" fill="var(--color-muted-foreground)">The kidney's 1α-hydroxylase step is rate-limiting and stimulated by PTH — impaired in chronic kidney disease</text>
    </svg>
  );
}

export function CoriCycleDiagram() {
  return (
    <svg viewBox="0 0 460 210" className="w-full" role="img" aria-label="Cori cycle diagram">
      <ArrowDefs />
      <rect x="20" y="20" width="180" height="170" rx="14" fill={rose.bg} opacity={0.3} />
      <text x="110" y="38" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={rose.fg}>Muscle</text>
      <Step x={40} y={55} w={140} label="Glucose" color={rose} />
      <Arrow x1={110} y1={95} x2={110} y2={113} />
      <Step x={40} y={118} w={140} label="Pyruvate → Lactate" color={rose} />

      <rect x="260" y="20" width="180" height="170" rx="14" fill={teal.bg} opacity={0.3} />
      <text x="350" y="38" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={teal.fg}>Liver</text>
      <Step x={280} y={118} w={140} label="Lactate → Pyruvate" color={teal} />
      <Arrow x1={350} y1={113} x2={350} y2={95} />
      <Step x={280} y={55} w={140} label="Glucose (gluconeogenesis)" color={teal} />

      <Arrow x1={180} y1={130} x2={278} y2={130} />
      <text x="230" y="122" textAnchor="middle" fontSize="8.5" fill="var(--color-muted-foreground)">blood</text>
      <Arrow x1={280} y1={65} x2={182} y2={65} />
      <text x="230" y="57" textAnchor="middle" fontSize="8.5" fill="var(--color-muted-foreground)">blood</text>

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M 110 75 L 110 130 L 350 130 L 350 75 L 110 75" />
      </circle>
      <text x="230" y="200" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Shifts the ATP cost of gluconeogenesis to the liver during intense exercise</text>
    </svg>
  );
}

export function GlucoseAlanineCycleDiagram() {
  return (
    <svg viewBox="0 0 460 210" className="w-full" role="img" aria-label="Glucose-alanine cycle diagram">
      <ArrowDefs />
      <rect x="20" y="20" width="180" height="170" rx="14" fill={violet.bg} opacity={0.3} />
      <text x="110" y="38" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={violet.fg}>Muscle</text>
      <Step x={40} y={55} w={140} label="Pyruvate + amino acid N" color={violet} />
      <Arrow x1={110} y1={95} x2={110} y2={113} />
      <Step x={40} y={118} w={140} label="Alanine" color={violet} />

      <rect x="260" y="20" width="180" height="170" rx="14" fill={amber.bg} opacity={0.3} />
      <text x="350" y="38" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={amber.fg}>Liver</text>
      <Step x={280} y={118} w={140} label="Alanine → Pyruvate + NH₃" color={amber} />
      <Arrow x1={350} y1={113} x2={350} y2={95} />
      <Step x={280} y={55} w={140} label="Glucose + Urea" color={amber} />

      <Arrow x1={180} y1={130} x2={278} y2={130} />
      <Arrow x1={280} y1={65} x2={182} y2={65} />

      <circle r="4.5" fill={rose.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M 110 75 L 110 130 L 350 130 L 350 75 L 110 75" />
      </circle>
      <text x="230" y="200" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Carries nitrogen (as alanine) from muscle to liver for urea synthesis, and carbon back as glucose</text>
    </svg>
  );
}

export function GlycationDiagram() {
  return (
    <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label="Nonenzymatic glycation and HbA1c diagram">
      <ArrowDefs />
      <Step x={20} y={40} w={150} label="Glucose" color={teal} />
      <Arrow x1={170} y1={60} x2={198} y2={60} />
      <Step x={200} y={40} w={130} label="Hemoglobin" color={teal} />
      <Arrow x1={330} y1={60} x2={358} y2={60} />
      <circle cx="380" cy="60" r="42" fill={amber.bg} stroke={amber.fg} strokeOpacity={0.4} />
      <text x="380" y="56" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={amber.fg}>HbA1c</text>
      <text x="380" y="70" textAnchor="middle" fontSize="8" fill={amber.fg}>glycated Hb</text>

      <rect x="20" y="110" width="400" height="46" rx="10" fill={rose.bg} opacity={0.5} />
      <text x="220" y="128" textAnchor="middle" fontSize="10" fill={rose.fg}>Nonenzymatic — no enzyme needed, proportional to average glucose over the RBC lifespan</text>
      <text x="220" y="145" textAnchor="middle" fontSize="9.5" fill={rose.fg}>Reflects glycemic control over the prior ~3 months (RBC lifespan ≈ 120 days)</text>

      <circle r="4.5" fill={teal.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 95 55 L 265 55 L 380 55" />
      </circle>
    </svg>
  );
}

export function CollagenSynthesisDiagram() {
  const steps = ["Pre-procollagen (ER)", "Hydroxylation", "Triple helix formation", "Secretion (Golgi)", "Cross-linking (lysyl oxidase)"];
  const colW = 108;
  return (
    <svg viewBox={`0 0 ${steps.length * colW + 20} 130`} className="w-full" role="img" aria-label="Collagen synthesis diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        const color = i === 1 ? amber : i === 4 ? rose : violet;
        return (
          <g key={s}>
            <Step x={x} y={45} w={96} h={44} label={s} color={color} />
            {i < steps.length - 1 && <Arrow x1={x + 96} y1={67} x2={x + colW - 6} y2={67} />}
          </g>
        );
      })}
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="7s" repeatCount="indefinite" path={`M 58 67 ${steps.map((_, i) => `L ${10 + i * colW + 48} 67`).join(" ")}`} />
      </circle>
      <text x={(steps.length * colW + 20) / 2} y={20} textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Vitamin C is needed for hydroxylation; copper for lysyl oxidase cross-linking — both fail in their respective deficiencies</text>
    </svg>
  );
}

export function ImmunoglobulinStructureDiagram() {
  return (
    <svg viewBox="0 0 420 220" className="w-full" role="img" aria-label="Immunoglobulin structure diagram">
      <ArrowDefs />
      <line x1="210" y1="20" x2="140" y2="90" stroke={violet.fg} strokeWidth={6} strokeOpacity={0.5} strokeLinecap="round" />
      <line x1="210" y1="20" x2="280" y2="90" stroke={violet.fg} strokeWidth={6} strokeOpacity={0.5} strokeLinecap="round" />
      <line x1="140" y1="90" x2="140" y2="180" stroke={teal.fg} strokeWidth={8} strokeOpacity={0.5} strokeLinecap="round" />
      <line x1="280" y1="90" x2="280" y2="180" stroke={teal.fg} strokeWidth={8} strokeOpacity={0.5} strokeLinecap="round" />
      <line x1="140" y1="90" x2="280" y2="90" stroke={amber.fg} strokeWidth={5} strokeOpacity={0.5} />

      <text x="100" y="55" fontSize="9.5" fontWeight={700} fill={violet.fg}>Light chain</text>
      <text x="290" y="140" fontSize="9.5" fontWeight={700} fill={teal.fg}>Heavy chain</text>
      <text x="145" y="105" fontSize="8.5" fontWeight={700} fill={amber.fg}>Hinge (disulfide)</text>

      <circle cx="140" cy="55" r="16" fill={rose.bg} stroke={rose.fg} strokeOpacity={0.4} />
      <text x="140" y="59" textAnchor="middle" fontSize="7.5" fontWeight={700} fill={rose.fg}>VL</text>
      <circle cx="280" cy="55" r="16" fill={rose.bg} stroke={rose.fg} strokeOpacity={0.4} />
      <text x="280" y="59" textAnchor="middle" fontSize="7.5" fontWeight={700} fill={rose.fg}>VH</text>
      <text x="210" y="10" textAnchor="middle" fontSize="9" fill={rose.fg}>Fab — variable regions bind antigen</text>

      <rect x="115" y="140" width="190" height="50" rx="8" fill={emerald.bg} opacity={0.4} />
      <text x="210" y="170" textAnchor="middle" fontSize="9.5" fontWeight={700} fill={emerald.fg}>Fc region — effector function</text>

      <text x="210" y="210" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">2 heavy + 2 light chains; Fab binds antigen, Fc mediates complement/phagocyte binding</text>
    </svg>
  );
}

export function AntioxidantDefenseDiagram() {
  return (
    <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label="Antioxidant defense cascade diagram">
      <ArrowDefs />
      <Step x={10} y={45} w={110} label="O₂•⁻" sub="superoxide" color={rose} />
      <Arrow x1={120} y1={65} x2={148} y2={65} />
      <text x="134" y="55" textAnchor="middle" fontSize="8" fontWeight={700} fill={amber.fg}>SOD</text>
      <Step x={150} y={45} w={110} label="H₂O₂" color={amber} />
      <Arrow x1={260} y1={65} x2={288} y2={65} />
      <text x="274" y="55" textAnchor="middle" fontSize="8" fontWeight={700} fill={teal.fg}>Catalase / GPx</text>
      <Step x={290} y={45} w={160} label="H₂O + O₂" color={teal} />

      <rect x="10" y="105" width="440" height="46" rx="10" fill={violet.bg} opacity={0.4} />
      <text x="230" y="123" textAnchor="middle" fontSize="10" fill={violet.fg}>Glutathione peroxidase is selenium-dependent; regenerating reduced glutathione needs NADPH (HMP shunt)</text>
      <text x="230" y="140" textAnchor="middle" fontSize="9.5" fill={violet.fg}>G6PD deficiency → less NADPH → weaker antioxidant defense → RBC oxidative hemolysis</text>

      <circle r="4.5" fill={rose.fg}>
        <animateMotion dur="4.5s" repeatCount="indefinite" path="M 65 65 L 205 65 L 370 65" />
      </circle>
    </svg>
  );
}

export function XenobioticMetabolismDiagram() {
  return (
    <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label="Xenobiotic Phase I and Phase II metabolism diagram">
      <ArrowDefs />
      <Step x={20} y={50} w={140} label="Drug / xenobiotic" color={teal} />
      <Arrow x1={160} y1={70} x2={188} y2={70} />
      <Step x={190} y={50} w={140} label="Phase I" sub="Cytochrome P450 oxidation" color={amber} />
      <Arrow x1={330} y1={70} x2={358} y2={70} />

      <g transform="translate(40,0)">
        <Step x={330} y={50} w={100} h={40} label="Phase II" sub="conjugation" color={rose} />
      </g>

      <rect x="20" y="110" width="410" height="46" rx="10" fill={violet.bg} opacity={0.4} />
      <text x="225" y="128" textAnchor="middle" fontSize="10" fill={violet.fg}>Phase II adds glucuronic acid, sulfate, or glutathione — increases water solubility for renal/biliary excretion</text>
      <text x="225" y="145" textAnchor="middle" fontSize="9.5" fill={violet.fg}>Paracetamol overdose: glutathione depletion lets the toxic Phase I metabolite (NAPQI) accumulate</text>

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="4.5s" repeatCount="indefinite" path="M 90 70 L 260 70 L 380 70" />
      </circle>
    </svg>
  );
}

export function VitaminKCycleDiagram() {
  return (
    <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label="Vitamin K cycle and warfarin diagram">
      <ArrowDefs />
      <Step x={20} y={30} w={170} label="Vitamin K (reduced)" color={teal} />
      <Arrow x1={190} y1={50} x2={220} y2={50} />
      <text x="205" y="42" textAnchor="middle" fontSize="8" fontWeight={700} fill={amber.fg}>γ-carboxylase</text>
      <Step x={230} y={30} w={210} label="Clotting factors II, VII, IX, X activated" color={amber} />

      <Arrow x1={315} y1={70} x2={315} y2={90} />
      <Step x={230} y={95} w={210} label="Vitamin K epoxide" color={rose} />
      <path d="M 230 115 L 90 115 L 90 70" stroke={violet.fg} strokeWidth={1.8} fill="none" markerEnd="url(#arrowhead)" opacity={0.6} />
      <text x="130" y="130" fontSize="8.5" fontWeight={700} fill={violet.fg}>epoxide reductase (VKORC1)</text>
      <rect x="20" y="140" width="420" height="26" rx="7" fill={rose.bg} opacity={0.5} />
      <text x="230" y="157" textAnchor="middle" fontSize="9.5" fill={rose.fg}>Warfarin blocks VKORC1 — depletes active vitamin K, lowering factors II, VII, IX, X</text>

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 105 50 L 315 50 L 315 105 L 90 105 L 90 50" />
      </circle>
    </svg>
  );
}

export function IronMetabolismDiagram() {
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Iron metabolism and hepcidin diagram">
      <ArrowDefs />
      <Step x={20} y={30} w={140} label="Dietary Fe²⁺" sub="duodenal absorption" color={teal} />
      <Arrow x1={160} y1={50} x2={188} y2={50} />
      <Step x={190} y={30} w={130} label="Ferroportin" sub="exports Fe from cell" color={amber} />
      <Arrow x1={320} y1={50} x2={348} y2={50} />
      <Step x={350} y={30} w={100} label="Transferrin" sub="plasma transport" color={violet} />

      <circle cx="255" cy="130" r="48" fill={rose.bg} stroke={rose.fg} strokeOpacity={0.4} />
      <text x="255" y="126" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={rose.fg}>Hepcidin</text>
      <text x="255" y="140" textAnchor="middle" fontSize="8" fill={rose.fg}>↑ inflammation</text>
      <path d="M 255 90 L 255 70" stroke={rose.fg} strokeWidth={2} markerEnd="url(#arrowhead)" opacity={0.6} />
      <text x="255" y="80" textAnchor="middle" fontSize="8" fill={rose.fg}>degrades ferroportin</text>

      <rect x="20" y="160" width="420" height="26" rx="7" fill={teal.bg} opacity={0.4} />
      <text x="230" y="177" textAnchor="middle" fontSize="9.5" fill={teal.fg}>Anemia of chronic disease: hepcidin ↑ traps iron in cells — low serum iron despite normal/high ferritin</text>

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 90 50 L 255 50 L 400 50" />
      </circle>
    </svg>
  );
}

export function NeurotransmitterSynthesisDiagram() {
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Amino acid-derived neurotransmitter synthesis diagram">
      <ArrowDefs />
      <Step x={20} y={30} w={120} label="Tryptophan" color={violet} />
      <Arrow x1={80} y1={70} x2={80} y2={88} />
      <Step x={20} y={93} w={120} label="Serotonin" color={violet} />
      <Arrow x1={80} y1={133} x2={80} y2={151} />
      <Step x={20} y={156} w={120} label="Melatonin" color={violet} />

      <Step x={320} y={30} w={120} label="Tyrosine" color={amber} />
      <Arrow x1={380} y1={70} x2={380} y2={88} />
      <Step x={320} y={93} w={120} label="Dopamine" color={amber} />
      <Arrow x1={380} y1={133} x2={380} y2={151} />
      <Step x={320} y={156} w={120} label="Norepinephrine → Epinephrine" color={amber} />

      <circle r="4.5" fill={violet.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 80 50 L 80 113 L 80 176" />
      </circle>
      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 380 50 L 380 113 L 380 176" />
      </circle>
      <text x="230" y="20" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Carcinoid syndrome shunts tryptophan toward serotonin, causing niacin (B3) deficiency (pellagra-like symptoms)</text>
    </svg>
  );
}

export function BcaaCatabolismDiagram() {
  return (
    <svg viewBox="0 0 460 150" className="w-full" role="img" aria-label="Branched-chain amino acid catabolism diagram">
      <ArrowDefs />
      <Step x={20} y={40} w={190} label="Leucine, Isoleucine, Valine" color={teal} />
      <Arrow x1={210} y1={60} x2={238} y2={60} />
      <circle cx="270" cy="60" r="38" fill={amber.bg} stroke={amber.fg} strokeOpacity={0.4} />
      <text x="270" y="56" textAnchor="middle" fontSize="9" fontWeight={700} fill={amber.fg}>Branched-chain</text>
      <text x="270" y="68" textAnchor="middle" fontSize="9" fontWeight={700} fill={amber.fg}>α-KA dehydrogenase</text>
      <Arrow x1={308} y1={60} x2={336} y2={60} />
      <Step x={338} y={40} w={110} label="Acetyl/Succinyl-CoA" color={rose} />

      <rect x="20" y="95" width="428" height="46" rx="10" fill={violet.bg} opacity={0.4} />
      <text x="234" y="113" textAnchor="middle" fontSize="10" fill={violet.fg}>Maple syrup urine disease: this enzyme (lipoic-acid dependent, like pyruvate dehydrogenase) is deficient</text>
      <text x="234" y="130" textAnchor="middle" fontSize="9.5" fill={violet.fg}>Sweet, burnt-sugar smelling urine; treated with dietary BCAA restriction</text>

      <circle r="4.5" fill={teal.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 100 60 L 270 60 L 400 60" />
      </circle>
    </svg>
  );
}

export function ZymogenActivationDiagram() {
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Zymogen activation cascade diagram">
      <ArrowDefs />
      <Step x={20} y={20} w={180} label="Trypsinogen" color={teal} />
      <Arrow x1={110} y1={60} x2={110} y2={80} />
      <text x="150" y="75" fontSize="8.5" fontWeight={700} fill={amber.fg}>Enteropeptidase (brush border)</text>
      <Step x={20} y={85} w={180} label="Trypsin" color={amber} />

      <Arrow x1={200} y1={105} x2={240} y2={105} />
      <text x="220" y="98" fontSize="8" fill={violet.fg}>autoactivates more</text>

      <Step x={250} y={20} w={190} label="Chymotrypsinogen → Chymotrypsin" color={rose} />
      <Step x={250} y={85} w={190} label="Proelastase → Elastase" color={rose} />
      <Step x={250} y={150} w={190} label="Procarboxypeptidase → Carboxypeptidase" color={rose} />
      <Arrow x1={110} y1={105} x2={250} y2={40} />
      <Arrow x1={110} y1={105} x2={250} y2={105} />
      <Arrow x1={110} y1={105} x2={250} y2={165} />

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 110 40 L 110 105" />
      </circle>
      <text x="230" y="185" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">Trypsin is the master activator — one enzyme unlocks the entire pancreatic protease cascade</text>
    </svg>
  );
}

export function StarvationTimelineDiagram() {
  const stages = [
    { label: "0–24 h", sub: "liver glycogenolysis" },
    { label: "1–3 days", sub: "gluconeogenesis (alanine, glycerol, lactate)" },
    { label: "3+ days", sub: "muscle protein spared; ketone bodies rise" },
    { label: "Prolonged fast", sub: "brain shifts to ketones for ~⅔ of fuel" },
  ];
  const colW = 128;
  return (
    <svg viewBox={`0 0 ${stages.length * colW + 20} 120`} className="w-full" role="img" aria-label="Starvation fuel metabolism timeline diagram">
      <ArrowDefs />
      {stages.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s.label}>
            <Step x={x} y={40} w={114} h={44} label={s.label} sub={s.sub} color={[teal, amber, rose, violet][i]!} />
            {i < stages.length - 1 && <Arrow x1={x + 114} y1={62} x2={x + colW - 6} y2={62} />}
          </g>
        );
      })}
      <circle r="5" fill={amber.fg}>
        <animateMotion dur="7s" repeatCount="indefinite" path={`M 67 62 ${stages.map((_, i) => `L ${10 + i * colW + 57} 62`).join(" ")}`} />
      </circle>
      <text x={(stages.length * colW + 20) / 2} y={20} textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Ketone bodies spare muscle protein during prolonged fasting by giving the brain a glucose-independent fuel</text>
    </svg>
  );
}

export function B12AbsorptionDiagram() {
  const steps = [
    { label: "Dietary B12", sub: "bound to food protein" },
    { label: "Released by pepsin/acid", sub: "stomach" },
    { label: "Binds intrinsic factor", sub: "from parietal cells" },
    { label: "Absorbed via cubilin receptor", sub: "terminal ileum" },
  ];
  const colW = 118;
  return (
    <svg viewBox={`0 0 ${steps.length * colW + 20} 120`} className="w-full" role="img" aria-label="Vitamin B12 absorption pathway diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s.label}>
            <Step x={x} y={40} w={106} h={44} label={s.label} sub={s.sub} color={i === 2 ? amber : teal} />
            {i < steps.length - 1 && <Arrow x1={x + 106} y1={62} x2={x + colW - 6} y2={62} />}
          </g>
        );
      })}
      <circle r="5" fill={teal.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path={`M 63 62 ${steps.map((_, i) => `L ${10 + i * colW + 53} 62`).join(" ")}`} />
      </circle>
      <text x={(steps.length * colW + 20) / 2} y={20} textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Pernicious anemia: autoimmune destruction of parietal cells or anti-intrinsic-factor antibodies blocks this pathway</text>
    </svg>
  );
}

export function ElisaWorkflowDiagram() {
  const steps = [
    { label: "Coat plate", sub: "capture antibody/antigen" },
    { label: "Add sample", sub: "target binds" },
    { label: "Add enzyme-linked antibody", sub: "detection step" },
    { label: "Add substrate", sub: "color develops" },
    { label: "Read absorbance", sub: "quantify signal" },
  ];
  const colW = 100;
  return (
    <svg viewBox={`0 0 ${steps.length * colW + 20} 120`} className="w-full" role="img" aria-label="ELISA workflow diagram">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * colW;
        return (
          <g key={s.label}>
            <Step x={x} y={40} w={88} h={44} label={s.label} sub={s.sub} color={i === 3 ? amber : violet} />
            {i < steps.length - 1 && <Arrow x1={x + 88} y1={62} x2={x + colW - 4} y2={62} />}
          </g>
        );
      })}
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="6.5s" repeatCount="indefinite" path={`M 54 62 ${steps.map((_, i) => `L ${10 + i * colW + 44} 62`).join(" ")}`} />
      </circle>
      <text x={(steps.length * colW + 20) / 2} y={20} textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Used clinically for HIV screening, hormone assays (e.g. hCG), and autoimmune antibody panels</text>
    </svg>
  );
}

export function MonosaccharideClassificationDiagram() {
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="Monosaccharide classification diagram">
      <ArrowDefs />
      <rect x="20" y="20" width="420" height="34" rx="8" fill={violet.bg} opacity={0.4} />
      <text x="230" y="42" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={violet.fg}>Monosaccharide</text>

      <Arrow x1={140} y1={54} x2={100} y2={78} />
      <Arrow x1={320} y1={54} x2={360} y2={78} />
      <Step x={30} y={80} w={140} label="Aldose" sub="aldehyde group (glucose)" color={teal} />
      <Step x={290} y={80} w={140} label="Ketose" sub="ketone group (fructose)" color={amber} />

      <rect x="20" y="135" width="420" height="50" rx="10" fill={rose.bg} opacity={0.4} />
      <text x="230" y="153" textAnchor="middle" fontSize="9.5" fill={rose.fg}>Also classified by carbon count: triose (3C), tetrose (4C), pentose (5C), hexose (6C)</text>
      <text x="230" y="171" textAnchor="middle" fontSize="9.5" fill={rose.fg}>Epimers differ at one carbon (glucose/galactose = C4); anomers differ at the anomeric carbon (α/β)</text>

      <circle r="4.5" fill={teal.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 230 35 L 100 90" />
      </circle>
    </svg>
  );
}

export function GlycosidicBondDiagram() {
  const rows = [
    { label: "Starch — amylose", sub: "α-1,4 linked, unbranched", color: teal },
    { label: "Starch — amylopectin", sub: "α-1,4 + α-1,6 branches (~every 24-30)", color: amber },
    { label: "Glycogen", sub: "α-1,4 + α-1,6 branches (~every 8-10, more compact)", color: rose },
    { label: "Cellulose", sub: "β-1,4 linked — indigestible by human enzymes", color: violet },
  ];
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Glycosidic bond comparison diagram">
      <ArrowDefs />
      {rows.map((r, i) => (
        <g key={r.label}>
          <rect x={20} y={20 + i * 40} width={420} height={32} rx={8} fill={r.color.bg} opacity={0.45} />
          <text x={35} y={40 + i * 40} fontSize="10.5" fontWeight={700} fill={r.color.fg}>{r.label}</text>
          <text x={230} y={40 + i * 40} fontSize="9" fill={r.color.fg}>{r.sub}</text>
        </g>
      ))}
      <circle r="4" fill={amber.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 30 36 L 30 76 L 30 116 L 30 156 L 30 36" />
      </circle>
    </svg>
  );
}

export function ProteinStructureLevelsDiagram() {
  const levels = [
    { label: "Primary", sub: "amino acid sequence", color: teal },
    { label: "Secondary", sub: "α-helix / β-sheet (H-bonds)", color: amber },
    { label: "Tertiary", sub: "3D fold (side-chain interactions, disulfides)", color: rose },
    { label: "Quaternary", sub: "multiple subunits assembled", color: violet },
  ];
  const colW = 112;
  return (
    <svg viewBox={`0 0 ${levels.length * colW + 20} 120`} className="w-full" role="img" aria-label="Levels of protein structure diagram">
      <ArrowDefs />
      {levels.map((l, i) => {
        const x = 10 + i * colW;
        return (
          <g key={l.label}>
            <Step x={x} y={40} w={100} h={44} label={l.label} sub={l.sub} color={l.color} />
            {i < levels.length - 1 && <Arrow x1={x + 100} y1={62} x2={x + colW - 6} y2={62} />}
          </g>
        );
      })}
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="6s" repeatCount="indefinite" path={`M 60 62 ${levels.map((_, i) => `L ${10 + i * colW + 50} 62`).join(" ")}`} />
      </circle>
      <text x={(levels.length * colW + 20) / 2} y={20} textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Denaturation disrupts 2°/3°/4° structure but leaves peptide bonds (primary structure) intact</text>
    </svg>
  );
}

export function IsoelectricPointDiagram() {
  const curve = "M 40 40 C 130 40, 150 160, 240 160 S 350 40, 440 40";
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="Amino acid titration curve and isoelectric point diagram">
      <ArrowDefs />
      <line x1="40" y1="170" x2="450" y2="170" stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
      <line x1="40" y1="170" x2="40" y2="20" stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
      <text x="245" y="192" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">OH⁻ added →</text>
      <text x="16" y="95" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)" transform="rotate(-90 16 95)">pH →</text>
      <path d={curve} fill="none" stroke={violet.fg} strokeWidth={2.5} />
      <line x1="240" y1="20" x2="240" y2="170" stroke={amber.fg} strokeOpacity={0.5} strokeDasharray="4 4" />
      <text x="240" y="14" textAnchor="middle" fontSize="10" fontWeight={700} fill={amber.fg}>pI (net charge = 0)</text>
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path={curve} />
      </circle>
      <text x="245" y="188" textAnchor="middle" fontSize="0.001" opacity={0}>.</text>
      <text x="130" y="60" fontSize="9" fill={teal.fg}>net +</text>
      <text x="350" y="150" fontSize="9" fill={rose.fg}>net −</text>
      <text x="245" y="20" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)" opacity={0}> </text>
    </svg>
  );
}

export function EnzymeInhibitionDiagram() {
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="Types of enzyme inhibition diagram">
      <ArrowDefs />
      <rect x="20" y="20" width="200" height="70" rx="10" fill={teal.bg} opacity={0.45} />
      <text x="120" y="42" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={teal.fg}>Competitive</text>
      <text x="120" y="58" textAnchor="middle" fontSize="9" fill={teal.fg}>↑Km, Vmax unchanged</text>
      <text x="120" y="73" textAnchor="middle" fontSize="9" fill={teal.fg}>overcome by ↑[substrate]</text>

      <rect x="240" y="20" width="200" height="70" rx="10" fill={amber.bg} opacity={0.45} />
      <text x="340" y="42" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={amber.fg}>Noncompetitive</text>
      <text x="340" y="58" textAnchor="middle" fontSize="9" fill={amber.fg}>Km unchanged, ↓Vmax</text>
      <text x="340" y="73" textAnchor="middle" fontSize="9" fill={amber.fg}>binds a site other than active site</text>

      <rect x="20" y="105" width="200" height="70" rx="10" fill={rose.bg} opacity={0.45} />
      <text x="120" y="127" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={rose.fg}>Uncompetitive</text>
      <text x="120" y="143" textAnchor="middle" fontSize="9" fill={rose.fg}>↓Km and ↓Vmax</text>
      <text x="120" y="158" textAnchor="middle" fontSize="9" fill={rose.fg}>binds only the ES complex</text>

      <rect x="240" y="105" width="200" height="70" rx="10" fill={violet.bg} opacity={0.45} />
      <text x="340" y="127" textAnchor="middle" fontSize="10.5" fontWeight={700} fill={violet.fg}>Irreversible</text>
      <text x="340" y="143" textAnchor="middle" fontSize="9" fill={violet.fg}>covalent modification</text>
      <text x="340" y="158" textAnchor="middle" fontSize="9" fill={violet.fg}>e.g. aspirin on COX (acetylation)</text>
    </svg>
  );
}

export function AllostericRegulationDiagram() {
  const curve = "M 40 170 C 150 170, 160 30, 260 30 S 380 170, 440 170";
  return (
    <svg viewBox="0 0 460 200" className="w-full" role="img" aria-label="Allosteric enzyme regulation diagram">
      <ArrowDefs />
      <line x1="40" y1="180" x2="450" y2="180" stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
      <line x1="40" y1="180" x2="40" y2="20" stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
      <path d="M 40 170 C 90 60, 220 40, 420 38" fill="none" stroke={teal.fg} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="4 3" />
      <text x="380" y="30" fontSize="8.5" fill={teal.fg}>Michaelis-Menten (hyperbolic)</text>
      <path d="M 40 175 C 140 175, 170 30, 260 30 C 320 30, 380 100, 430 38" fill="none" stroke={violet.fg} strokeWidth={2.5} />
      <text x="150" y="120" fontSize="9" fontWeight={700} fill={violet.fg}>Allosteric enzyme (sigmoidal)</text>
      <text x="245" y="196" textAnchor="middle" fontSize="9.5" fill="var(--color-muted-foreground)">[Substrate] →</text>
      <circle r="5" fill={violet.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 40 175 C 140 175, 170 30, 260 30 C 320 30, 380 100, 430 38" />
      </circle>
      <text x="245" y="14" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Cooperative binding gives a sigmoidal curve — the basis of feedback (end-product) inhibition, e.g. ATP inhibiting PFK-1</text>
    </svg>
  );
}

export function MetabolicBlockDisordersDiagram() {
  const rows = [
    { label: "Phenylalanine → Tyrosine blocked", sub: "PAH deficiency → PKU", color: teal },
    { label: "Galactose-1-P → Glucose-1-P blocked", sub: "GALT deficiency → Galactosemia", color: amber },
    { label: "Fructose-1-P → DHAP + G3P blocked", sub: "Aldolase B deficiency → HFI", color: rose },
    { label: "Homogentisate oxidation blocked", sub: "Homogentisate oxidase deficiency → Alkaptonuria", color: violet },
  ];
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Inborn errors as metabolic blocks diagram">
      <ArrowDefs />
      {rows.map((r, i) => (
        <g key={r.label}>
          <rect x={20} y={20 + i * 40} width={420} height={32} rx={8} fill={r.color.bg} opacity={0.45} />
          <text x={35} y={40 + i * 40} fontSize="9.5" fontWeight={700} fill={r.color.fg}>{r.label}</text>
          <text x={430} y={40 + i * 40} textAnchor="end" fontSize="9" fill={r.color.fg}>{r.sub}</text>
        </g>
      ))}
      <circle r="4" fill={amber.fg}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M 30 36 L 30 76 L 30 116 L 30 156 L 30 36" />
      </circle>
    </svg>
  );
}

export function LysosomalStorageDiseasesDiagram() {
  const rows = [
    { disease: "Tay-Sachs", enzyme: "Hexosaminidase A", accumulates: "GM2 ganglioside", color: teal },
    { disease: "Gaucher", enzyme: "Glucocerebrosidase", accumulates: "Glucocerebroside", color: amber },
    { disease: "Niemann-Pick", enzyme: "Sphingomyelinase", accumulates: "Sphingomyelin", color: rose },
    { disease: "Fabry", enzyme: "α-galactosidase A", accumulates: "Ceramide trihexoside", color: violet },
    { disease: "Hurler", enzyme: "α-L-iduronidase", accumulates: "Heparan/dermatan sulfate", color: emerald },
  ];
  return (
    <svg viewBox="0 0 460 210" className="w-full" role="img" aria-label="Lysosomal storage diseases diagram">
      <ArrowDefs />
      <text x="130" y="16" fontSize="9" fontWeight={700} fill="var(--color-muted-foreground)">Disease</text>
      <text x="290" y="16" fontSize="9" fontWeight={700} fill="var(--color-muted-foreground)">Enzyme deficient</text>
      <text x="420" y="16" fontSize="9" fontWeight={700} fill="var(--color-muted-foreground)" textAnchor="end">Accumulates</text>
      {rows.map((r, i) => (
        <g key={r.disease}>
          <rect x={20} y={22 + i * 36} width={420} height={30} rx={7} fill={r.color.bg} opacity={0.4} />
          <text x={30} y={41 + i * 36} fontSize="9.5" fontWeight={700} fill={r.color.fg}>{r.disease}</text>
          <text x={230} y={41 + i * 36} textAnchor="middle" fontSize="9" fill={r.color.fg}>{r.enzyme}</text>
          <text x={430} y={41 + i * 36} textAnchor="end" fontSize="9" fill={r.color.fg}>{r.accumulates}</text>
        </g>
      ))}
    </svg>
  );
}

export function EnergyBalanceDiagram() {
  return (
    <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label="Energy balance diagram">
      <ArrowDefs />
      <Step x={20} y={20} w={170} label="Energy intake" sub="food & drink" color={emerald} />
      <text x="230" y="45" textAnchor="middle" fontSize="16" fontWeight={700} fill="var(--color-muted-foreground)">vs</text>
      <Step x={270} y={20} w={170} label="Energy expenditure" sub="BMR + activity + thermic effect" color={rose} />

      <rect x="20" y="80" width="420" height="76" rx="10" fill={amber.bg} opacity={0.4} />
      <text x="230" y="100" textAnchor="middle" fontSize="10" fontWeight={700} fill={amber.fg}>Intake &gt; Expenditure → weight gain (positive balance)</text>
      <text x="230" y="118" textAnchor="middle" fontSize="10" fontWeight={700} fill={amber.fg}>Intake &lt; Expenditure → weight loss (negative balance)</text>
      <text x="230" y="140" textAnchor="middle" fontSize="9.5" fill={amber.fg}>BMR is the largest component of expenditure in most sedentary people (~60-70%)</text>

      <circle r="4.5" fill={violet.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 105 40 L 355 40" />
      </circle>
    </svg>
  );
}

export function ProteinEnergyMalnutritionDiagram() {
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Kwashiorkor vs marasmus comparison diagram">
      <ArrowDefs />
      <rect x="20" y="20" width="200" height="150" rx="12" fill={rose.bg} opacity={0.4} />
      <text x="120" y="42" textAnchor="middle" fontSize="11" fontWeight={700} fill={rose.fg}>Kwashiorkor</text>
      <text x="120" y="62" textAnchor="middle" fontSize="9" fill={rose.fg}>Protein deficiency,</text>
      <text x="120" y="76" textAnchor="middle" fontSize="9" fill={rose.fg}>adequate calories</text>
      <text x="120" y="98" textAnchor="middle" fontSize="9" fill={rose.fg}>Edema (↓oncotic pressure)</text>
      <text x="120" y="114" textAnchor="middle" fontSize="9" fill={rose.fg}>Fatty liver</text>
      <text x="120" y="130" textAnchor="middle" fontSize="9" fill={rose.fg}>Hypoalbuminemia</text>
      <text x="120" y="146" textAnchor="middle" fontSize="9" fill={rose.fg}>"Flaky paint" skin lesions</text>

      <rect x="240" y="20" width="200" height="150" rx="12" fill={teal.bg} opacity={0.4} />
      <text x="340" y="42" textAnchor="middle" fontSize="11" fontWeight={700} fill={teal.fg}>Marasmus</text>
      <text x="340" y="62" textAnchor="middle" fontSize="9" fill={teal.fg}>Total calorie-protein</text>
      <text x="340" y="76" textAnchor="middle" fontSize="9" fill={teal.fg}>deficiency</text>
      <text x="340" y="98" textAnchor="middle" fontSize="9" fill={teal.fg}>Severe wasting, no edema</text>
      <text x="340" y="114" textAnchor="middle" fontSize="9" fill={teal.fg}>"Old man" facies</text>
      <text x="340" y="130" textAnchor="middle" fontSize="9" fill={teal.fg}>Muscle/fat loss</text>
      <text x="340" y="146" textAnchor="middle" fontSize="9" fill={teal.fg}>Preserved albumin (relatively)</text>
    </svg>
  );
}

export function ElastinCrossLinkingDiagram() {
  return (
    <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label="Elastin desmosine cross-linking diagram">
      <ArrowDefs />
      <Step x={20} y={20} w={160} label="Tropoelastin" sub="soluble precursor" color={teal} />
      <Arrow x1={180} y1={40} x2={208} y2={40} />
      <text x="194" y="32" textAnchor="middle" fontSize="8" fontWeight={700} fill={amber.fg}>Lysyl oxidase (Cu²⁺)</text>
      <Step x={210} y={20} w={230} label="Cross-linked elastin network" sub="desmosine bonds between lysines" color={amber} />

      <rect x="20" y="90" width="420" height="60" rx="10" fill={violet.bg} opacity={0.4} />
      <text x="230" y="110" textAnchor="middle" fontSize="10" fill={violet.fg}>Unlike collagen, tropoelastin lacks hydroxyproline/hydroxylysine — no vitamin C dependence</text>
      <text x="230" y="130" textAnchor="middle" fontSize="9.5" fill={violet.fg}>Gives lungs, large arteries, and ligaments their reversible stretch/recoil</text>

      <circle r="4.5" fill={amber.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 100 40 L 325 40" />
      </circle>
    </svg>
  );
}

export function ProteoglycanAggregateDiagram() {
  return (
    <svg viewBox="0 0 460 180" className="w-full" role="img" aria-label="Proteoglycan aggregate structure diagram">
      <ArrowDefs />
      <line x1="40" y1="90" x2="420" y2="90" stroke={violet.fg} strokeWidth={4} strokeOpacity={0.5} />
      <text x="230" y="75" textAnchor="middle" fontSize="9.5" fontWeight={700} fill={violet.fg}>Hyaluronic acid backbone</text>
      {[80, 160, 240, 320, 400].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="90" x2={x} y2="140" stroke={teal.fg} strokeWidth={3} strokeOpacity={0.6} />
          <circle cx={x} cy="145" r="10" fill={amber.bg} stroke={amber.fg} strokeOpacity={0.5} />
        </g>
      ))}
      <text x="230" y="165" textAnchor="middle" fontSize="9" fill={teal.fg}>Aggrecan core proteins (via link proteins) + GAG side chains (chondroitin/keratan sulfate)</text>
      <text x="230" y="30" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">Negative charge of GAGs attracts water → gives cartilage its compressive resistance</text>
      <circle r="4.5" fill={violet.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 40 90 L 420 90" />
      </circle>
    </svg>
  );
}

export function FentonReactionDiagram() {
  return (
    <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label="Fenton reaction diagram">
      <ArrowDefs />
      <Step x={20} y={50} w={130} label="H₂O₂ + Fe²⁺" color={teal} />
      <Arrow x1={150} y1={70} x2={178} y2={70} />
      <Step x={180} y={50} w={140} label="•OH + OH⁻ + Fe³⁺" sub="hydroxyl radical" color={rose} />
      <Arrow x1={320} y1={70} x2={348} y2={70} />
      <Step x={350} y={50} w={100} label="Lipid/DNA damage" color={violet} />

      <rect x="20" y="110" width="420" height="46" rx="10" fill={amber.bg} opacity={0.4} />
      <text x="230" y="130" textAnchor="middle" fontSize="10" fill={amber.fg}>The hydroxyl radical (•OH) is the most reactive ROS — causes lipid peroxidation and DNA strand breaks</text>
      <text x="230" y="147" textAnchor="middle" fontSize="9.5" fill={amber.fg}>Iron overload (hemochromatosis) increases free Fe²⁺, fueling Fenton chemistry and tissue damage</text>

      <circle r="4.5" fill={rose.fg}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 85 70 L 250 70 L 400 70" />
      </circle>
    </svg>
  );
}

export function VitaminClassificationDiagram() {
  const fatSoluble = ["A", "D", "E", "K"];
  const waterSoluble = ["B1", "B2", "B3", "B6", "B12", "Folate", "C"];
  return (
    <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Fat-soluble vs water-soluble vitamins diagram">
      <ArrowDefs />
      <rect x="20" y="20" width="200" height="150" rx="12" fill={amber.bg} opacity={0.4} />
      <text x="120" y="42" textAnchor="middle" fontSize="11" fontWeight={700} fill={amber.fg}>Fat-soluble</text>
      <text x="120" y="60" textAnchor="middle" fontSize="9" fill={amber.fg}>Stored in liver/fat — risk of toxicity</text>
      {fatSoluble.map((v, i) => (
        <text key={v} x="120" y={82 + i * 20} textAnchor="middle" fontSize="10" fontWeight={700} fill={amber.fg}>{v}</text>
      ))}

      <rect x="240" y="20" width="200" height="150" rx="12" fill={teal.bg} opacity={0.4} />
      <text x="340" y="42" textAnchor="middle" fontSize="11" fontWeight={700} fill={teal.fg}>Water-soluble</text>
      <text x="340" y="60" textAnchor="middle" fontSize="9" fill={teal.fg}>Excreted in urine — rarely toxic</text>
      {waterSoluble.map((v, i) => (
        <text key={v} x="340" y={78 + i * 15} textAnchor="middle" fontSize="9.5" fontWeight={700} fill={teal.fg}>{v}</text>
      ))}
    </svg>
  );
}

export function VitaminDeficiencyMapDiagram() {
  const items = [
    { v: "B1 (Thiamine)", d: "Beriberi, Wernicke-Korsakoff" },
    { v: "B2 (Riboflavin)", d: "Angular stomatitis, glossitis" },
    { v: "B3 (Niacin)", d: "Pellagra — dermatitis, diarrhea, dementia" },
    { v: "B6 (Pyridoxine)", d: "Sideroblastic anemia, neuropathy" },
    { v: "B12 (Cobalamin)", d: "Megaloblastic anemia + subacute cord degeneration" },
    { v: "C (Ascorbic acid)", d: "Scurvy — poor wound healing, bleeding gums" },
  ];
  return (
    <svg viewBox="0 0 460 210" className="w-full" role="img" aria-label="Vitamin deficiency clinical correlation diagram">
      <ArrowDefs />
      {items.map((it, i) => (
        <g key={it.v}>
          <rect x={20} y={20 + i * 31} width={420} height={26} rx={7} fill={[teal, amber, rose, violet, emerald, magenta][i % 6]!.bg} opacity={0.4} />
          <text x={30} y={38 + i * 31} fontSize="9.5" fontWeight={700} fill={[teal, amber, rose, violet, emerald, magenta][i % 6]!.fg}>{it.v}</text>
          <text x={430} y={38 + i * 31} textAnchor="end" fontSize="9" fill={[teal, amber, rose, violet, emerald, magenta][i % 6]!.fg}>{it.d}</text>
        </g>
      ))}
    </svg>
  );
}
