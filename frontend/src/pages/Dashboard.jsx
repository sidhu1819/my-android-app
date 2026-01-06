import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import TransactionForm from '../components/TransactionForm.jsx'

// Helper to get emoji for category
const getIcon = (cat) => {
  const map = {
    'Food': '🍔', 'Travel': '🚕', 'Bills': '🧾', 
    'Shopping': '🛍️', 'Pocket Money': '💰', 'Internship': '💼'
  }
  return map[cat] || '💸'
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [dashboard, setDashboard] = useState({ income: 0, expense: 0, balance: 0 })
  const [alert, setAlert] = useState(null)

  useEffect(() => { refreshData() }, [])

  const refreshData = () => {
    axios.get('http://localhost:5000/transactions').then(res => setTransactions(res.data))
    axios.get('http://localhost:5000/dashboard').then(res => setDashboard(res.data))
  }

  return (
    <div style={{ paddingBottom: 100 }}> {/* Padding for floating nav */}
      
      {/* VISA STYLE CARD */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="balance-card"
      >
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
            <div>
                <span className="b-label">Total Balance</span>
                <span className="b-value">₹{dashboard.balance.toLocaleString()}</span>
            </div>
            <span style={{fontSize: '2rem'}}>💳</span>
        </div>
        <div style={{marginTop: 20, display: 'flex', gap: 10, opacity: 0.8, fontSize: '0.9rem', alignItems: 'center'}}>
            <span>**** **** **** 4242</span>
            <span style={{marginLeft: 'auto'}}>EXP 12/28</span>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>⬇️ Income</span>
          <h3 style={{color: '#34d399'}}>+₹{dashboard.income.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <span>🔥 Burned</span>
          <h3 style={{color: '#f87171'}}>-₹{dashboard.expense.toLocaleString()}</h3>
        </div>
      </div>

      {/* ADD TRANSACTION FORM */}
      <h3 className="section-title" style={{marginTop: 30}}>Quick Add</h3>
      <TransactionForm onSaved={refreshData} setAlert={setAlert} />

      {/* RECENT ACTIVITY LIST */}
      <h3 className="section-title" style={{marginTop: 30, marginBottom: 15}}>Recent Activity</h3>
      
      <div className="transaction-list">
        <AnimatePresence>
          {transactions.length === 0 && <p style={{opacity:0.5, textAlign:'center'}}>No activity yet.</p>}
          
          {transactions.slice(0, 5).map((t, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={t.id || i}
              className="transaction-item"
            >
              <div className="t-left">
                <div className="t-icon">{getIcon(t.category)}</div>
                <div>
                  <span className="t-cat">{t.category}</span>
                  <span className="t-date">{t.date} • {t.payment_mode}</span>
                </div>
              </div>
              <span className={`t-amt ${t.transaction_type === 'Income' ? 'pos' : 'neg'}`}>
                {t.transaction_type === 'Income' ? '+' : '-'}₹{t.amount}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}