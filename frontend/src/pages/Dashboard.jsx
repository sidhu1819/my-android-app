import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
  hover: { y: -4, transition: { duration: 0.2 } }
}

// Helper to get emoji for category
const getIcon = (cat) => {
  const map = {
    'Food': '🍔', 'Travel': '🚕', 'Bills': '🧾', 
    'Shopping': '🛍️', 'Pocket Money': '💰', 'Internship': '💼',
    'Salary': '💵', 'Entertainment': '🎬', 'Utilities': '💡', 'Other': '💸'
  }
  return map[cat] || '💸'
}

export default function Dashboard({ refresh, triggerRefresh }) {
  const [transactions, setTransactions] = useState([])
  const [dashboard, setDashboard] = useState({ income: 0, expense: 0, balance: 0 })

  // 1. Run this effect whenever 'refresh' prop changes (controlled by App.jsx)
  useEffect(() => { 
    loadData() 
  }, [refresh])

  const loadData = () => {
    // READ from LocalStorage
    const saved = localStorage.getItem('budget_transactions')
    const data = saved ? JSON.parse(saved) : []

    // CALCULATE Totals
    let inc = 0
    let exp = 0

    // Sort newest first
    data.sort((a, b) => new Date(b.date) - new Date(a.date))

    data.forEach(t => {
      const val = parseFloat(t.amount)
      if (t.type === 'income') inc += val
      else exp += val
    })

    setTransactions(data)
    setDashboard({ income: inc, expense: exp, balance: inc - exp })
  }

  const handleReset = () => {
    if (!window.confirm('⚠️ FACTORY RESET: This will delete ALL history from this phone. Proceed?')) return
    
    // DELETE from LocalStorage
    localStorage.removeItem('budget_transactions')
    
    // Refresh UI
    triggerRefresh() 
    alert('All history removed')
  }

  const handlePrint = () => window.print()

  return (
    <div style={{ paddingBottom: 100 }}> {/* Padding for floating nav */}
      
      <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginBottom: 12}}>
        <motion.button 
          onClick={handlePrint} 
          title="Print" 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{padding:'8px 12px', borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.04)'}}
        >
          🖨️ Print
        </motion.button>
        <motion.button 
          onClick={handleReset} 
          title="Reset All" 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{padding:'8px 12px', borderRadius:10, background:'#2d2d2d', border:'1px solid rgba(255,0,0,0.12)', color:'#ff6b6b'}}
        >
          🧨 Reset
        </motion.button>
      </div>

      {/* VISA STYLE CARD */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="balance-card"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding: 20, borderRadius: 20, color: 'white', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}
      >
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
            <div>
                <span style={{fontSize: '0.8rem', opacity: 0.8, display:'block', marginBottom: 5}}>Total Balance</span>
                <span style={{fontSize: '2rem', fontWeight: 'bold'}}>₹{dashboard.balance.toLocaleString()}</span>
            </div>
            <span style={{fontSize: '2rem'}}>💳</span>
        </div>
        <div style={{marginTop: 20, display: 'flex', gap: 10, opacity: 0.8, fontSize: '0.9rem', alignItems: 'center'}}>
            <span>**** **** **** 8888</span>
            <span style={{marginLeft: 'auto'}}>OFFLINE MODE</span>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <motion.div 
        className="stats-grid" 
        style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 20}}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card" style={{background: '#1f2937', padding: 15, borderRadius: 15}} variants={statCardVariants} whileHover="hover">
          <span style={{color: '#9ca3af', fontSize: '0.9rem'}}>⬇️ Income</span>
          <h3 style={{color: '#34d399', fontSize: '1.5rem', margin: '5px 0 0'}}>+₹{dashboard.income.toLocaleString()}</h3>
        </motion.div>
        <motion.div className="stat-card" style={{background: '#1f2937', padding: 15, borderRadius: 15}} variants={statCardVariants} whileHover="hover">
          <span style={{color: '#9ca3af', fontSize: '0.9rem'}}>🔥 Burned</span>
          <h3 style={{color: '#f87171', fontSize: '1.5rem', margin: '5px 0 0'}}>-₹{dashboard.expense.toLocaleString()}</h3>
        </motion.div>
      </motion.div>

      {/* RECENT ACTIVITY LIST */}
      <h3 className="section-title" style={{marginTop: 30, marginBottom: 15, color: 'white'}}>Recent Activity</h3>
      
      <div className="transaction-list">
        <AnimatePresence>
          {transactions.length === 0 && <p style={{opacity:0.5, textAlign:'center', color: 'gray'}}>No activity yet.</p>}
          
          {transactions.slice(0, 5).map((t, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={t.id || i}
              className="transaction-item"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                background: '#1f2937', padding: '12px 16px', marginBottom: 10, borderRadius: 12
              }}
            >
              <div className="t-left" style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div className="t-icon" style={{fontSize: '1.5rem'}}>{getIcon(t.category)}</div>
                <div>
                  <span className="t-cat" style={{display: 'block', fontWeight: 'bold', color: 'white'}}>{t.category}</span>
                  <span className="t-date" style={{fontSize: '0.8rem', color: '#9ca3af'}}>{t.date} • {t.description || 'No Desc'}</span>
                </div>
              </div>
              <span className={`t-amt`} style={{
                  fontWeight: 'bold', 
                  color: t.type === 'income' ? '#34d399' : '#f87171'
              }}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}