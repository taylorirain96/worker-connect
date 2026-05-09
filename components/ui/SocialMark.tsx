interface SocialMarkProps {
  text: string
  className?: string
}

export default function SocialMark({ text, className = '' }: SocialMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center font-semibold uppercase ${className}`.trim()}
    >
      {text}
    </span>
  )
}
