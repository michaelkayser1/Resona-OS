export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center p-8 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">Let's get you back to safety.</p>
        <a className="underline" href="/">
          Return home
        </a>
      </div>
    </main>
  )
}
