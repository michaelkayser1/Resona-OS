"use client"

import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/LanguageToggle"

interface HeaderProps {
  lang: string
  setLang: (lang: string) => void
  onSettingsClick: () => void
  t: (key: string) => string
}

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export function Header({ lang, setLang, onSettingsClick, t }: HeaderProps) {
  return (
    <header className="glass-strong border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="heading-display text-2xl">QOTE Live</h1>
          <p className="text-sm text-muted-foreground">Chaos → Coherence</p>
        </div>

        <div className="flex items-center gap-4">
          <LanguageToggle lang={lang} setLang={setLang} />
          <Button onClick={onSettingsClick} variant="ghost" size="sm">
            <SettingsIcon />
          </Button>
        </div>
      </div>
    </header>
  )
}
