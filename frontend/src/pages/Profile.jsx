import React, { useEffect, useState } from 'react'

export default function Profile() {
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')

  useEffect(() => {
    const s = localStorage.getItem('bb_profile')
    if (s) {
      const obj = JSON.parse(s)
      setName(obj.name || '')
      setLimit(obj.monthlyBudget || '')
    }
  }, [])

  const save = () => {
    localStorage.setItem('bb_profile', JSON.stringify({ name, monthlyBudget: limit }))
    alert('✅ Settings Saved!')
  }

  return (
    <>
      <h2 className="page-title">Profile Settings</h2>
      <div className="form-stack">
        <div className="input-group">
          <label>Display Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
        </div>
        
        <div className="input-group">
          <label>Monthly Budget Target (₹)</label>
          <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5000" />
        </div>

        <button className="btn-primary" onClick={save}>Save Changes</button>
      </div>
    </>
  )
}