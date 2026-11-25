'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) {
        setProfile(data)
        setUsername(data.username || '')
        setBio(data.bio || '')
      }
    }
    load()
  }, [router])

  async function save() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      bio
    })
    if (error) setMessage(error.message)
    else setMessage('Saved!')
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '1rem', paddingBottom: '90px' }}>
      <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', textAlign: 'center' }}>Profile</h1>

      {profile?.avatar_url && (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <img src={profile.avatar_url} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      )}

      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />

      <button onClick={save} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Save Profile
      </button>
      <button onClick={logout} style={{ width: '100%', padding: '0.75rem', background: '#4B176D', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Log Out
      </button>
      {message && <p style={{ color: '#A855F7', textAlign: 'center', marginTop: '1rem' }}>{message}</p>}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.9rem' }}>
        <a href="/" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>✨<br/>Create</a>
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/personas" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>👤<br/>Personas</a>
        <a href="/profile" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
