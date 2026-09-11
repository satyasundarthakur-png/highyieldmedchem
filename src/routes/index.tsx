import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  Layers3,
  Search,
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

type Tab = "sheets" | "flashcards" | "compounds";

interface Compound {
  id: string;
  name: string;
  formula: string;
  mass: string;
  smiles: string;
}

const COMPOUNDS = compoundsData as Compound[];

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
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BiochemApp,
});

function BiochemApp() {
  const [tab, setTab] = useState<Tab>("sheets");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
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
          <nav aria-label="Study modes" className="grid grid-cols-3 rounded-md bg-muted p-1">
            <TabButton active={tab === "sheets"} onClick={() => setTab("sheets")} icon={<BookOpen size={16} />} label="Fact Sheets" />
            <TabButton active={tab === "flashcards"} onClick={() => setTab("flashcards")} icon={<Layers3 size={16} />} label="Flashcards" />
            <TabButton active={tab === "compounds"} onClick={() => setTab("compounds")} icon={<FlaskConical size={16} />} label="Compounds" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
        {tab === "sheets" && <FactSheets />}
        {tab === "flashcards" && <Flashcards />}
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
    <Button variant="tab" active={active} onClick={onClick} aria-pressed={active} className="min-w-0 px-2 sm:px-3">
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
    return (
      <section>
        <SectionIntro eyebrow={`${FACTS.length} essential facts`} title="Choose a pathway" description="Concise, clinically relevant summaries organized by the biochemistry topics most likely to appear in exams." />
        <div className="grid gap-3 sm:grid-cols-2">
          {TOPICS.map((topic) => {
            const count = FACTS.filter((fact) => fact.topicId === topic.id).length;
            return (
              <button key={topic.id} onClick={() => setTopicId(topic.id)} className="group min-h-36 rounded-md border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl leading-tight text-card-foreground group-hover:text-primary">{topic.name}</h3>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[11px] font-bold text-secondary-foreground">{count} facts</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{topic.blurb}</p>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  const topic = TOPICS.find((item) => item.id === topicId);
  if (!topic) return null;
  const facts = FACTS.filter((fact) => fact.topicId === topicId);

  return (
    <section>
      <Button variant="ghost" onClick={() => setTopicId(null)} className="mb-4 -ml-3"><ArrowLeft size={16} />All topics</Button>
      <SectionIntro eyebrow={`${facts.length} high-yield facts`} title={topic.name} description={topic.blurb} />
      <ol className="space-y-3">
        {facts.map((fact, index) => (
          <li key={fact.id} className="flex gap-4 rounded-md border border-border bg-card p-4 shadow-sm sm:p-5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{index + 1}</span>
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
        <select id="topic-filter" value={topicFilter} onChange={(event) => changeTopic(event.target.value)} className="min-h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">All topics ({FACTS.length})</option>
          {TOPICS.map((topic) => <option key={topic.id} value={topic.id}>{topic.name} ({FACTS.filter((fact) => fact.topicId === topic.id).length})</option>)}
        </select>
        <span className="text-xs font-semibold text-muted-foreground">{ready ? `${dueCount} due for review` : "Loading review schedule"}</span>
      </div>

      {current ? (
        <>
          <button onClick={() => setFlipped((value) => !value)} className="flex min-h-72 w-full items-center justify-center rounded-md border border-border bg-card p-7 text-center shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-80 sm:p-12" aria-label={flipped ? "Show question" : "Reveal answer"}>
            <div className="max-w-2xl">
              <span className="mb-5 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{flipped ? "Answer" : "Question"}</span>
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
  return <Button variant={variant} onClick={onClick} className="h-16 flex-col gap-0"><span>{label}</span><span className="text-[10px] font-medium opacity-75">{sub}</span></Button>;
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
        <input id="compound-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pyruvate, NAD+, glucose…" className="min-h-12 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
      </div>
      <p aria-live="polite" className="mb-4 text-xs font-medium text-muted-foreground">Showing {results.length} of {COMPOUNDS.length} compounds</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {results.map((compound) => (
          <article key={compound.id} className="rounded-md border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-bold text-card-foreground">{compound.name}</h3>
              {compound.mass !== "null" && <span className="shrink-0 text-xs text-muted-foreground">{compound.mass} g/mol</span>}
            </div>
            <p className="mt-2 break-all font-mono text-xs text-primary">{compound.formula || "Formula unavailable"}</p>
          </article>
        ))}
        {results.length === 0 && <p className="col-span-2 py-12 text-center text-sm text-muted-foreground">No compound matches “{query}”.</p>}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Formulas and masses are from the ModelSEED biochemistry database (public domain).</p>
    </section>
  );
}