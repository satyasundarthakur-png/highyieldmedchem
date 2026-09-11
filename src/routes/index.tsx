import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  ExternalLink,
  FlaskConical,
  Layers3,
  Search,
  Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FACTS, TOPICS, type FactItem } from "@/data/facts";
import { MCQS, type McqItem } from "@/data/mcqs";
import compoundsData from "@/data/compounds.json";
import { COMPOUND_NOTES } from "@/data/compound-notes";
import { TOPIC_PALETTE } from "@/lib/palette";
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
  EnzymeKineticsDiagram,
  GlycogenMetabolismDiagram,
  TransaminationDiagram,
  PurineDegradationDiagram,
  CholesterolSynthesisDiagram,
  DigestionJourneyDiagram,
  AcidBaseBufferDiagram,
  PcrCycleDiagram,
  FattyAcidSynthesisDiagram,
  KetogenesisDiagram,
  OneCarbonFolateDiagram,
  AdrenalSteroidogenesisDiagram,
  ThyroidHormoneSynthesisDiagram,
  CoagulationCascadeDiagram,
  CalciumRegulationDiagram,
  BilirubinMetabolismDiagram,
  MethionineTranssulfurationDiagram,
  TranslationCycleDiagram,
  CampSignalingDiagram,
  VitaminDActivationDiagram,
  CoriCycleDiagram,
  GlucoseAlanineCycleDiagram,
  GlycationDiagram,
  CollagenSynthesisDiagram,
  ImmunoglobulinStructureDiagram,
  AntioxidantDefenseDiagram,
  XenobioticMetabolismDiagram,
  VitaminKCycleDiagram,
  IronMetabolismDiagram,
  NeurotransmitterSynthesisDiagram,
  BcaaCatabolismDiagram,
  ZymogenActivationDiagram,
  StarvationTimelineDiagram,
  B12AbsorptionDiagram,
  ElisaWorkflowDiagram,
  MonosaccharideClassificationDiagram,
  GlycosidicBondDiagram,
  ProteinStructureLevelsDiagram,
  IsoelectricPointDiagram,
  EnzymeInhibitionDiagram,
  AllostericRegulationDiagram,
  MetabolicBlockDisordersDiagram,
  LysosomalStorageDiseasesDiagram,
  EnergyBalanceDiagram,
  ProteinEnergyMalnutritionDiagram,
  ElastinCrossLinkingDiagram,
  ProteoglycanAggregateDiagram,
  FentonReactionDiagram,
  VitaminClassificationDiagram,
  VitaminDeficiencyMapDiagram,
  RaasDiagram,
  ChromosomalDisordersDiagram,
  OncogeneTumorSuppressorDiagram,
  TumorMarkersDiagram,
  ThyroidFunctionTestsDiagram,
} from "@/components/pathway-diagrams";

type Tab = "sheets" | "flashcards" | "compounds" | "diagrams" | "practical";

interface Compound {
  id: string;
  name: string;
  formula: string;
  mass: string;
  smiles: string;
}

const COMPOUNDS = compoundsData as Compound[];

function topicColor(topicId: string) {
  const index = TOPICS.findIndex((topic) => topic.id === topicId);
  return TOPIC_PALETTE[(index < 0 ? 0 : index) % TOPIC_PALETTE.length]!;
}

const TOPIC_PEARLS: Record<string, string> = {
  "chem-carb": "Lactose intolerance (lactase deficiency) is far more common worldwide than lactase persistence; galactosemia (GALT deficiency) causes cataracts and liver damage in infancy if untreated — both are classic 'sugar chemistry' exam vignettes.",
  "chem-protein": "Sickle cell disease (a Glu→Val substitution on beta-globin) and scurvy (impaired collagen hydroxylation from vitamin C deficiency) are the two most-tested protein chemistry disorders — one from a primary sequence defect, one from a failed post-translational modification.",
  "nucleic-acid": "A G-C-rich DNA segment has a higher melting temperature than an A-T-rich one (3 vs 2 hydrogen bonds per pair) — this principle underlies PCR primer design and Tm calculations.",
  enzymes: "Isoenzymes like CK-MB (cardiac) vs CK-MM (skeletal muscle) let clinicians localize tissue injury using the same catalytic reaction — the biochemical basis of cardiac biomarker panels.",
  "tca-etc": "Thiamine (B1) deficiency impairs pyruvate dehydrogenase and α-ketoglutarate dehydrogenase — both TPP/lipoic-acid-dependent — explaining the lactic acidosis and neurologic findings of Wernicke encephalopathy.",
  glycolysis: "The Warburg effect (aerobic glycolysis favored by cancer cells) is the biochemical basis of FDG-PET imaging — tumors take up more radiolabeled glucose analog than surrounding normal tissue.",
  "glycogen-hmp": "Pompe disease (lysosomal acid α-glucosidase deficiency, glycogen storage disease type II) causes cardiomegaly and hypotonia in infancy — unlike the other glycogenoses, it's a lysosomal defect, not a cytosolic enzyme defect.",
  lipid: "Carnitine deficiency (primary or secondary to valproate therapy) impairs the carnitine shuttle and can mimic a fatty-acid oxidation defect — muscle weakness with hypoketotic hypoglycemia.",
  "amino-acid": "Phenylketonuria (phenylalanine hydroxylase deficiency) causes intellectual disability that is preventable with dietary phenylalanine restriction — the classic newborn-screening success story.",
  "plasma-proteins": "A markedly elevated ESR/CRP alongside a low albumin reflects the acute-phase response — albumin is a negative acute-phase reactant, so it falls during significant inflammation or illness.",
  ecm: "Osteogenesis imperfecta (a type I collagen defect) causes blue sclerae, multiple fractures, and hearing loss — 'brittle bone disease' is a direct consequence of abnormal collagen triple-helix formation.",
  molbio: "Xeroderma pigmentosum (defective nucleotide excision repair) causes extreme UV sensitivity and early skin cancers — a direct clinical demonstration of what happens when thymine-dimer repair fails.",
  biotech: "Non-invasive prenatal testing (NIPT) for trisomies sequences cell-free fetal DNA circulating in maternal plasma — a direct clinical application of PCR and sequencing technology.",
  heme: "Acute intermittent porphyria (porphobilinogen deaminase deficiency) presents with abdominal pain, neuropsychiatric symptoms, and port-wine urine — classically triggered by drugs that induce ALA synthase (e.g. barbiturates).",
  vitamins: "Vitamin B12 deficiency causes megaloblastic anemia plus subacute combined degeneration of the spinal cord, unlike folate deficiency (megaloblastic anemia alone) — always check B12 before giving folate, to avoid masking neurologic damage.",
  "water-electrolyte": "Winter's formula predicts the expected respiratory compensation for a metabolic acidosis; a measured pCO₂ that doesn't match the prediction signals a mixed acid-base disorder.",
  endocrine: "MEN syndromes are classic exam favorites — MEN1 (the '3 P's': pituitary, parathyroid, pancreas) vs MEN2 (medullary thyroid carcinoma + pheochromocytoma) — each tied to a distinct gene (MEN1 vs RET).",
  nutrition: "Refeeding syndrome — a sudden insulin surge after starvation drives phosphate, potassium, and magnesium into cells — causes severe hypophosphatemia and cardiac arrhythmias in malnourished patients refed too quickly.",
  digestion: "Dumping syndrome after gastric surgery causes rapid carbohydrate delivery to the small bowel, triggering an exaggerated insulin response and reactive hypoglycemia — a direct consequence of altered digestive physiology.",
  iem: "Newborn screening by tandem mass spectrometry now detects dozens of inborn errors of metabolism before symptoms appear — early detection of PKU, MSUD, and others prevents irreversible neurologic damage.",
  "organ-function": "A disproportionate rise in alkaline phosphatase and GGT relative to AST/ALT points to a cholestatic rather than hepatocellular pattern of liver injury.",
  "free-radicals": "Paraquat poisoning generates massive reactive oxygen species in lung tissue via redox cycling, causing pulmonary fibrosis — a feared outcome in agricultural/occupational toxicology.",
};

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

