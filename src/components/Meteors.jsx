import '../styles/Meteors.css'

export default function Meteors({ number = 20 }) {
  return (
    <>
      {Array.from({ length: number }).map((_, i) => (
        <span
          key={`meteor-${i}`}
          className="meteor"
          style={{
            top: 0,
            left: `${Math.floor(Math.random() * 800 - 400)}px`,
            animationDelay: `${(Math.random() * 0.6 + 0.2).toFixed(2)}s`,
            animationDuration: `${Math.floor(Math.random() * 8 + 2)}s`,
          }}
        />
      ))}
    </>
  )
}
