'use client'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#9E092B', marginBottom: '1.5rem' }}>Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }}
      />
      <button style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#F2EDF5', border: 'none', borderRadius: '0.5rem' }}>
        Sign In
      </button>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <a href="/" style={{ color: '#A855F7' }}>Back to Home</a>
      </p>
    </div>
  )
}
