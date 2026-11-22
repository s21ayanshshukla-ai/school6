import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

import heroImage from "@/assets/hero-cinema.jpg";
import { DetailModal } from "@/components/cine/DetailModal";
import { MovieCard, MovieCardSkeleton } from "@/components/cine/MovieCard";
import { discoverTitles } from "@/lib/discover.functions";
import type { Recommendation } from "@/lib/discover-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineMind — Find Movies & Shows by Describing a Mood" },
      {
        name: "description",
        content: "Type what you're in the mood for and CineMind's AI picks 5 movies or shows with posters, ratings and match scores.",
      },
      { property: "og:title", content: "CineMind — Find Movies & Shows by Describing a Mood" },
      {
        property: "og:description",
        content: "Type what you're in the mood for and get 5 AI-matched movies and shows.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EXAMPLES = [
  "Mind-bending sci-fi with deep plot twists",
  "Cozy comfort shows for a rainy Sunday",
  "Dark crime dramas with morally grey leads",
  "Feel-good animated adventures for the family",
  "Slow-burn psychological thrillers",
];

function Index() {
  const [query, setQuery] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const discover = useServerFn(discoverTitles);

  const search = useMutation({
    mutationFn: (q: string) => discover({ data: { query: q } }),
  });

  const run = (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 3 || search.isPending) return;
    setQuery(trimmed);
    setLastQuery(trimmed);
    search.mutate(trimmed);
    requestAnimationFrame(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(query);
  };

  const results = search.data?.results ?? [];
  const error = search.error ? "Something went wrong reaching the AI. Please try again." : search.data?.error;
  const hasSearched = search.isPending || search.isSuccess || search.isError;

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-10">
          <a href="/" className="font-display text-3xl font-black uppercase tracking-wider">
            <span className="text-ember">Cine</span>
            <span className="text-foreground">Mind</span>
          </a>
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-overlay px-3 py-1 text-xs text-muted-foreground backdrop-blur sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered discovery
          </span>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-fade-side" />
        <div className="absolute inset-0 -z-10 bg-fade-bottom" />

        <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 sm:px-10 sm:pb-20">
          <p className="animate-rise mb-4 text-xs font-bold uppercase tracking-[0.35em] text-primary">
            Tonight's screening, chosen by you
          </p>
          <h1 className="animate-rise max-w-4xl font-display text-6xl font-black uppercase leading-[0.88] tracking-tight text-foreground sm:text-8xl">
            Describe a feeling.
            <br />
            <span className="text-ember">We'll find the film.</span>
          </h1>
          <p className="animate-rise mt-5 max-w-xl text-base text-muted-foreground sm:text-lg" style={{ animationDelay: "120ms" }}>
            Tell CineMind what you're craving in plain words. It picks five titles and scores how well each one fits.
          </p>

          <form onSubmit={onSubmit} className="animate-rise mt-8 w-full max-w-3xl" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-overlay p-2 shadow-card backdrop-blur-xl transition focus-within:shadow-glow">
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Mind-bending sci-fi movies with deep plot twists"
                aria-label="Describe what you want to watch"
                maxLength={300}
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-lg"
              />
              <button
                type="submit"
                disabled={search.isPending || query.trim().length < 3}
                className="inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-3 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {search.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="hidden sm:inline">Discover</span>
              </button>
            </div>
          </form>

          <div className="animate-rise mt-4 flex flex-wrap gap-2" style={{ animationDelay: "280ms" }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => run(ex)}
                className="rounded-full border border-border bg-overlay px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:border-primary hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main id="results" className="mx-auto max-w-7xl scroll-mt-6 px-5 pb-24 sm:px-10">
        {hasSearched && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Because you asked for</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-wide text-foreground sm:text-4xl">
                “{lastQuery}”
              </h2>
            </div>
            {search.isPending && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Curating your lineup…
              </span>
            )}
          </div>
        )}

        {search.isPending && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!search.isPending && error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center">
            <p className="font-semibold text-foreground">{error}</p>
            <button
              type="button"
              onClick={() => run(lastQuery)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-glow"
            >
              Try again <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {!search.isPending && !error && results.length > 0 && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {results.map((item, i) => (
              <MovieCard key={item.id} item={item} index={i} onOpen={() => setSelected(item)} />
            ))}
          </div>
        )}

        {!hasSearched && (
          <div className="grid gap-6 py-6 sm:grid-cols-3">
            {[
              ["01", "Describe it", "Moods, themes, eras, vibes — write it the way you'd tell a friend."],
              ["02", "AI curates", "A language model reads between the lines and picks five titles."],
              ["03", "Dive in", "Posters, ratings and full synopses pulled live from the TVmaze catalog."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-xl border border-border bg-card p-6">
                <span className="font-display text-4xl font-black text-ember">{n}</span>
                <h3 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-wide">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
