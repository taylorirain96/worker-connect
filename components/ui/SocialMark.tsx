interface SocialMarkProps {
  text: string
  className?: string
  screenReaderText?: string
}

export default function SocialMark({ text, className = '', screenReaderText }: SocialMarkProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`flex items-center justify-center font-semibold uppercase ${className}`.trim()}
      >
        {text}
      </span>
      {screenReaderText ? <span className="sr-only">{screenReaderText}</span> : null}
    </>
  )
}
