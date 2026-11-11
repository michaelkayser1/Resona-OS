import Link from "next/link"

export default function RecoveredLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav aria-label="Recovery navigation" className="border-b px-5">
        <Link href="/recovered" className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">Recovered apps</Link>
      </nav>
      {children}
    </>
  )
}
