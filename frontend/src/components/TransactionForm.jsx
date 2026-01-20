import React, { useState } from 'react'
import { addTransaction, getHistory, checkBurnerAnomaly } from '../services/localAPI'

export default function TransactionForm({ onTransactionAdded, setAlert }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'Expense',
    mode: 'Online'
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.amount) return

    try {
      const val = parseFloat(formData.amount)

      // 1. ANOMALY DETECTION (Offline AI)
      // Checks if this single expense is huge compared to your average
      if (formData.type === 'Expense') {
        const anomaly = checkBurnerAnomaly(val);
        if (anomaly.is_burner) {
           const msg = `⚠️ High Spending Alert! This is above your normal threshold of ₹${anomaly.threshold}`;
           if(setAlert) setAlert(msg);
           else alert(msg);
        }
      }

      // 2. BUDGET HEALTH CHECK (90% Rule)
      // Check total income vs total expense to prevent overspending
      const currentTransactions = getHistory(); 
      const totalIncome = currentTransactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = currentTransactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // If this new expense pushes us over 90% of income
      if (formData.type === 'Expense' && totalIncome > 0) {
        if ((totalExpense + val) > (totalIncome * 0.9)) {
           const msg = "⚠️ Critical: You have utilized over 90% of your total income!";
           if (setAlert) setAlert(msg);
        }
      }

      // 3. SAVE TO LOCAL DATABASE
      addTransaction({
        ...formData,
        amount: val // Ensure it saves as a number
      })

      // 4. RESET FORM
      setFormData({
        ...formData,
        amount: '',
        description: ''
      })

      // 5. REFRESH DASHBOARD
      if (onTransactionAdded) onTransactionAdded()

    } catch (err) {
      console.error("Error saving offline:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card no-print">
      <div className="currency-wrapper">
        <span className="currency-symbol">₹</span>
        <input 
          type="number" 
          name="amount" 
          placeholder="0.00" 
          value={formData.amount} 
          onChange={handleChange} 
          className="input-main-amount" 
          required
        />
      </div>

      <div className="row-inputs">
         <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange} 
            className={`select-type ${formData.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}
         >
            <option value="Expense">Expense (Pay)</option>
            <option value="Income">Income (Receive)</option>
         </select>
         <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            className="input-date"
          />
      </div>
      
      <div className="row-inputs">
        <select name="category" value={formData.category} onChange={handleChange} className="input-select">
          <option>Food</option>
          <option>Travel</option>
          <option>Bills</option>
          <option>Shopping</option>
          <option>Pocket Money</option>
          <option>Internship</option>
          <option>Salary</option>
          <option>Other</option>
        </select>
        <select name="mode" value={formData.mode} onChange={handleChange} className="input-select">
          <option value="Online">Online / UPI</option>
          <option value="Cash">Cash (Offline)</option>
        </select>
      </div>

      <input 
        type="text" 
        name="description" 
        placeholder="Note (e.g. Starbucks)" 
        value={formData.description} 
        onChange={handleChange} 
        className="input-note"
      />
      
      <button type="submit" className="save-btn">Add Transaction</button>
    </form>
  )
}