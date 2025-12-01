// Simple replacement for class-variance-authority
type ClassValue = string | number | boolean | undefined | null
type ClassArray = ClassValue[]
type ClassDictionary = Record<string, any>
type ClassProp = ClassValue | ClassArray | ClassDictionary

export function cn(...classes: ClassProp[]): string {
  return classes.flat().filter(Boolean).join(" ").trim()
}

export interface VariantProps<T> {
  [key: string]: any
}

export function cva(
  base: string,
  config?: {
    variants?: Record<string, Record<string, string>>
    defaultVariants?: Record<string, string>
  },
) {
  return (props?: Record<string, any>) => {
    let result = base

    if (config?.variants && props) {
      Object.entries(config.variants).forEach(([key, variants]) => {
        const value = props[key] || config.defaultVariants?.[key]
        if (value && variants[value]) {
          result += " " + variants[value]
        }
      })
    }

    if (props?.className) {
      result += " " + props.className
    }

    return result.trim()
  }
}
