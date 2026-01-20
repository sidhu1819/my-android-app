import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

const getIcon = (cat) => {
  const map = {
    'Food': '🍔', 'Travel': '🚕', 'Bills': '🧾', 
    'Shopping': '🛍️', 'Pocket Money': '💰', 'Internship': '💼',
    'Salary': '💰', 'Entertainment': '🎬', 'Utilities': '💡', 'Other': '💸'
  }
  return map[cat] || '💸'
}

// 1. Accept 'refresh' prop from App.jsx
export default function History({ refresh }) {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('All')

  // 2. Load data from Phone Storage (Offline)
  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem('budget_transactions')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        // Sort by date (Newest first)
        parsed.sort((a, b) => new Date(b.date) - new Date(a.date))
        setTransactions(parsed)
      } else {
        setTransactions([])
      }
    }
    loadData()
  }, [refresh]) // Re-run when 'refresh' changes

  const filtered = () => {
    if (filter === 'All') return transactions
    
    const now = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(now.getDate() - 7)
    
    return transactions.filter(t => {
      const d = new Date(t.date)
      if (filter === 'This Week') return d >= oneWeekAgo
      if (filter === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return true
    })
  }

  // Helper to delete an item (Optional feature)
  const handleDelete = (id) => {
    if (window.confirm("Delete this record?")) {
      const updated = transactions.filter(t => t.id !== id)
      setTransactions(updated)
      localStorage.setItem('budget_transactions', JSON.stringify(updated))
      // Trigger a reload in parent if needed, but local state update handles UI here
    }
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="header-row" style={{marginBottom: 20}}>
        <h2 className="page-title">Full History</h2>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className="bg-gray-800 text-white border-none rounded p-2"
            style={{width: 'auto'}}
          >
            <option>All</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      <div className="transaction-list space-y-3">
        {filtered().length === 0 && (
          <p className="empty-state text-gray-500 text-center mt-10">
            No records found. Tap + to add one.
          </p>
        )}
        
        {filtered().map((t, i) => (
          <div 
            key={i} 
            className="transaction-item bg-gray-800 p-4 rounded-xl flex justify-between items-center shadow-md mb-3"
            onClick={() => handleDelete(t.id)} // Tap to delete (optional)
          >
            <div className="t-left flex items-center gap-4">
              <div className="t-icon text-2xl">{getIcon(t.category)}</div>
              <div>
                <span className="t-cat block font-bold text-white">{t.category}</span>
                <span className="t-date text-xs text-gray-400 block">{t.date}</span>
                {t.description && (
                  <span className="text-xs text-gray-500 italic block">{t.description}</span>
                )}
              </div>
            </div>
            
            <div style={{textAlign: 'right'}}>
              {/* Check if type is 'income' (from Form) or 'Income' (legacy) */}
              <span className={`t-amt font-bold text-lg ${
                (t.type === 'income' || t.transaction_type === 'Income') ? 'text-green-400' : 'text-red-400'
              }`}>
                {(t.type === 'income' || t.transaction_type === 'Income') ? '+' : '-'} ₹{t.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}