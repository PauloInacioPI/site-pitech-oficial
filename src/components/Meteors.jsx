import '../styles/Meteors.css'

export default function Meteors({ number = 20 }) {
  return (
    <div className="meteors-container">
      {Array.from({ length: number }).map((_, i) => (
        <span
          key={`meteor-${i}`}
          className="meteor"
          style={{
            top: `${Math.floor(Math.random() * 80 - 10)}%`,
            left: `${Math.floor(Math.random() * 120 - 10)}%`,
            animationDelay: `${(Math.random() * 6 + 0.2).toFixed(2)}s`,
            animationDuration: `${Math.floor(Math.random() * 5 + 4)}s`,
          }}
        />
      ))}
    </div>
  )
}
