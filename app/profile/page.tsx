'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Profile() {
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setUsername(data.username || '')
        setBio(data.bio || '')
      }
    }
    load()
  }, [router])

  async function save() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username,
      bio
    })
    setMessage(error ? error.message : 'Profile saved!')
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem', color: '#f2edf5' }}>
      <h1 style={{ color: '#9E092B' }}>Edit Profile</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#f2edf5', border: '1px solid #333', borderRadius: '0.5rem' }}
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={e => setBio(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#f2edf5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '120px' }}
      />
      <button onClick={save} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>
        Save Profile
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
