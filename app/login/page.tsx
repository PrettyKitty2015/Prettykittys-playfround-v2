'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/')
    })
  }, [router])

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else router.push('/')
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Check your email to confirm!')
  }

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', textAlign: 'center' }}>NightBite</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <button onClick={signIn} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Login
      </button>
      <button onClick={signUp} style={{ width: '100%', padding: '0.75rem', background: '#4B176D', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Sign Up
      </button>
      {message && <p style={{ color: '#A855F7', textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
    </div>
  )
}
