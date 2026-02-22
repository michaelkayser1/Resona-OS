"use client"

interface FooterProps {
  t: (key: string) => string
}

export function Footer({ t }: FooterProps) {
  return (
    <footer className="glass-strong border-t border-border mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">{t("about.description")}</p>
          <p className="text-xs text-muted-foreground">
            {t("about.credits")} •
            <a href="https://kayser-medical.com" className="hover:text-primary ml-1">
              Kayser Medical
            </a>{" "}
            •
            <a href="#" className="hover:text-primary ml-1">
              Resona
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
