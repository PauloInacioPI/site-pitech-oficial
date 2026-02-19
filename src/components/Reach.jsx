import { useRef } from 'react'
import { motion } from 'framer-motion'
import useInView from '../hooks/useInView'
import WorldMap from './WorldMap'
import '../styles/Reach.css'

const mapDots = [
  {
    start: { lat: -21.54, lng: -42.18, label: 'Brasil' },
    end: { lat: 40.7128, lng: -74.006, label: 'New York' },
  },
  {
    start: { lat: -21.54, lng: -42.18 },
    end: { lat: 38.7223, lng: -9.1393, label: 'Lisboa' },
  },
  {
    start: { lat: -21.54, lng: -42.18 },
    end: { lat: 35.6762, lng: 139.6503, label: 'Tóquio' },
  },
  {
    start: { lat: -21.54, lng: -42.18 },
    end: { lat: 51.5074, lng: -0.1278, label: 'Londres' },
  },
  {
    start: { lat: -21.54, lng: -42.18 },
    end: { lat: 25.2048, lng: 55.2708, label: 'Dubai' },
  },
  {
    start: { lat: -21.54, lng: -42.18 },
    end: { lat: -33.8688, lng: 151.2093, label: 'Sydney' },
  },
]

export default function Reach() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.1)

  return (
    <section className="reach-section" ref={ref}>
      <div className="container">
        <motion.div
          className="reach-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="reach-tag">Alcance Global</p>
          <h2 className="reach-title">
            PiTech Sistemas é <span className="reach-highlight">você</span> em todo lugar!
          </h2>
          <p className="reach-subtitle">
            Nossos sistemas rodam 24 horas por dia, 7 dias por semana, em qualquer lugar do mundo.
            De Santo Antônio de Pádua para o planeta.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <WorldMap
            dots={mapDots}
            lineColor="#38bdf8"
            animationDuration={2}
            loop={true}
          />
        </motion.div>

        <motion.div
          className="reach-bottom"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="reach-bottom-text">
            Tecnologia feita no interior do Rio de Janeiro, acessível de <strong>qualquer canto do mundo</strong>.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
