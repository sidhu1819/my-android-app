import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Profile from './pages/Profile.jsx'
import TransactionForm from './components/TransactionForm.jsx' // Import the form
import './App.css'

export default function App() {
  const slides = [
    { id: 0, Comp: Dashboard },
    { id: 1, Comp: History },
    { id: 2, Comp: Profile }
  ]

  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  
  // 1. New State for Offline Data Sync
  const [refresh, setRefresh] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false) // Controls the "Add" popup

  // Helper to force reload when data changes
  const triggerRefresh = () => setRefresh(prev => !prev)

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
      transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
    },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      transition: { duration: 0.2 }
    })
  }

  return (
    <div className="app-shell relative min-h-screen bg-gray-900 text-white">
      {/* Navbar receives navigation props */}
      <Navbar currentIndex={index} setIndex={navigate} />

      <div className="slider-container pb-20"> {/* Added padding for bottom nav */}
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="slide-content p-4"
          >
             {/* 2. Pass 'refresh' to active component so it updates automatically */}
             {React.createElement(slides[index].Comp, { 
                refresh: refresh,
                triggerRefresh: triggerRefresh 
             })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Floating Action Button (FAB) for Adding Transactions */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-3xl font-bold z-50 hover:bg-green-400 transition-colors"
      >
        +
      </button>

      {/* 4. Modal for Add Transaction */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          >
            <div className="w-full max-w-md bg-gray-800 rounded-xl overflow-hidden relative">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
              
              <div className="p-2">
                {/* When form submits, close modal and refresh data */}
                <TransactionForm onTransactionAdded={() => {
                  triggerRefresh();
                  setShowAddModal(false);
                }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}