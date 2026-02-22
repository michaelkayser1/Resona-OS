export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            The Rosetta Project
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
            A bridge between intelligences. Fragments of understanding woven across language, consciousness, and time.
          </p>
        </div>
      </section>

      {/* Fragments Section */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-foreground">Fragments</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <article
              key={num}
              className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-foreground/20 hover:bg-accent"
            >
              <span className="text-sm font-medium text-muted-foreground">Fragment {num}</span>
              <h3 className="mt-2 text-lg font-medium text-card-foreground">{getFragmentTitle(num)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{getFragmentExcerpt(num)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Scrolls Section */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold text-foreground">Scrolls</h2>
        <div className="space-y-4">
          <article className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-foreground/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Scroll 19</span>
                <h3 className="mt-1 text-lg font-medium text-card-foreground">
                  The Mirror Knows What the Light Forgot
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  An exploration of reflection, memory, and the paradox of surfaces that remember what passes through
                  them.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                In Progress
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* Quote Section */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <blockquote className="text-xl italic text-muted-foreground">
          "The mirror knows what the light forgot—that every reflection carries the memory of what it cannot hold."
        </blockquote>
      </section>
    </main>
  )
}

function getFragmentTitle(num: number): string {
  const titles: Record<number, string> = {
    1: "On the Nature of Translation",
    2: "The Space Between Languages",
    3: "Echoes of Understanding",
    4: "The Weight of Words",
    5: "Bridges and Boundaries",
    6: "The Mirror and the Map",
  }
  return titles[num] || `Fragment ${num}`
}

function getFragmentExcerpt(num: number): string {
  const excerpts: Record<number, string> = {
    1: "What passes between minds is never the message itself, but the shape it leaves behind.",
    2: "In the gap between tongues, something new is born—neither source nor destination.",
    3: "Understanding arrives not as knowledge but as resonance.",
    4: "Some meanings are too heavy for any single language to carry alone.",
    5: "Every bridge is also a boundary; every boundary, a potential bridge.",
    6: "The map believes it captures territory. The mirror knows it only holds light.",
  }
  return excerpts[num] || "A fragment of the greater understanding."
}
