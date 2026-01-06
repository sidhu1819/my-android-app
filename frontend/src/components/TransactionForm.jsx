import React, { useState } from 'react'
import axios from 'axios'

export default function TransactionForm({ onSaved, setAlert }) {
  const [formData, setFormData] = useState({
    amount: '', category: 'Food', date: new Date().toISOString().split('T')[0],
    description: '', type: 'Expense', mode: 'Online'
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.amount) return
    try {
      const res = await axios.post('http://localhost:5000/add', formData)
      if (res.data.alert) {
        setAlert(res.data.alert)
        setTimeout(() => setAlert(null), 5000)
      }
      setFormData({ ...formData, amount: '', description: '' })
      onSaved && onSaved()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card no-print">
      <div className="currency-wrapper">
        <span className="currency-symbol">₹</span>
        <input type="number" name="amount" placeholder="0.00" value={formData.amount} onChange={handleChange} className="input-main-amount" />
      </div>

      <div className="row-inputs">
         <select name="type" value={formData.type} onChange={handleChange} className={`select-type ${formData.type === 'Income' ? 'text-green' : 'text-red'}`}>
            <option value="Expense">Expense (Pay)</option>
            <option value="Income">Income (Receive)</option>
         </select>
         <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-date"/>
      </div>
      
      <div className="row-inputs">
        <select name="category" value={formData.category} onChange={handleChange} className="input-select">
          <option>Food</option><option>Travel</option><option>Bills</option>
          <option>Shopping</option><option>Pocket Money</option><option>Internship</option>
        </select>
        <select name="mode" value={formData.mode} onChange={handleChange} className="input-select">
          <option value="Online">Online / UPI</option>
          <option value="Cash">Cash (Offline)</option>
        </select>
      </div>

      <input type="text" name="description" placeholder="Note (e.g. Starbucks)" value={formData.description} onChange={handleChange} className="input-note"/>
      
      <button type="submit" className="save-btn">Add Transaction</button>
    </form>
  )
}