function LandingPage({ onEnter }: { onEnter: (tab: Tab) => void }) {
  const stats = [
    { label: "Chapters", value: "22" },
    { label: "High-yield facts", value: `${FACTS.length}+` },
    { label: "Animated diagrams", value: "65" },
    { label: "Compounds", value: "99" },
  ];
  const features: { tab: Tab; title: string; description: string; icon: ReactNode; color: { bg: string; fg: string; ring: string } }[] = [
    { tab: "sheets", title: "Fact Sheets", description: "Concise, chapter-by-chapter facts with clinical pearls and further reading.", icon: <BookOpen size={22} />, color: TOPIC_PALETTE[0]! },
    { tab: "flashcards", title: "Flashcards", description: "Spaced-repetition review, sorted by topic and due date.", icon: <Layers3 size={22} />, color: TOPIC_PALETTE[2]! },
    { tab: "diagrams", title: "Diagrams", description: "Animated pathway maps you can tap to enlarge, grouped by chapter.", icon: <Waypoints size={22} />, color: TOPIC_PALETTE[4]! },
    { tab: "compounds", title: "Compounds", description: "Searchable metabolite library with clinical significance for each.", icon: <FlaskConical size={22} />, color: TOPIC_PALETTE[6]! },
    { tab: "practical", title: "Practical & Viva", description: "Exam-station walkthroughs plus a searchable viva voce question bank.", icon: <ClipboardList size={22} />, color: TOPIC_PALETTE[9]! },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="h-1.5 w-full bg-[linear-gradient(90deg,oklch(0.55_0.19_300),oklch(0.6_0.14_195),oklch(0.75_0.16_80),oklch(0.62_0.21_15),oklch(0.6_0.16_155))]" />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,oklch(0.94_0.08_300),oklch(0.93_0.07_195)_45%,oklch(0.94_0.1_75))] p-6 text-center shadow-sm sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 size-48 rounded-full bg-white/30 blur-2xl" />

          <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl text-primary-foreground shadow-md bg-[linear-gradient(135deg,oklch(0.55_0.19_300),oklch(0.58_0.16_255))] sm:size-20">
            <FlaskConical aria-hidden="true" size={34} />
          </div>
          <h1 className="relative mt-5 font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Biochem High-Yield
          </h1>
          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Fact sheets, flashcards, animated pathway diagrams, and a compound reference — chaptered the way Indian MBBS students actually study, with clinical pearls throughout.
          </p>

          <div className="relative mt-7 flex flex-wrap justify-center gap-2 sm:gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/70 px-4 py-2 text-center shadow-sm backdrop-blur">
                <p className="font-display text-xl text-foreground sm:text-2xl">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <Button onClick={() => onEnter("sheets")} className="relative mt-8 h-12 rounded-xl px-8 text-base shadow-md">
            Start Studying
          </Button>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2">
          {features.map((f) => (
            <button
              key={f.tab}
              type="button"
              onClick={() => onEnter(f.tab)}
              style={{ borderTopColor: f.color.ring }}
              className="group rounded-xl border border-border border-t-4 bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div style={{ backgroundColor: f.color.bg, color: f.color.fg }} className="flex size-11 items-center justify-center rounded-xl">
                {f.icon}
              </div>
              <h3 className="mt-3 font-display text-xl text-card-foreground">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              <span className="mt-3 inline-block text-xs font-bold" style={{ color: f.color.fg }}>Explore →</span>
            </button>
          ))}
        </div>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground">
        High-yield facts are original summaries for exam revision. Always cross-check your course material.
      </footer>
    </div>
  );
}

function BiochemApp() {
  const [tab, setTab] = useState<Tab>("sheets");
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <LandingPage onEnter={(t) => { setTab(t); setEntered(true); }} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="h-1.5 w-full bg-[linear-gradient(90deg,oklch(0.55_0.19_300),oklch(0.6_0.14_195),oklch(0.75_0.16_80),oklch(0.62_0.21_15),oklch(0.6_0.16_155))]" />
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setEntered(false)} className="flex size-10 items-center justify-center rounded-xl text-primary-foreground shadow-sm bg-[linear-gradient(135deg,oklch(0.55_0.19_300),oklch(0.58_0.16_255))]" aria-label="Back to home">
              <FlaskConical aria-hidden="true" size={21} />
            </button>
            <div>
              <h1 className="font-display text-2xl leading-none text-foreground">
                Biochem High-Yield
              </h1>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Focused exam revision
              </p>
            </div>
          </div>
          <nav aria-label="Study modes" className="grid grid-cols-5 rounded-xl bg-muted p-1">
            <TabButton active={tab === "sheets"} onClick={() => setTab("sheets")} icon={<BookOpen size={16} />} label="Fact Sheets" />
            <TabButton active={tab === "flashcards"} onClick={() => setTab("flashcards")} icon={<Layers3 size={16} />} label="Flashcards" />
            <TabButton active={tab === "diagrams"} onClick={() => setTab("diagrams")} icon={<Waypoints size={16} />} label="Diagrams" />
            <TabButton active={tab === "compounds"} onClick={() => setTab("compounds")} icon={<FlaskConical size={16} />} label="Compounds" />
            <TabButton active={tab === "practical"} onClick={() => setTab("practical")} icon={<ClipboardList size={16} />} label="Practical" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
        {tab === "sheets" && <FactSheets />}
        {tab === "flashcards" && <Flashcards />}
        {tab === "diagrams" && <Diagrams />}
        {tab === "compounds" && <CompoundLookup />}
        {tab === "practical" && <Practical />}
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
      <span className="hidden text-xs sm:inline sm:text-sm">{label}</span>
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

function FurtherReading({ topicName, color }: { topicName: string; color: { bg: string; fg: string } }) {
  const q = encodeURIComponent(topicName);
  const links = [
    { label: "Wikipedia", sub: "quick overview & references", href: `https://en.wikipedia.org/wiki/Special:Search?search=${q}&go=Go` },
    { label: "NCBI Bookshelf", sub: "free full-text biochemistry textbooks (Berg, Lehninger excerpts)", href: `https://www.ncbi.nlm.nih.gov/books/?term=${q}` },
    { label: "LibreTexts Chemistry", sub: "open-access biochemistry course text", href: `https://chem.libretexts.org/Search?query=${q}` },
  ];
  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Want the full text? Read further, free</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ borderTopColor: color.fg }}
            className="group flex flex-col gap-1 rounded-lg border border-border border-t-4 bg-muted/40 p-3 text-sm transition hover:brightness-95"
          >
            <span className="flex items-center gap-1.5 font-bold text-card-foreground">
              {link.label}
              <ExternalLink size={12} className="opacity-60" />
            </span>
            <span className="text-xs leading-snug text-muted-foreground">{link.sub}</span>
          </a>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">These search directly on each free, open-access resource for "{topicName}" — no login or purchase needed.</p>
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
      {TOPIC_PEARLS[topicId] && <ClinicalPearl text={TOPIC_PEARLS[topicId]!} color={color} />}
      <ol className="mt-4 space-y-3">
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
      <FurtherReading topicName={topic.name} color={color} />
    </section>
  );
}

