'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleAuth() {
    setMessage('Working...')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, rgba(75, 23, 109, 0.35) 0%, #09090D 65%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <img
        src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_0109.jpeg"
        alt="NightBite"
        style={{ width: '100%', maxWidth: '320px', marginBottom: '2rem' }}
      />

      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'rgba(21, 18, 25, 0.65)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(168, 85, 247, 0.25)',
        borderRadius: '20px',
        padding: '1.5rem'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontFamily: "'Cinzel Decorative', serif", color: '#9E092B' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#09090D', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.6rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#09090D', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.6rem' }}
        />

        <button onClick={handleAuth}
          style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.6rem', marginTop: '0.8rem', fontWeight: 500 }}>
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#A855F7', cursor: 'pointer' }}>
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </span>
        </p>
        {message && <p style={{ textAlign: 'center', marginTop: '0.8rem', color: '#A855F7' }}>{message}</p>}
      </div>
    </div>
  )
}
