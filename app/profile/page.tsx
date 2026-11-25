'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Profile() {
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setMessage('You are logged in as ' + session.user.email)
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (data) {
          setUsername(data.username || '')
          setBio(data.bio || '')
        }
      } else {
        setMessage('Not logged in. Go to /login first, then come back.')
      }
    }
    check()
  }, [])

  async function save() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setMessage('Log in first')
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      bio
    })
    setMessage(error ? error.message : 'Saved!')
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem', color: '#f2edf5' }}>
      <h1 style={{ color: '#9E092B' }}>Profile</h1>
      <p>{message}</p>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#f2edf5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#f2edf5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '100px' }} />
      <button onClick={save} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>
        Save
      </button>
    </div>
  )
}
