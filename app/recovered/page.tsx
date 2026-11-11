import Link from "next/link"

const apps = [
  { title: "Cosmic Creative Playground", href: "/", text: "Draw and move spirals, explore audio, and open Memory Palace." },
  { title: "Light Wobble Explorer", href: "/recovered/light-wobble", text: "Adjust phase and compare the wave, Faraday rotation, and iris views." },
  { title: "Resonance Mandala", href: "/recovered/resonance-mandala", text: "Drag across the rings and tap to amplify them." },
  { title: "Living Donut", href: "/living-donut.html", text: "Adjust a toroidal simulation and view its charts." },
  { title: "Sideways Slip", href: "/recovered/sideways-slip", text: "Open the recovered demos and browse the 53 original routes." },
]

export default function RecoveredApps() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:py-20">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Recovered apps</h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {apps.map(({ title, href, text }) => (
          <li key={href}>
            <Link href={href} className="block h-full rounded-xl border bg-card p-5 text-card-foreground hover:border-primary focus-visible:outline-2">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
