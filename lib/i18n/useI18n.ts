"use client"

import { useState, useEffect } from "react"

type Language = "en" | "fr" | "es"

const translations: Record<Language, Record<string, any>> = {
  en: {
    controls: {
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      randomize: "Randomize",
      coupling: "Coupling (K)",
      noise: "Noise (D)",
      frequency: "Frequency (ω₀)",
      presets: {
        chaos: "Chaos",
        edge: "Edge",
        coherent: "Coherent",
        pulse: "Pulse",
      },
    },
    gauges: {
      resonance: "Resonance (R)",
      wobble: "Wobble (W)",
    },
    about: {
      title: "About QOTE Live",
      description: "Life = phase-locked chaos; resonance stabilizes; wobble renews.",
      credits: "Built by Kayser Medical & Resona. MIT License.",
    },
    telemetry: "Coherence: {coherence}, Resonance: {resonance}, Wobble: {wobble}",
  },
  fr: {
    controls: {
      start: "Démarrer",
      pause: "Pause",
      reset: "Réinitialiser",
      randomize: "Aléatoire",
      coupling: "Couplage (K)",
      noise: "Bruit (D)",
      frequency: "Fréquence (ω₀)",
      presets: {
        chaos: "Chaos",
        edge: "Bord",
        coherent: "Cohérent",
        pulse: "Impulsion",
      },
    },
    gauges: {
      resonance: "Résonance (R)",
      wobble: "Oscillation (W)",
    },
    about: {
      title: "À propos de QOTE Live",
      description: "La vie = chaos verrouillé en phase; la résonance stabilise; l'oscillation renouvelle.",
      credits: "Conçu par Kayser Medical & Resona. Licence MIT.",
    },
    telemetry: "Cohérence: {coherence}, Résonance: {resonance}, Oscillation: {wobble}",
  },
  es: {
    controls: {
      start: "Iniciar",
      pause: "Pausa",
      reset: "Reiniciar",
      randomize: "Aleatorio",
      coupling: "Acoplamiento (K)",
      noise: "Ruido (D)",
      frequency: "Frecuencia (ω₀)",
      presets: {
        chaos: "Caos",
        edge: "Borde",
        coherent: "Coherente",
        pulse: "Pulso",
      },
    },
    gauges: {
      resonance: "Resonancia (R)",
      wobble: "Oscilación (W)",
    },
    about: {
      title: "Acerca de QOTE Live",
      description: "La vida = caos bloqueado en fase; la resonancia estabiliza; la oscilación renueva.",
      credits: "Desarrollado por Kayser Medical & Resona. Licencia MIT.",
    },
    telemetry: "Coherencia: {coherence}, Resonancia: {resonance}, Oscilación: {wobble}",
  },
}

export function useI18n() {
  const [lang, setLang] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("qote-lang") as Language
    if (saved && translations[saved]) {
      setLang(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("qote-lang", lang)
  }, [lang])

  const t = (key: string, replacements?: Record<string, string>) => {
    const keys = key.split(".")
    let value: any = translations[lang]

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value !== "string") {
      return key
    }

    if (replacements) {
      return value.replace(/\{(\w+)\}/g, (match: string, key: string) => replacements[key] || match)
    }

    return value
  }

  return { t, lang, setLang }
}
