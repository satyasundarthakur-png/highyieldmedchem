import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  Layers3,
  Search,
  Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FACTS, TOPICS, type FactItem } from "@/data/facts";
import compoundsData from "@/data/compounds.json";
import {
  getOrInitCard,
  isDue,
  loadSrsState,
  reviewCard,
  saveSrsState,
  type Grade,
} from "@/lib/srs";
import {
  GlycolysisDiagram,
  TCACycleDiagram,
  UreaCycleDiagram,
  ElectronTransportDiagram,
  HmpShuntDiagram,
  BetaOxidationDiagram,
  LipoproteinTransportDiagram,
  HemeSynthesisDiagram,
  DnaReplicationDiagram,
  InsulinGlucagonDiagram,
} from "@/components/pathway-diagrams";

type Tab = "sheets" | "flashcards" | "compounds" | "diagrams";

interface Compound {
  id: string;
  name: string;
  formula: string;
  mass: string;
  smiles: string;
}

const COMPOUNDS = compoundsData as Compound[];

const TOPIC_PALETTE = [
  { bg: "oklch(0.93 0.09 300)", fg: "oklch(0.36 0.17 300)", ring: "oklch(0.55 0.19 300)" },
  { bg: "oklch(0.92 0.08 195)", fg: "oklch(0.34 0.09 210)", ring: "oklch(0.55 0.11 200)" },
  { bg: "oklch(0.92 0.11 75)", fg: "oklch(0.36 0.1 60)", ring: "oklch(0.62 0.14 75)" },
  { bg: "oklch(0.92 0.1 15)", fg: "oklch(0.4 0.16 15)", ring: "oklch(0.58 0.19 15)" },
  { bg: "oklch(0.92 0.09 155)", fg: "oklch(0.35 0.1 155)", ring: "oklch(0.55 0.13 155)" },
  { bg: "oklch(0.91 0.09 250)", fg: "oklch(0.36 0.12 255)", ring: "oklch(0.5 0.16 250)" },
  { bg: "oklch(0.92 0.12 45)", fg: "oklch(0.4 0.13 45)", ring: "oklch(0.62 0.17 45)" },
  { bg: "oklch(0.91 0.1 340)", fg: "oklch(0.38 0.16 340)", ring: "oklch(0.54 0.19 340)" },
  { bg: "oklch(0.92 0.07 210)", fg: "oklch(0.35 0.09 220)", ring: "oklch(0.57 0.1 210)" },
  { bg: "oklch(0.92 0.1 125)", fg: "oklch(0.37 0.11 130)", ring: "oklch(0.62 0.14 125)" },
  { bg: "oklch(0.9 0.1 275)", fg: "oklch(0.34 0.14 278)", ring: "oklch(0.48 0.18 275)" },
  { bg: "oklch(0.92 0.1 30)", fg: "oklch(0.4 0.14 30)", ring: "oklch(0.6 0.17 30)" },
];

function topicColor(topicId: string) {
  const index = TOPICS.findIndex((topic) => topic.id === topicId);
  return TOPIC_PALETTE[(index < 0 ? 0 : index) % TOPIC_PALETTE.length]!;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biochem High-Yield | Exam Revision" },
      {
        name: "description",
        content:
          "Review high-yield biochemistry fact sheets, spaced-repetition flashcards, and a searchable metabolite library.",
      },
      { property: "og:title", content: "Biochem High-Yield | Exam Revision" },
      {
        property: "og:description",
        content:
          "Fact sheets, spaced-repetition flashcards, and a searchable metabolite library for biochemistry revision.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-image.png" },
    ],
  }),
  component: BiochemApp,
});

