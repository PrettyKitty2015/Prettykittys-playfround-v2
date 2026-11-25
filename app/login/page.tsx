'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error ? error.message : 'Logged in!')
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error ? error.message : 'Check your email to confirm!')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#9E092B' }}>Login / Sign Up</h1>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <button onClick={signIn} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Sign In
      </button>
      <button onClick={signUp} style={{ width: '100%', padding: '0.75rem', background: '#4B176D', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Sign Up
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
