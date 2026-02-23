export function ResonaLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M8 10h6a4 4 0 0 1 0 8h-2l4 6"
        className="stroke-primary-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="22" cy="14" r="3" className="stroke-primary-foreground" strokeWidth="2" fill="none" />
      <path
        d="M22 17v5"
        className="stroke-primary-foreground"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