function BiochemApp() {
  const [tab, setTab] = useState<Tab>("sheets");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="h-1.5 w-full bg-[linear-gradient(90deg,oklch(0.55_0.19_300),oklch(0.6_0.14_195),oklch(0.75_0.16_80),oklch(0.62_0.21_15),oklch(0.6_0.16_155))]" />
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl text-primary-foreground shadow-sm bg-[linear-gradient(135deg,oklch(0.55_0.19_300),oklch(0.58_0.16_255))]">
              <FlaskConical aria-hidden="true" size={21} />
            </div>
            <div>
              <h1 className="font-display text-2xl leading-none text-foreground">
                Biochem High-Yield
              </h1>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Focused exam revision
              </p>
            </div>
          </div>
          <nav aria-label="Study modes" className="grid grid-cols-4 rounded-xl bg-muted p-1">
            <TabButton active={tab === "sheets"} onClick={() => setTab("sheets")} icon={<BookOpen size={16} />} label="Fact Sheets" />
            <TabButton active={tab === "flashcards"} onClick={() => setTab("flashcards")} icon={<Layers3 size={16} />} label="Flashcards" />
            <TabButton active={tab === "diagrams"} onClick={() => setTab("diagrams")} icon={<Waypoints size={16} />} label="Diagrams" />
            <TabButton active={tab === "compounds"} onClick={() => setTab("compounds")} icon={<FlaskConical size={16} />} label="Compounds" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
        {tab === "sheets" && <FactSheets />}
        {tab === "flashcards" && <Flashcards />}
        {tab === "diagrams" && <Diagrams />}
        {tab === "compounds" && <CompoundLookup />}
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground">
        High-yield facts are original summaries for exam revision. Always cross-check your course material.
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <Button
      variant="tab"
      active={active}
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-0 rounded-lg px-2 transition sm:px-3 ${active ? "text-primary shadow-sm" : ""}`}
    >
      {icon}
      <span className="text-xs sm:text-sm">{label}</span>
    </Button>
  );
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-6 border-b border-border pb-5">
      <p className="mb-2 text-xs font-bold uppercase text-primary">{eyebrow}</p>
      <h2 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function FactSheets() {
  const [topicId, setTopicId] = useState<string | null>(null);

  if (!topicId) {
    const units = Array.from(new Set(TOPICS.map((topic) => topic.unit)));
    return (
      <section>
        <SectionIntro eyebrow={`${FACTS.length} essential facts`} title="Choose a pathway" description="Organized by unit and chapter names as used in DM Vasudevan's Textbook of Biochemistry for Medical Students — the sequence most Indian MBBS students study from." />
        <div className="space-y-8">
          {units.map((unit) => (
            <div key={unit}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{unit}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {TOPICS.filter((topic) => topic.unit === unit).map((topic) => {
                  const count = FACTS.filter((fact) => fact.topicId === topic.id).length;
                  const color = topicColor(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setTopicId(topic.id)}
                      style={{ borderTopColor: color.ring }}
                      className="group min-h-36 rounded-xl border border-border border-t-4 bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-xl leading-tight text-card-foreground">{topic.name}</h3>
                        <span
                          style={{ backgroundColor: color.bg, color: color.fg }}
                          className="shrink-0 rounded-full px-2 py-1 text-[11px] font-bold"
                        >
                          {count} facts
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{topic.blurb}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const topic = TOPICS.find((item) => item.id === topicId);
  if (!topic) return null;
  const facts = FACTS.filter((fact) => fact.topicId === topicId);
  const color = topicColor(topicId);

  return (
    <section>
      <Button variant="ghost" onClick={() => setTopicId(null)} className="mb-4 -ml-3"><ArrowLeft size={16} />All topics</Button>
      <SectionIntro eyebrow={`${facts.length} high-yield facts`} title={topic.name} description={topic.blurb} />
      <ol className="space-y-3">
        {facts.map((fact, index) => (
          <li key={fact.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <span
              style={{ backgroundColor: color.bg, color: color.fg }}
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            >
              {index + 1}
            </span>
            <p className="text-sm leading-7 text-card-foreground">{fact.fact}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Flashcards() {
  const [srs, setSrs] = useState<Record<string, ReturnType<typeof getOrInitCard>>>({});
  const [ready, setReady] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [topicFilter, setTopicFilter] = useState<string | "all">("all");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setSrs(loadSrsState());
    setReady(true);
  }, []);

  const pool = useMemo(() => FACTS.filter((fact) => topicFilter === "all" || fact.topicId === topicFilter), [topicFilter]);
  const queue = useMemo(() => {
    const due = pool.filter((fact) => isDue(getOrInitCard(srs, fact.id)));
    return due.length > 0 ? due : pool;
  }, [pool, srs]);
  const current: FactItem | undefined = queue[index % Math.max(queue.length, 1)];
  const dueCount = pool.filter((fact) => isDue(getOrInitCard(srs, fact.id))).length;

  function changeTopic(value: string) {
    setTopicFilter(value);
    setIndex(0);
    setFlipped(false);
  }

  function grade(value: Grade) {
    if (!current) return;
    const next = { ...srs, [current.id]: reviewCard(getOrInitCard(srs, current.id), value) };
    setSrs(next);
    saveSrsState(next);
    setFlipped(false);
    setIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <section>
      <SectionIntro eyebrow="Spaced repetition" title="Recall, then reveal" description="Review due cards and rate your recall. Your schedule is saved on this device." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="topic-filter">Filter flashcards by topic</label>
        <select id="topic-filter" value={topicFilter} onChange={(event) => changeTopic(event.target.value)} className="min-h-10 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All topics ({FACTS.length})</option>
          {Array.from(new Set(TOPICS.map((topic) => topic.unit))).map((unit) => (
            <optgroup key={unit} label={unit}>
              {TOPICS.filter((topic) => topic.unit === unit).map((topic) => (
                <option key={topic.id} value={topic.id}>{topic.name} ({FACTS.filter((fact) => fact.topicId === topic.id).length})</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="text-xs font-semibold text-muted-foreground">{ready ? `${dueCount} due for review` : "Loading review schedule"}</span>
      </div>

      {current ? (
        <>
          <button
            onClick={() => setFlipped((value) => !value)}
            style={{ borderTopColor: topicColor(current.topicId).ring }}
            className="flex min-h-72 w-full items-center justify-center rounded-2xl border border-border border-t-4 bg-card p-7 text-center shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-80 sm:p-12"
            aria-label={flipped ? "Show question" : "Reveal answer"}
          >
            <div className="max-w-2xl">
              <span
                style={{ backgroundColor: topicColor(current.topicId).bg, color: topicColor(current.topicId).fg }}
                className="mb-5 inline-block rounded-full px-3 py-1 text-xs font-bold"
              >
                {flipped ? "Answer" : "Question"}
              </span>
              <p className="font-display text-2xl leading-relaxed text-card-foreground sm:text-3xl">{flipped ? current.answer : current.question}</p>
            </div>
          </button>
          <p className="mt-3 text-center text-xs font-medium text-muted-foreground">{flipped ? "How well did you remember?" : "Tap the card to reveal the answer"}</p>
          {flipped && (
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <GradeButton variant="again" label="Again" sub="Review tomorrow" onClick={() => grade(1)} />
              <GradeButton variant="hard" label="Hard" sub="1 day" onClick={() => grade(3)} />
              <GradeButton variant="good" label="Good" sub="Up to 6 days" onClick={() => grade(4)} />
              <GradeButton variant="easy" label="Easy" sub="Longer interval" onClick={() => grade(5)} />
            </div>
          )}
        </>
      ) : <p className="py-16 text-center text-muted-foreground">No cards in this topic yet.</p>}
    </section>
  );
}

function GradeButton({ variant, label, sub, onClick }: { variant: "again" | "hard" | "good" | "easy"; label: string; sub: string; onClick: () => void }) {
  return <Button variant={variant} onClick={onClick} className="h-16 flex-col gap-0 rounded-xl"><span>{label}</span><span className="text-[10px] font-medium opacity-75">{sub}</span></Button>;
}

const GALLERY_ICONS = [
  { src: "/icons/mitochondria.svg", label: "Mitochondrion", caption: "Site of the TCA cycle and oxidative phosphorylation.", topicId: "tca-etc" },
  { src: "/icons/dna-double-helix.svg", label: "DNA double helix", caption: "Antiparallel strands, A-T (2 H-bonds) and G-C (3 H-bonds) pairing.", topicId: "nucleic-acid" },
  { src: "/icons/atp.svg", label: "ATP", caption: "Adenosine triphosphate — the cell's energy currency, three phosphoanhydride-linked phosphates.", topicId: "nucleic-acid" },
  { src: "/icons/red-blood-cell.svg", label: "Red blood cell", caption: "No mitochondria — depends entirely on glycolysis and the HMP shunt.", topicId: "glycogen-hmp" },
  { src: "/icons/restriction-enzyme.svg", label: "Restriction enzyme", caption: "Cuts DNA at palindromic recognition sequences — the basis of recombinant DNA tools.", topicId: "biotech" },
  { src: "/icons/ribosome.svg", label: "Ribosome", caption: "Large + small subunit; site of mRNA translation into protein.", topicId: "molbio" },
  { src: "/icons/nephron.svg", label: "Nephron", caption: "Functional unit of the kidney — filtration, reabsorption, and acid-base regulation.", topicId: "water-electrolyte" },
  { src: "/icons/liver-healthy.svg", label: "Healthy liver", caption: "Central hub of gluconeogenesis, urea synthesis, and detoxification.", topicId: "organ-function" },
  { src: "/icons/liver-cirrhotic.svg", label: "Cirrhotic liver", caption: "Fibrotic replacement of healthy tissue — impairs synthetic function (↓albumin, ↑PT).", topicId: "organ-function" },
  { src: "/icons/proteoglycan.svg", label: "Proteoglycan", caption: "Core protein + GAG chains — gives cartilage its water-binding, compression resistance.", topicId: "ecm" },
  { src: "/icons/phospholipid.svg", label: "Phospholipid", caption: "Amphipathic head/tail structure — the basic unit of every cell membrane.", topicId: "lipid" },
  { src: "/icons/antibody.svg", label: "Antibody (VDJ recombination)", caption: "How heavy-chain gene segments recombine to generate antibody diversity.", topicId: "plasma-proteins" },
];

const DIAGRAMS: { topicId: string; title: string; description: string; Component: () => ReactNode }[] = [
  { topicId: "glycolysis", title: "Glycolysis", description: "Glucose → pyruvate, 10 steps, cytosolic.", Component: GlycolysisDiagram },
  { topicId: "glycogen-hmp", title: "HMP Shunt (Pentose Phosphate Pathway)", description: "NADPH and ribose-5-phosphate production from glucose-6-phosphate.", Component: HmpShuntDiagram },
  { topicId: "tca-etc", title: "TCA (Krebs) Cycle", description: "Acetyl-CoA oxidation in the mitochondrial matrix — 8 intermediates per turn.", Component: TCACycleDiagram },
  { topicId: "tca-etc", title: "Electron Transport Chain", description: "Inner mitochondrial membrane — electron flow drives the proton gradient.", Component: ElectronTransportDiagram },
  { topicId: "lipid", title: "Beta-Oxidation", description: "Spiral shortening of a fatty acyl chain, 2 carbons at a time.", Component: BetaOxidationDiagram },
  { topicId: "lipid", title: "Lipoprotein Transport", description: "Chylomicrons, VLDL, LDL, HDL — who carries what, and to where.", Component: LipoproteinTransportDiagram },
  { topicId: "amino-acid", title: "Urea Cycle", description: "Split across mitochondria and cytosol — ammonia disposal as urea.", Component: UreaCycleDiagram },
  { topicId: "heme", title: "Heme Synthesis", description: "Alternates between mitochondria and cytosol; lead poisoning blocks two steps.", Component: HemeSynthesisDiagram },
  { topicId: "molbio", title: "DNA Replication Fork", description: "Leading vs lagging strand synthesis at the replication fork.", Component: DnaReplicationDiagram },
  { topicId: "endocrine", title: "Insulin vs Glucagon", description: "The reciprocal hormone see-saw between the fed and fasting state.", Component: InsulinGlucagonDiagram },
];

function DiagramCard({ title, description, color, children }: { title: string; description: string; color: { bg: string; fg: string; ring: string }; children: ReactNode }) {
  return (
    <div style={{ borderTopColor: color.ring }} className="rounded-xl border border-border border-t-4 bg-card p-4 shadow-sm sm:p-6">
      <h3 className="font-display text-xl text-card-foreground">{title}</h3>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">{description}</p>
      <div className="overflow-x-auto rounded-lg bg-muted/40 p-3">{children}</div>
    </div>
  );
}

function Diagrams() {
  const units = Array.from(new Set(TOPICS.map((topic) => topic.unit)));
  return (
    <section>
      <SectionIntro
        eyebrow={`${DIAGRAMS.length} animated pathway maps`}
        title="See the pathways move"
        description="Original diagrams built for this app — grouped by the same chapter units as the fact sheets, each with flow direction and rate-limiting steps animated."
      />
      <div className="space-y-10">
        {units.map((unit) => {
          const unitTopicIds = new Set(TOPICS.filter((t) => t.unit === unit).map((t) => t.id));
          const diagramsInUnit = DIAGRAMS.filter((d) => unitTopicIds.has(d.topicId));
          const iconsInUnit = GALLERY_ICONS.filter((g) => unitTopicIds.has(g.topicId));
          if (diagramsInUnit.length === 0 && iconsInUnit.length === 0) return null;
          return (
            <div key={unit}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{unit}</h3>
              {diagramsInUnit.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {diagramsInUnit.map((d, i) => {
                    const color = topicColor(d.topicId);
                    const D = d.Component;
                    return (
                      <DiagramCard key={unit + d.title + i} title={d.title} description={d.description} color={color}>
                        <D />
                      </DiagramCard>
                    );
                  })}
                </div>
              )}
              {iconsInUnit.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {iconsInUnit.map((icon) => {
                    const color = topicColor(icon.topicId);
                    return (
                      <figure key={icon.src} style={{ borderTopColor: color.ring }} className="rounded-xl border border-border border-t-4 bg-card p-3 text-center shadow-sm">
                        <img src={icon.src} alt={icon.label} className="mx-auto h-16 w-16 object-contain" loading="lazy" />
                        <figcaption className="mt-2">
                          <p className="text-xs font-bold text-card-foreground">{icon.label}</p>
                          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{icon.caption}</p>
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">Reference illustrations are free/public domain (CC0) via Bioicons.com contributors — see public/icons/CREDITS.md. Pathway diagrams are original artwork made for this app.</p>
    </section>
  );
}

function CompoundLookup() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return COMPOUNDS;
    return COMPOUNDS.filter((compound) => compound.name.toLowerCase().includes(normalized) || compound.formula.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <section>
      <SectionIntro eyebrow={`${COMPOUNDS.length} curated metabolites`} title="Compound reference" description="Search by metabolite name or molecular formula for a quick biochemical reference." />
      <div className="relative mb-3">
        <Search aria-hidden="true" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <label className="sr-only" htmlFor="compound-search">Search compounds</label>
        <input id="compound-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pyruvate, NAD+, glucose…" className="min-h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
      </div>
      <p aria-live="polite" className="mb-4 text-xs font-medium text-muted-foreground">Showing {results.length} of {COMPOUNDS.length} compounds</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {results.map((compound, index) => {
          const color = TOPIC_PALETTE[index % TOPIC_PALETTE.length]!;
          return (
            <article key={compound.id} className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-bold text-card-foreground">{compound.name}</h3>
                {compound.mass !== "null" && <span className="shrink-0 text-xs text-muted-foreground">{compound.mass} g/mol</span>}
              </div>
              <p style={{ backgroundColor: color.bg, color: color.fg }} className="mt-2 inline-block break-all rounded-md px-2 py-0.5 font-mono text-xs">
                {compound.formula || "Formula unavailable"}
              </p>
            </article>
          );
        })}
        {results.length === 0 && <p className="col-span-2 py-12 text-center text-sm text-muted-foreground">No compound matches “{query}”.</p>}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Formulas and masses are from the ModelSEED biochemistry database (public domain).</p>
    </section>
  );
}