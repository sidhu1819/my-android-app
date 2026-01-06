import React, { useEffect, useState } from 'react'
import axios from 'axios'

const getIcon = (cat) => {
  const map = {
    'Food': '🍔', 'Travel': '🚕', 'Bills': '🧾', 
    'Shopping': '🛍️', 'Pocket Money': '💰', 'Internship': '💼'
  }
  return map[cat] || '💸'
}

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    axios.get('http://localhost:5000/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err))
  }, [])

  const filtered = () => {
    if (filter === 'All') return transactions
    const now = new Date()
    return transactions.filter(t => {
      const d = new Date(t.date)
      if (filter === 'This Week') return d >= new Date(now.setDate(now.getDate() - 7))
      if (filter === 'This Month') return d.getMonth() === new Date().getMonth()
      return true
    })
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="header-row" style={{marginBottom: 20}}>
        <h2 className="page-title">Full History</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{width: 'auto', padding: '8px 12px'}}>
          <option>All</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="transaction-list">
        {filtered().length === 0 && <p className="empty-state">No records found.</p>}
        
        {filtered().map((t, i) => (
          <div key={i} className="transaction-item">
            <div className="t-left">
              <div className="t-icon">{getIcon(t.category)}</div>
              <div>
                <span className="t-cat">{t.category}</span>
                <span className="t-date">{t.date}</span>
                {t.description && <span className="t-date" style={{fontStyle:'italic'}}>{t.description}</span>}
              </div>
            </div>
            <div style={{textAlign: 'right'}}>
                <span className={`t-amt ${t.transaction_type === 'Income' ? 'pos' : 'neg'}`}>
                  {t.transaction_type === 'Income' ? '+' : '-'} ₹{t.amount}
                </span>
                <div className="t-date" style={{marginTop: 4}}>{t.payment_mode}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}