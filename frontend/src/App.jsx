import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Profile from './pages/Profile.jsx'
import './App.css'

export default function App() {
  const slides = [
    { id: 0, Comp: Dashboard },
    { id: 1, Comp: History },
    { id: 2, Comp: Profile }
  ]

  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const navigate = (newIndex) => {
    if (newIndex === index) return
    setDirection(newIndex > index ? 1 : -1)
    setIndex(newIndex)
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] } // Professional Ease
    },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      transition: { duration: 0.2 }
    })
  }

  return (
    <div className="app-shell">
      {/* Pass Navigation Logic */}
      <Navbar currentIndex={index} setIndex={navigate} />

      <div className="slider-container">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="slide-content"
          >
             {/* No extra glass-panel wrapper here to allow Dashboard to handle its own cards */}
             {React.createElement(slides[index].Comp)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}