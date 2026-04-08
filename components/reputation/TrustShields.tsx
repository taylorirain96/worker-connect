interface Props {
  shields: number
}

export default function TrustShields({ shields }: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < shields ? 'text-blue-600' : 'text-gray-200'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" />
        </svg>
      ))}
    </div>
  )
}
