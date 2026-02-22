"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LanguageToggleProps {
  lang: string
  setLang: (lang: string) => void
}

export function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  return (
    <Select value={lang} onValueChange={setLang}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="es">Español</SelectItem>
      </SelectContent>
    </Select>
  )
}
