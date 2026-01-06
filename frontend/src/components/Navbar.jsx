import React from 'react'

export default function Navbar({ currentIndex, setIndex }) {
  const navItems = [
    { id: 0, label: 'Home', icon: '🏠' },
    { id: 1, label: 'Activity', icon: '📊' },
    { id: 2, label: 'Profile', icon: '👤' }
  ]

  return (
    <>
      {/* Top Brand Header (Static) */}
      <header style={{ padding: '20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Budget+</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Smart Finance</p>
        </div>
        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366f1, #ec4899)', borderRadius: '50%' }}></div>
      </header>

      {/* Floating Bottom Dock */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            className={`nav-item ${currentIndex === item.id ? 'active' : ''}`}
            onClick={() => setIndex(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px' }}
          >
            <span style={{ fontSize: '1.5rem', display: 'block' }}>{item.icon}</span>
          </button>
        ))}
      </nav>
    </>
  )
}