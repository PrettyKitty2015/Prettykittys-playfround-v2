'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Personas() {
  const [personas, setPersonas] = useState<any[]>([])
  const [name, setName] = useState('')
  const [background, setBackground] = useState('')
  const [appearance, setAppearance] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('personas').select('*').eq('user_id', session.user.id)
    if (data) setPersonas(data)
  }

  useEffect(() => { load() }, [])

  async function createPersona() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.from('personas').insert({
      name,
      background,
      appearance,
      user_id: session.user.id
    })
    if (error) setMessage(error.message)
    else {
      setMessage('Persona created!')
      setName('')
      setBackground('')
      setAppearance('')
      load()
    }
  }

  async function deletePersona(id: string) {
    await supabase.from('personas').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '1rem', paddingBottom: '90px' }}>
      <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', textAlign: 'center' }}>Your Personas</h1>

      <div style={{ background: '#151219', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
        <input placeholder="Persona Name" value={name} onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '0.7rem', margin: '0.4rem 0', background: '#09090D', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
        <textarea placeholder="Background / Personality" value={background} onChange={e => setBackground(e.target.value)}
          style={{ width: '100%', padding: '0.7rem', margin: '0.4rem 0', background: '#09090D', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '70px' }} />
        <textarea placeholder="Appearance" value={appearance} onChange={e => setAppearance(e.target.value)}
          style={{ width: '100%', padding: '0.7rem', margin: '0.4rem 0', background: '#09090D', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '70px' }} />
        <button onClick={createPersona} style={{ width: '100%', padding: '0.7rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
          Create Persona
        </button>
        {message && <p style={{ color: '#A855F7', marginTop: '0.5rem' }}>{message}</p>}
      </div>

      {personas.map(p => (
        <div key={p.id} style={{ background: '#151219', padding: '0.8rem', borderRadius: '12px', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.background?.slice(0, 60)}...</div>
          </div>
          <button onClick={() => deletePersona(p.id)} style={{ background: '#9E092B', color: '#fff', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem' }}>Delete</button>
        </div>
      ))}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.9rem' }}>
        <a href="/" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>✨<br/>Create</a>
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/personas" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>👤<br/>Personas</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
