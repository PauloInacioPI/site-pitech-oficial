import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function TiltCard({ children, className = '', style = {}, onClick, onKeyDown, role, tabIndex }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x, y })
  }

  const handleMouseEnter = () => setIsHovered(true)

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={`tilt-card-wrapper ${className}`}
      style={{
        ...style,
        perspective: '800px',
      }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateY: isHovered ? tilt.x * 15 : 0,
        rotateX: isHovered ? -tilt.y * 15 : 0,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      {children}

      {/* Glass reflection */}
      {isHovered && (
        <div
          className="tilt-card-reflection"
          style={{
            background: `linear-gradient(
              ${135 + tilt.y * 60}deg,
              rgba(255,255,255,0.15) 0%,
              rgba(255,255,255,0.05) 40%,
              transparent 60%
            )`,
          }}
        />
      )}

      {/* Glow border */}
      {isHovered && (
        <div
          className="tilt-card-glow"
          style={{
            background: `radial-gradient(
              circle at ${(tilt.x + 0.5) * 100}% ${(tilt.y + 0.5) * 100}%,
              rgba(56, 189, 248, 0.3) 0%,
              transparent 60%
            )`,
          }}
        />
      )}
    </motion.div>
  )
}