function Flashcards() {
  const [mode, setMode] = useState<"cards" | "mcq">("cards");
  return (
    <section>
      <SectionIntro eyebrow="Spaced repetition + NEET PG practice" title="Recall, then reveal" description="Review due cards, or switch to timed multiple-choice practice in the style commonly drilled at Indian coaching centers." />
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1 sm:w-80">
        <Button variant="tab" active={mode === "cards"} onClick={() => setMode("cards")} className={mode === "cards" ? "text-primary shadow-sm" : ""}>
          <Layers3 size={16} /> Flashcards
        </Button>
        <Button variant="tab" active={mode === "mcq"} onClick={() => setMode("mcq")} className={mode === "mcq" ? "text-primary shadow-sm" : ""}>
          <ClipboardList size={16} /> MCQ Practice
        </Button>
      </div>
      {mode === "cards" ? <FlashcardMode /> : <McqPractice />}
    </section>
  );
}

function McqPractice() {
  const [topicFilter, setTopicFilter] = useState<string | "all">("all");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, attempted: 0 });

  const pool = useMemo(() => MCQS.filter((q) => topicFilter === "all" || q.topicId === topicFilter), [topicFilter]);
  const current: McqItem | undefined = pool[index % Math.max(pool.length, 1)];

  function changeTopic(value: string) {
    setTopicFilter(value);
    setIndex(0);
    setSelected(null);
    setScore({ correct: 0, attempted: 0 });
  }

  function choose(optionId: string) {
    if (selected || !current) return;
    setSelected(optionId);
    setScore((s) => ({ correct: s.correct + (optionId === current.correctOptionId ? 1 : 0), attempted: s.attempted + 1 }));
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  if (!current) return <p className="py-16 text-center text-muted-foreground">No MCQs in this topic yet.</p>;
  const color = topicColor(current.topicId);
  const topic = TOPICS.find((t) => t.id === current.topicId);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="mcq-topic-filter">Filter MCQs by topic</label>
        <select id="mcq-topic-filter" value={topicFilter} onChange={(e) => changeTopic(e.target.value)} className="min-h-10 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All topics ({MCQS.length})</option>
          {Array.from(new Set(TOPICS.map((t) => t.unit))).map((unit) => (
            <optgroup key={unit} label={unit}>
              {TOPICS.filter((t) => t.unit === unit && MCQS.some((q) => q.topicId === t.id)).map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({MCQS.filter((q) => q.topicId === t.id).length})</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="text-xs font-semibold text-muted-foreground">Score: {score.correct}/{score.attempted}</span>
      </div>

      <div style={{ borderTopColor: color.ring }} className="rounded-2xl border border-border border-t-4 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span style={{ backgroundColor: color.bg, color: color.fg }} className="inline-block rounded-full px-3 py-1 text-xs font-bold">{topic?.name}</span>
          <span className="text-xs font-medium text-muted-foreground">Q{(index % pool.length) + 1} of {pool.length}</span>
        </div>
        <p className="mt-4 font-display text-xl leading-relaxed text-card-foreground sm:text-2xl">{current.question}</p>

        <div className="mt-5 space-y-2">
          {current.options.map((opt) => {
            const isCorrect = opt.id === current.correctOptionId;
            const isSelected = opt.id === selected;
            let stateClasses = "border-border bg-card hover:bg-muted/50";
            if (selected) {
              if (isCorrect) stateClasses = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
              else if (isSelected) stateClasses = "border-rose-500 bg-rose-50 dark:bg-rose-950/30";
            }
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt.id)}
                disabled={!!selected}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${stateClasses} disabled:cursor-default`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">{opt.id}</span>
                <span className="text-card-foreground">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-5 rounded-lg p-4" style={{ backgroundColor: color.bg }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: color.fg }}>
              {selected === current.correctOptionId ? "Correct" : "Not quite"}
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: color.fg }}>{current.explanation}</p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button onClick={next} disabled={!selected} className="rounded-lg">Next question →</Button>
        </div>
      </div>
    </div>
  );
}

function FlashcardMode() {
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
    <div>
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
    </div>
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

const DIAGRAMS: { topicId: string; title: string; description: string; pearl: string; Component: () => ReactNode }[] = [
  { topicId: "enzymes", title: "Enzyme Kinetics (Michaelis-Menten)", description: "How velocity rises with substrate concentration toward Vmax; Km marks half-max.", pearl: "Competitive inhibitors raise the apparent Km but leave Vmax unchanged (excess substrate overcomes them); noncompetitive inhibitors lower Vmax but leave Km unchanged. Examiners test this via Lineweaver-Burk (1/v vs 1/[S]) plots.", Component: EnzymeKineticsDiagram },
  { topicId: "glycolysis", title: "Glycolysis", description: "Glucose → pyruvate, 10 steps, cytosolic.", pearl: "Pyruvate kinase deficiency is the most common glycolytic enzyme defect causing hereditary non-spherocytic hemolytic anemia — RBCs have no mitochondria and depend entirely on glycolysis for ATP.", Component: GlycolysisDiagram },
  { topicId: "glycogen-hmp", title: "HMP Shunt (Pentose Phosphate Pathway)", description: "NADPH and ribose-5-phosphate production from glucose-6-phosphate.", pearl: "G6PD deficiency is the most common enzyme deficiency worldwide (X-linked). Oxidative stress — fava beans, sulfa drugs, antimalarials, infection — precipitates hemolysis with Heinz bodies and 'bite cells' on smear.", Component: HmpShuntDiagram },
  { topicId: "glycogen-hmp", title: "Glycogen Metabolism", description: "Glycogenesis vs glycogenolysis — opposite enzymes, opposite hormones.", pearl: "Von Gierke disease (glucose-6-phosphatase deficiency, type I) causes severe fasting hypoglycemia, lactic acidosis, and hepatomegaly. McArdle disease (myophosphorylase deficiency, type V) causes exercise intolerance with no rise in lactate.", Component: GlycogenMetabolismDiagram },
  { topicId: "tca-etc", title: "TCA (Krebs) Cycle", description: "Acetyl-CoA oxidation in the mitochondrial matrix — 8 intermediates per turn.", pearl: "Arsenic inhibits lipoic acid-dependent enzymes (pyruvate dehydrogenase, α-ketoglutarate dehydrogenase), halting the cycle — vomiting, garlic-odor breath, and rice-water stools are classic clues.", Component: TCACycleDiagram },
  { topicId: "tca-etc", title: "Electron Transport Chain", description: "Inner mitochondrial membrane — electron flow drives the proton gradient.", pearl: "Cyanide blocks Complex IV; treatment uses nitrites to generate methemoglobin (which binds cyanide) followed by thiosulfate. Uncouplers (2,4-dinitrophenol) dissipate the proton gradient without making ATP, releasing the energy as heat instead.", Component: ElectronTransportDiagram },
  { topicId: "lipid", title: "Beta-Oxidation", description: "Spiral shortening of a fatty acyl chain, 2 carbons at a time.", pearl: "MCAD deficiency (medium-chain acyl-CoA dehydrogenase) is the classic fatty-acid oxidation defect — infants present with hypoketotic hypoglycemia and lethargy after a prolonged fast.", Component: BetaOxidationDiagram },
  { topicId: "lipid", title: "Lipoprotein Transport", description: "Chylomicrons, VLDL, LDL, HDL — who carries what, and to where.", pearl: "Familial hypercholesterolemia (defective LDL receptor) causes markedly elevated LDL, tendon xanthomas, and premature coronary disease. Statins work partly by upregulating LDL receptor expression.", Component: LipoproteinTransportDiagram },
  { topicId: "lipid", title: "Cholesterol Synthesis", description: "Acetyl-CoA to cholesterol — where statins act.", pearl: "HMG-CoA reductase activity peaks overnight, which is why most statins are most effective when dosed in the evening (shorter-acting ones especially).", Component: CholesterolSynthesisDiagram },
  { topicId: "amino-acid", title: "Urea Cycle", description: "Split across mitochondria and cytosol — ammonia disposal as urea.", pearl: "Ornithine transcarbamylase (OTC) deficiency is the only X-linked urea cycle disorder — look for hyperammonemia with elevated urinary orotic acid but no lactic acidosis (distinguishing it from organic acidemias).", Component: UreaCycleDiagram },
  { topicId: "amino-acid", title: "Transamination", description: "How amino groups move between amino acids and keto acids via ALT/AST.", pearl: "ALT is more liver-specific than AST. An AST:ALT ratio greater than 2 classically suggests alcoholic liver disease rather than viral hepatitis.", Component: TransaminationDiagram },
  { topicId: "nucleic-acid", title: "Purine Degradation", description: "Purines to uric acid — where allopurinol intervenes.", pearl: "Lesch-Nyhan syndrome (HGPRT deficiency, X-linked) causes hyperuricemia, gout, self-mutilating behavior, and intellectual disability — a favorite board vignette in young boys.", Component: PurineDegradationDiagram },
  { topicId: "molbio", title: "DNA Replication Fork", description: "Leading vs lagging strand synthesis at the replication fork.", pearl: "Fluoroquinolones selectively inhibit bacterial DNA gyrase (topoisomerase II), sparing the structurally different human enzyme — the basis of their antibacterial safety margin.", Component: DnaReplicationDiagram },
  { topicId: "biotech", title: "PCR Thermal Cycle", description: "Denaturation, annealing, extension — the 3-step loop that amplifies DNA.", pearl: "Real-time (quantitative) PCR is now the backbone of viral load testing — HIV, hepatitis, and SARS-CoV-2 — because fluorescence intensity each cycle correlates directly with the amount of target present.", Component: PcrCycleDiagram },
  { topicId: "heme", title: "Heme Synthesis", description: "Alternates between mitochondria and cytosol; lead poisoning blocks two steps.", pearl: "Lead inhibits ALA dehydratase and ferrochelatase, producing a microcytic anemia with basophilic stippling — a classic mimicker of both iron deficiency and thalassemia on peripheral smear.", Component: HemeSynthesisDiagram },
  { topicId: "water-electrolyte", title: "Bicarbonate Buffer System", description: "CO₂/HCO₃⁻ equilibrium — how lungs and kidneys defend blood pH.", pearl: "Respiratory compensation for a metabolic acidosis is fast (minutes — Kussmaul breathing blows off CO₂); renal compensation for a respiratory disorder is slow, taking 3-5 days to fully adjust bicarbonate reabsorption.", Component: AcidBaseBufferDiagram },
  { topicId: "endocrine", title: "Insulin vs Glucagon", description: "The reciprocal hormone see-saw between the fed and fasting state.", pearl: "In diabetic ketoacidosis, absolute insulin deficiency leaves glucagon's actions unopposed — unchecked lipolysis and ketogenesis drive the characteristic anion-gap metabolic acidosis.", Component: InsulinGlucagonDiagram },
  { topicId: "digestion", title: "Digestive Tract Journey", description: "One bolus, five stages — what happens at each stop.", pearl: "Pancreatic exocrine insufficiency (chronic pancreatitis, cystic fibrosis) impairs fat digestion, causing steatorrhea — foul-smelling, greasy, floating stools and fat-soluble vitamin (A, D, E, K) deficiency.", Component: DigestionJourneyDiagram },
  { topicId: "lipid", title: "Fatty Acid Synthesis", description: "Acetyl-CoA to palmitate — the cytosolic build-up pathway, opposite of beta-oxidation.", pearl: "Acetyl-CoA carboxylase (ACC) is the rate-limiting, biotin-dependent enzyme — inhibited by its own product (palmitoyl-CoA) and activated by citrate and insulin.", Component: FattyAcidSynthesisDiagram },
  { topicId: "lipid", title: "Ketogenesis", description: "Liver-only pathway making acetoacetate, β-hydroxybutyrate, and acetone from acetyl-CoA.", pearl: "The liver makes ketones but cannot use them — it lacks thiophorase (succinyl-CoA:3-ketoacid CoA transferase), the enzyme needed to reactivate acetoacetate in peripheral tissues.", Component: KetogenesisDiagram },
  { topicId: "amino-acid", title: "One-Carbon (Folate) Cycle", description: "How methionine synthase links vitamin B12 and folate to regenerate methionine.", pearl: "Blocking this cycle (B12/folate deficiency) traps folate as N5-methyl-THF ('folate trap'), which is why folate can mask but not fix the neurologic damage of B12 deficiency.", Component: OneCarbonFolateDiagram },
  { topicId: "endocrine", title: "Adrenal Steroidogenesis", description: "Cholesterol branches into cortisol, aldosterone, and androgens by adrenal zone.", pearl: "21-hydroxylase deficiency (the most common congenital adrenal hyperplasia) blocks cortisol and aldosterone synthesis, shunting precursors toward androgens — causing virilization and salt-wasting.", Component: AdrenalSteroidogenesisDiagram },
  { topicId: "endocrine", title: "Thyroid Hormone Synthesis", description: "Iodide trapping through T3/T4 release — where antithyroid drugs act.", pearl: "Propylthiouracil and methimazole both inhibit thyroid peroxidase; PTU additionally blocks peripheral T4-to-T3 conversion, making it preferred in thyroid storm.", Component: ThyroidHormoneSynthesisDiagram },
  { topicId: "plasma-proteins", title: "Coagulation Cascade", description: "Extrinsic and intrinsic pathways converging on the common pathway to fibrin.", pearl: "Warfarin inhibits vitamin K epoxide reductase, reducing functional factors II, VII, IX, and X — PT/INR (extrinsic-sensitive) is used to monitor its effect.", Component: CoagulationCascadeDiagram },
  { topicId: "water-electrolyte", title: "Calcium Regulation (PTH / Vitamin D / Calcitonin)", description: "The three-hormone triangle that defends serum calcium.", pearl: "Chronic kidney disease impairs the kidney's 1α-hydroxylase step, lowering active vitamin D and driving secondary hyperparathyroidism with renal osteodystrophy.", Component: CalciumRegulationDiagram },
  { topicId: "heme", title: "Bilirubin Metabolism & Jaundice", description: "Heme breakdown to unconjugated, then conjugated bilirubin, to urobilinogen.", pearl: "Neonatal physiologic jaundice and Gilbert syndrome both reflect reduced UGT1A1 activity — unconjugated hyperbilirubinemia without dark urine, since unconjugated bilirubin isn't water-soluble enough to be excreted renally.", Component: BilirubinMetabolismDiagram },
  { topicId: "amino-acid", title: "Methionine / Transsulfuration", description: "Methionine → SAM → homocysteine, then either remethylated or converted to cysteine.", pearl: "Cystathionine beta-synthase (CBS) deficiency causes homocystinuria — marfanoid habitus, downward lens dislocation, and a high risk of thrombosis, distinguishing it from Marfan syndrome (upward lens dislocation).", Component: MethionineTranssulfurationDiagram },
  { topicId: "molbio", title: "Protein Translation Cycle", description: "Initiation, elongation, and termination on the ribosome.", pearl: "Aminoglycosides cause misreading by distorting the 30S subunit; macrolides and chloramphenicol block the 50S subunit — a favorite pharmacology-biochemistry crossover question.", Component: TranslationCycleDiagram },
  { topicId: "endocrine", title: "cAMP Second-Messenger Signaling", description: "Hormone → GPCR → Gs → adenylate cyclase → cAMP → PKA cascade.", pearl: "Cholera toxin permanently activates Gs (locks cAMP high, causing massive fluid secretion); pertussis toxin permanently inactivates Gi — both act by ADP-ribosylating the G protein.", Component: CampSignalingDiagram },
  { topicId: "vitamins", title: "Vitamin D Activation", description: "Skin/diet to the kidney's active hormone form, 1,25-(OH)₂-D.", pearl: "The kidney's 1α-hydroxylase step is stimulated by PTH and is rate-limiting — this is why chronic kidney disease leads to functional vitamin D deficiency despite normal dietary intake.", Component: VitaminDActivationDiagram },
  { topicId: "glycolysis", title: "Cori Cycle", description: "Muscle lactate returns to the liver to be rebuilt into glucose.", pearl: "Shifts the ATP cost of gluconeogenesis from exercising muscle to the liver — a key reason muscle can sustain anaerobic activity without running out of glucose.", Component: CoriCycleDiagram },
  { topicId: "amino-acid", title: "Glucose-Alanine Cycle", description: "How muscle exports nitrogen to the liver disguised as alanine.", pearl: "Lets muscle dispose of amino-acid nitrogen without making ammonia locally — the liver converts the nitrogen to urea and returns glucose via gluconeogenesis.", Component: GlucoseAlanineCycleDiagram },
  { topicId: "organ-function", title: "Glycation & HbA1c Formation", description: "Nonenzymatic glucose attachment to hemoglobin — the basis of the HbA1c test.", pearl: "HbA1c reflects average glycemic control over the preceding ~3 months (the RBC lifespan), making it far more useful than a single fasting glucose for long-term diabetes monitoring.", Component: GlycationDiagram },
  { topicId: "ecm", title: "Collagen Synthesis", description: "From pre-procollagen through hydroxylation to cross-linked fibrils.", pearl: "Scurvy (vitamin C deficiency) blocks hydroxylation; Menkes disease (copper transport defect) blocks lysyl oxidase cross-linking — both weaken connective tissue by different mechanisms.", Component: CollagenSynthesisDiagram },
  { topicId: "plasma-proteins", title: "Immunoglobulin Structure", description: "Heavy and light chains, Fab antigen-binding site, Fc effector region.", pearl: "Multiple myeloma produces a monoclonal antibody (M-spike); its light chains alone (Bence Jones proteins) can appear in urine and damage renal tubules.", Component: ImmunoglobulinStructureDiagram },
  { topicId: "free-radicals", title: "Antioxidant Defense Cascade", description: "Superoxide → hydrogen peroxide → water, via SOD, catalase, and glutathione peroxidase.", pearl: "G6PD deficiency reduces NADPH available to regenerate glutathione, weakening this whole cascade — the mechanistic link to oxidative hemolysis after fava beans or sulfa drugs.", Component: AntioxidantDefenseDiagram },
  { topicId: "free-radicals", title: "Xenobiotic Metabolism (Phase I / II)", description: "Cytochrome P450 oxidation, then conjugation, to clear drugs and toxins.", pearl: "In paracetamol overdose, depleted glutathione lets the toxic Phase I metabolite NAPQI accumulate — N-acetylcysteine treats this by replenishing glutathione.", Component: XenobioticMetabolismDiagram },
  { topicId: "vitamins", title: "Vitamin K Cycle & Warfarin", description: "How γ-carboxylation activates clotting factors, and where warfarin blocks it.", pearl: "Warfarin inhibits VKORC1 (epoxide reductase), depleting the reduced vitamin K needed to activate factors II, VII, IX, and X — reversed by vitamin K administration or fresh frozen plasma in bleeding emergencies.", Component: VitaminKCycleDiagram },
  { topicId: "heme", title: "Iron Metabolism & Hepcidin", description: "Absorption, ferroportin export, transferrin transport, and hepcidin control.", pearl: "In anemia of chronic disease, inflammation raises hepcidin, which degrades ferroportin and traps iron inside cells — serum iron is low despite normal or high ferritin (unlike true iron deficiency).", Component: IronMetabolismDiagram },
  { topicId: "amino-acid", title: "Amino Acid-Derived Neurotransmitters", description: "Tryptophan → serotonin → melatonin; tyrosine → catecholamines.", pearl: "Carcinoid syndrome diverts so much tryptophan toward serotonin that niacin (B3) synthesis falls, producing pellagra-like symptoms (dermatitis, diarrhea) alongside flushing and diarrhea.", Component: NeurotransmitterSynthesisDiagram },
  { topicId: "iem", title: "Branched-Chain Amino Acid Catabolism", description: "Leucine, isoleucine, valine breakdown — and where maple syrup urine disease blocks it.", pearl: "The deficient enzyme (branched-chain α-ketoacid dehydrogenase) is lipoic-acid dependent, just like pyruvate dehydrogenase — both fail in thiamine-related cofactor problems, but MSUD is a primary enzyme defect.", Component: BcaaCatabolismDiagram },
  { topicId: "digestion", title: "Zymogen Activation Cascade", description: "Enteropeptidase-triggered trypsin unlocks every other pancreatic protease.", pearl: "Hereditary pancreatitis can result from mutations that prevent trypsin self-inactivation, allowing premature intrapancreatic activation of the whole zymogen cascade — autodigestion of the pancreas.", Component: ZymogenActivationDiagram },
  { topicId: "nutrition", title: "Starvation Fuel Metabolism Timeline", description: "How fuel sources shift from glycogen to gluconeogenesis to ketones over a prolonged fast.", pearl: "By minimizing muscle protein breakdown once ketones rise, the body preserves lean mass during prolonged starvation — a survival adaptation exploited (in a controlled way) by therapeutic ketogenic diets.", Component: StarvationTimelineDiagram },
  { topicId: "digestion", title: "Vitamin B12 Absorption", description: "From food-bound B12 to intrinsic-factor-mediated ileal uptake.", pearl: "Pernicious anemia — autoimmune loss of parietal cells or anti-intrinsic-factor antibodies — is the classic cause of B12 deficiency distinct from simple dietary lack (common in strict vegans).", Component: B12AbsorptionDiagram },
  { topicId: "biotech", title: "ELISA Workflow", description: "Plate coating through absorbance reading — the 5-step immunoassay.", pearl: "ELISA remains the front-line screening test for HIV (paired with confirmatory Western blot) and is the basis of quantitative hormone assays like urine hCG pregnancy tests.", Component: ElisaWorkflowDiagram },
  { topicId: "chem-carb", title: "Monosaccharide Classification", description: "Aldose vs ketose, and how carbon count and epimers/anomers are defined.", pearl: "Glucose and galactose (C4 epimers) are handled by completely different first enzymes — galactokinase vs hexokinase — which is why isolated galactokinase deficiency causes only cataracts, not the severe illness of classic galactosemia.", Component: MonosaccharideClassificationDiagram },
  { topicId: "chem-carb", title: "Glycosidic Bonds: Starch vs Glycogen vs Cellulose", description: "Same building block, different linkages — and why only some are digestible.", pearl: "Humans lack β-glycosidase, so cellulose (β-1,4 linked) passes through as dietary fiber, while starch and glycogen (α-linked) are fully digestible energy sources.", Component: GlycosidicBondDiagram },
  { topicId: "chem-protein", title: "Levels of Protein Structure", description: "Primary sequence through quaternary assembly.", pearl: "Prion diseases arise purely from a change in secondary/tertiary structure (α-helix to β-sheet) with no change in amino acid sequence — a rare disease caused entirely by misfolding.", Component: ProteinStructureLevelsDiagram },
  { topicId: "chem-protein", title: "Amino Acid Titration & Isoelectric Point", description: "How net charge shifts with pH, and what determines the pI.", pearl: "Electrophoretic separation techniques (e.g. hemoglobin electrophoresis for sickle cell trait/disease) work precisely because different proteins have different isoelectric points.", Component: IsoelectricPointDiagram },
  { topicId: "enzymes", title: "Types of Enzyme Inhibition", description: "Competitive, noncompetitive, uncompetitive, and irreversible — compared side by side.", pearl: "Aspirin is a rare example of irreversible inhibition via covalent modification — it acetylates COX-1/2, permanently disabling that enzyme molecule until new enzyme is synthesized.", Component: EnzymeInhibitionDiagram },
  { topicId: "enzymes", title: "Allosteric Regulation", description: "Sigmoidal kinetics from cooperative binding — the basis of feedback inhibition.", pearl: "ATP allosterically inhibits phosphofructokinase-1 (glycolysis) while AMP activates it — a direct energy-charge sensor built into the pathway's first committed step.", Component: AllostericRegulationDiagram },
  { topicId: "iem", title: "Inborn Errors as Metabolic Blocks", description: "PKU, galactosemia, hereditary fructose intolerance, and alkaptonuria — where each pathway breaks.", pearl: "Alkaptonuria (homogentisate oxidase deficiency) is usually benign apart from urine that darkens on standing and late-onset ochronotic arthritis — a good example of a 'mild' inborn error.", Component: MetabolicBlockDisordersDiagram },
  { topicId: "iem", title: "Lysosomal Storage Diseases", description: "Tay-Sachs, Gaucher, Niemann-Pick, Fabry, Hurler — enzyme and accumulated substrate, side by side.", pearl: "Tay-Sachs classically shows a 'cherry-red spot' on the macula, while Niemann-Pick can show the same finding plus hepatosplenomegaly — a key exam differentiator is organomegaly (present in Niemann-Pick/Gaucher, absent in Tay-Sachs).", Component: LysosomalStorageDiseasesDiagram },
  { topicId: "nutrition", title: "Energy Balance", description: "Intake vs expenditure — the equation behind weight change.", pearl: "Basal metabolic rate is usually the single largest component of total energy expenditure in a sedentary person, which is why crash dieting (which lowers BMR) often backfires long-term.", Component: EnergyBalanceDiagram },
  { topicId: "nutrition", title: "Kwashiorkor vs Marasmus", description: "Same root cause (malnutrition), very different biochemistry and appearance.", pearl: "The edema of kwashiorkor is a direct consequence of hypoalbuminemia lowering plasma oncotic pressure — despite the child often looking less 'wasted' than one with marasmus.", Component: ProteinEnergyMalnutritionDiagram },
  { topicId: "ecm", title: "Elastin Cross-Linking", description: "Tropoelastin to a cross-linked elastic network via lysyl oxidase.", pearl: "Cutis laxa and some forms of aneurysm disease trace back to defective elastin cross-linking — the tissue loses its ability to recoil after stretching.", Component: ElastinCrossLinkingDiagram },
  { topicId: "ecm", title: "Proteoglycan Aggregate Structure", description: "Hyaluronic acid backbone with aggrecan and GAG side chains.", pearl: "Osteoarthritis involves progressive loss of proteoglycan content in cartilage, reducing its ability to bind water and resist compressive load.", Component: ProteoglycanAggregateDiagram },
  { topicId: "free-radicals", title: "Fenton Reaction", description: "How Fe²⁺ converts hydrogen peroxide into the highly reactive hydroxyl radical.", pearl: "Hemochromatosis (iron overload) increases free Fe²⁺ available for Fenton chemistry — a key mechanism behind the liver damage, cardiomyopathy, and diabetes seen in the condition.", Component: FentonReactionDiagram },
  { topicId: "vitamins", title: "Fat-Soluble vs Water-Soluble Vitamins", description: "Storage, toxicity risk, and which vitamins belong in each group.", pearl: "Fat-soluble vitamin toxicity is a real clinical concern (e.g. vitamin A in pregnancy is teratogenic) precisely because these vitamins accumulate in tissue rather than being excreted in urine.", Component: VitaminClassificationDiagram },
  { topicId: "vitamins", title: "Vitamin Deficiency Clinical Map", description: "Six classic vitamin deficiencies and their signature clinical syndrome.", pearl: "B12 deficiency is the one vitamin deficiency where giving folate alone can worsen outcomes — it corrects the anemia but allows the neurologic damage (subacute combined degeneration) to progress unchecked.", Component: VitaminDeficiencyMapDiagram },
  { topicId: "water-electrolyte", title: "Renin-Angiotensin-Aldosterone System", description: "Liver, kidney, and lungs cooperate to raise blood pressure and retain sodium.", pearl: "ACE inhibitors and ARBs are first-line for both hypertension and diabetic nephropathy — blocking this axis reduces intraglomerular pressure and slows proteinuric kidney disease.", Component: RaasDiagram },
  { topicId: "molbio", title: "Common Chromosomal Disorders", description: "The trisomies and sex-chromosome aneuploidies tested most often.", pearl: "Down syndrome risk rises sharply after maternal age 35 — the biochemical screening triple/quad test combines maternal serum AFP, hCG, estriol, and inhibin-A to estimate risk before invasive testing.", Component: ChromosomalDisordersDiagram },
  { topicId: "molbio", title: "Oncogenes vs Tumor Suppressor Genes", description: "Gain-of-function, dominant oncogenes vs loss-of-function, recessive tumor suppressors.", pearl: "BRCA1/2 mutations are tumor suppressor gene defects — inheriting one nonfunctional allele isn't enough to cause cancer alone, but it makes losing the second (somatic) allele, and therefore cancer, far more likely.", Component: OncogeneTumorSuppressorDiagram },
  { topicId: "organ-function", title: "Tumor Markers", description: "Which marker pairs with which cancer, for monitoring rather than screening.", pearl: "A rising tumor marker after treatment is one of the earliest signs of cancer recurrence, often preceding imaging changes — which is why these are used for surveillance, not diagnosis.", Component: TumorMarkersDiagram },
  { topicId: "organ-function", title: "Thyroid Function Test Interpretation", description: "Reading TSH/T4 patterns to localize primary vs subclinical thyroid disease.", pearl: "In secondary (pituitary) hypothyroidism, both TSH and T4 are low — a pattern easy to miss if you only check TSH, which is why free T4 is added when pituitary disease is suspected.", Component: ThyroidFunctionTestsDiagram },
];

function ClinicalPearl({ text, color }: { text: string; color: { bg: string; fg: string } }) {
  return (
    <div style={{ backgroundColor: color.bg }} className="mt-3 rounded-lg p-3 text-left">
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: color.fg }}>Clinical pearl</p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: color.fg }}>{text}</p>
    </div>
  );
}

function DiagramCard({ title, description, pearl, color, onExpand, children }: { title: string; description: string; pearl: string; color: { bg: string; fg: string; ring: string }; onExpand: () => void; children: ReactNode }) {
  return (
    <div style={{ borderTopColor: color.ring }} className="rounded-xl border border-border border-t-4 bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-card-foreground">{title}</h3>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onExpand}
        aria-label={`Enlarge ${title} diagram`}
        className="group relative w-full overflow-x-auto rounded-lg bg-muted/40 p-3 text-left transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
      >
        {children}
        <span
          style={{ backgroundColor: color.bg, color: color.fg }}
          className="pointer-events-none absolute bottom-2 right-2 rounded-full px-2 py-1 text-[10px] font-bold opacity-0 shadow-sm transition group-hover:opacity-100"
        >
          Tap to enlarge
        </span>
      </button>
      <ClinicalPearl text={pearl} color={color} />
    </div>
  );
}

function Modal({ title, description, color, onClose, children }: { title: string; description?: string; color: { bg: string; fg: string; ring: string }; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ borderTopColor: color.ring }}
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border-t-4 border-border bg-card p-6 text-center shadow-xl"
      >
        {children}
        {description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>}
        <Button variant="secondary" onClick={onClose} className="mt-5 rounded-lg">
          Close
        </Button>
      </div>
    </div>
  );
}

function Diagrams() {
  const units = Array.from(new Set(TOPICS.map((topic) => topic.unit)));
  const [openIcon, setOpenIcon] = useState<(typeof GALLERY_ICONS)[number] | null>(null);
  const [openDiagram, setOpenDiagram] = useState<(typeof DIAGRAMS)[number] | null>(null);
  return (
    <section>
      <SectionIntro
        eyebrow={`${DIAGRAMS.length} animated pathway maps`}
        title="See the pathways move"
        description="Original diagrams built for this app — grouped by the same chapter units as the fact sheets, each with flow direction and rate-limiting steps animated. Tap any diagram or picture to enlarge it."
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
                      <DiagramCard key={unit + d.title + i} title={d.title} description={d.description} pearl={d.pearl} color={color} onExpand={() => setOpenDiagram(d)}>
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
                      <button
                        key={icon.src}
                        type="button"
                        onClick={() => setOpenIcon(icon)}
                        style={{ borderTopColor: color.ring }}
                        className="group rounded-xl border border-border border-t-4 bg-card p-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                      >
                        <img src={icon.src} alt={icon.label} className="mx-auto h-16 w-16 object-contain transition group-hover:scale-110" loading="lazy" />
                        <figcaption className="mt-2">
                          <p className="text-xs font-bold text-card-foreground">{icon.label}</p>
                          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{icon.caption}</p>
                        </figcaption>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">Reference illustrations are free/public domain (CC0) via Bioicons.com contributors — see public/icons/CREDITS.md. Pathway diagrams are original artwork made for this app.</p>

      {openIcon && (
        <Modal title={openIcon.label} color={topicColor(openIcon.topicId)} onClose={() => setOpenIcon(null)}>
          <img src={openIcon.src} alt={openIcon.label} className="mx-auto h-40 w-40 object-contain sm:h-56 sm:w-56" />
          <p className="mt-4 text-base font-bold text-card-foreground">{openIcon.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{openIcon.caption}</p>
        </Modal>
      )}

      {openDiagram && (
        <Modal title={openDiagram.title} description={openDiagram.description} color={topicColor(openDiagram.topicId)} onClose={() => setOpenDiagram(null)}>
          <p className="mb-3 text-left font-display text-xl text-card-foreground sm:text-2xl">{openDiagram.title}</p>
          <div className="rounded-lg bg-muted/40 p-4">
            <openDiagram.Component />
          </div>
          <ClinicalPearl text={openDiagram.pearl} color={topicColor(openDiagram.topicId)} />
        </Modal>
      )}
    </section>
  );
}

const PRACTICAL_STATIONS: { title: string; color: { bg: string; fg: string; ring: string }; steps: { title: string; description: string }[] }[] = [
  {
    title: "Qualitative Urine Analysis",
    color: TOPIC_PALETTE[1]!,
    steps: [
      { title: "Physical examination", description: "Note color, transparency (clear/turbid), and odor of the sample before any reagent is added." },
      { title: "Benedict's test — reducing sugars", description: "Boil 5 drops of urine with 2.5 mL Benedict's reagent. Green → yellow → orange → brick-red precipitate grades + to ++++, indicating glucosuria." },
      { title: "Heat coagulation test — protein", description: "Heat the upper part of a urine column over a flame; a white turbidity that persists after adding 2–3 drops of acetic acid confirms proteinuria." },
      { title: "Rothera's test — ketone bodies", description: "Saturate urine with ammonium sulfate, add sodium nitroprusside and ammonia. A purple/pink ring at the interface indicates ketonuria." },
      { title: "Hay's test — bile salts", description: "Sprinkle sulfur powder on the urine surface. Sinking of the powder (reduced surface tension) indicates bile salts are present." },
      { title: "Fouchet's test — bile pigments", description: "A blue-green color after adding Fouchet's reagent to a barium-chloride precipitate of the urine confirms bilirubin." },
    ],
  },
  {
    title: "Blood Sugar Estimation (GOD-POD)",
    color: TOPIC_PALETTE[3]!,
    steps: [
      { title: "Sample collection", description: "Collect fasting or postprandial venous blood; separate plasma/serum promptly to prevent glycolysis from lowering the reading." },
      { title: "Enzymatic reaction", description: "Glucose oxidase converts glucose to gluconic acid + H₂O₂; peroxidase then couples the H₂O₂ with a chromogen to form a colored product." },
      { title: "Colorimetry", description: "Read absorbance at 505 nm against a reagent blank and a known glucose standard, using a photoelectric colorimeter." },
      { title: "Calculation", description: "Glucose (mg/dL) = (Absorbance of test ÷ Absorbance of standard) × concentration of the standard." },
      { title: "Interpretation", description: "Compare against reference ranges — fasting 70–100 mg/dL — and flag values meeting prediabetes/diabetes cutoffs (ADA/WHO criteria)." },
    ],
  },
  {
    title: "Biochemistry Spotters & Instruments",
    color: TOPIC_PALETTE[5]!,
    steps: [
      { title: "Colorimeter", description: "Measures absorbance of a colored solution using filters (not a prism, unlike a spectrophotometer) — identify by its filter wheel and cuvette holder." },
      { title: "Centrifuge", description: "Separates serum/plasma from blood cells by density under centrifugal force — look for the rotor and sample tube slots." },
      { title: "pH meter", description: "Uses a glass electrode sensitive to H⁺ activity to measure pH — identify by the glass/reference electrode probe." },
      { title: "Semi-autoanalyzer", description: "Automates reagent-sample mixing and photometric reading for biochemistry panels — a common spotter in practical exams." },
      { title: "Chromatography paper / TLC plate", description: "Separates compounds by differential migration through a stationary phase — identify by spots/bands and an Rf value calculation." },
      { title: "Glucometer", description: "Point-of-care device using a glucose oxidase strip and amperometric or colorimetric detection for rapid bedside glucose testing." },
    ],
  },
  {
    title: "Clinical Case / Report Discussion",
    color: TOPIC_PALETTE[7]!,
    steps: [
      { title: "Identify the abnormal parameter(s)", description: "Scan the report systematically (e.g. LFT, RFT, lipid profile) and note every value outside the reference range before jumping to a diagnosis." },
      { title: "Correlate the pattern", description: "Group abnormalities into a recognizable pattern — e.g. cholestatic vs hepatocellular liver injury, or a specific dyslipidemia phenotype." },
      { title: "Bring in the clinical vignette", description: "Match the biochemical pattern against the patient's presenting symptoms, history, and risk factors given in the case." },
      { title: "State the most likely diagnosis", description: "Commit to a single best-fit diagnosis and name one confirmatory test the examiner would expect next." },
      { title: "Mention a differential", description: "Name one alternative diagnosis that could produce a similar pattern, and the key feature that distinguishes it." },
    ],
  },
];

function PracticalStationCard({ station }: { station: (typeof PRACTICAL_STATIONS)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTopColor: station.color.ring }} className="rounded-xl border border-border border-t-4 bg-card p-4 shadow-sm sm:p-5">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 text-left">
        <h3 className="font-display text-xl text-card-foreground">{station.title}</h3>
        <span style={{ backgroundColor: station.color.bg, color: station.color.fg }} className="shrink-0 rounded-full px-2 py-1 text-[11px] font-bold">
          {station.steps.length} steps
        </span>
      </button>
      {open && (
        <ol className="mt-4 space-y-3">
          {station.steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span style={{ backgroundColor: station.color.bg, color: station.color.fg }} className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-card-foreground">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function VivaBank() {
  const [query, setQuery] = useState("");
  const units = Array.from(new Set(TOPICS.map((t) => t.unit)));
  const normalized = query.trim().toLowerCase();
  return (
    <div>
      <div className="relative mb-4">
        <Search aria-hidden="true" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <label className="sr-only" htmlFor="viva-search">Search viva questions</label>
        <input id="viva-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a viva question…" className="min-h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
      </div>
      <div className="space-y-8">
        {units.map((unit) => {
          const unitTopicIds = new Set(TOPICS.filter((t) => t.unit === unit).map((t) => t.id));
          const questions = FACTS.filter((f) => unitTopicIds.has(f.topicId) && (normalized === "" || f.question.toLowerCase().includes(normalized) || f.answer.toLowerCase().includes(normalized)));
          if (questions.length === 0) return null;
          return (
            <div key={unit}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{unit}</h3>
              <div className="space-y-2">
                {questions.map((f) => {
                  const color = topicColor(f.topicId);
                  return (
                    <details key={f.id} className="group rounded-lg border border-border bg-card p-3 open:shadow-sm">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-bold text-card-foreground marker:content-none">
                        <span>{f.question}</span>
                        <span style={{ backgroundColor: color.bg, color: color.fg }} className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold group-open:hidden">Reveal</span>
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                    </details>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Practical() {
  return (
    <section>
      <SectionIntro
        eyebrow="Practical exam + viva voce"
        title="Get ready for the bench and the table"
        description="The recent Indian MBBS biochemistry practical format: qualitative tests, an estimation exercise, spotters/instruments, a case discussion — plus a searchable viva voce question bank pulled from every chapter."
      />
      <div className="space-y-4">
        {PRACTICAL_STATIONS.map((station) => (
          <PracticalStationCard key={station.title} station={station} />
        ))}
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <h3 className="font-display text-2xl text-foreground">Viva Voce Question Bank</h3>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">Tap any question to reveal the answer — the same high-yield Q&amp;A used in Flashcards, organized for rapid-fire viva practice.</p>
        <VivaBank />
      </div>
    </section>
  );
}

function CompoundLookup() {
  const [query, setQuery] = useState("");
  const [openCompound, setOpenCompound] = useState<Compound | null>(null);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return COMPOUNDS;
    return COMPOUNDS.filter((compound) => compound.name.toLowerCase().includes(normalized) || compound.formula.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <section>
      <SectionIntro eyebrow={`${COMPOUNDS.length} curated metabolites`} title="Compound reference" description="Search by metabolite name or molecular formula. Tap any card for its clinical significance." />
      <div className="relative mb-3">
        <Search aria-hidden="true" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <label className="sr-only" htmlFor="compound-search">Search compounds</label>
        <input id="compound-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pyruvate, NAD+, glucose…" className="min-h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
      </div>
      <p aria-live="polite" className="mb-4 text-xs font-medium text-muted-foreground">Showing {results.length} of {COMPOUNDS.length} compounds</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {results.map((compound, index) => {
          const color = TOPIC_PALETTE[index % TOPIC_PALETTE.length]!;
          const note = COMPOUND_NOTES[compound.id];
          return (
            <button
              key={compound.id}
              type="button"
              onClick={() => setOpenCompound(compound)}
              style={{ borderTopColor: color.ring }}
              className="group rounded-xl border border-border border-t-4 bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-bold text-card-foreground">{compound.name}</h3>
                {compound.mass !== "null" && <span className="shrink-0 text-xs text-muted-foreground">{compound.mass} g/mol</span>}
              </div>
              <p style={{ backgroundColor: color.bg, color: color.fg }} className="mt-2 inline-block break-all rounded-md px-2 py-0.5 font-mono text-xs">
                {compound.formula || "Formula unavailable"}
              </p>
              {note && <p className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground">{note}</p>}
              <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide opacity-0 transition group-hover:opacity-100" style={{ color: color.fg }}>Tap for details →</span>
            </button>
          );
        })}
        {results.length === 0 && <p className="col-span-2 py-12 text-center text-sm text-muted-foreground">No compound matches "{query}".</p>}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Formulas and masses are from the ModelSEED biochemistry database (public domain). Clinical/biological significance notes are original summaries written for this app.</p>

      {openCompound && (
        <Modal title={openCompound.name} color={TOPIC_PALETTE[COMPOUNDS.indexOf(openCompound) % TOPIC_PALETTE.length]!} onClose={() => setOpenCompound(null)}>
          <p className="text-left font-display text-2xl text-card-foreground">{openCompound.name}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">{openCompound.formula || "Formula unavailable"}</span>
            {openCompound.mass !== "null" && <span className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">{openCompound.mass} g/mol</span>}
          </div>
          {COMPOUND_NOTES[openCompound.id] ? (
            <div className="mt-4 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Clinical / biological significance</p>
              <p className="mt-1 text-sm leading-relaxed text-card-foreground">{COMPOUND_NOTES[openCompound.id]}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No significance note yet for this compound.</p>
          )}
          <FurtherReading topicName={openCompound.name} color={TOPIC_PALETTE[COMPOUNDS.indexOf(openCompound) % TOPIC_PALETTE.length]!} />
        </Modal>
      )}
    </section>
  );
}