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
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (data) {
          setUsername(data.username || '')
          setBio(data.bio || '')
          setAvatarUrl(data.avatar_url || '')
        }
      }
    }
    load()
  }, [])

  async function save() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setMessage('Please log in on the login page first, then come back.')

    let finalUrl = avatarUrl
    if (avatar) {
      const fileName = `avatar-${Date.now()}.jpg`
      const { error } = await supabase.storage.from('character-images').upload(fileName, avatar)
      if (error) return setMessage(error.message)
      const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
      finalUrl = data.publicUrl
    }

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      bio,
      avatar_url: finalUrl
    })
    setMessage(error ? error.message : 'Saved!')
    if (!error) setAvatarUrl(finalUrl)
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem', color: '#f2edf5' }}>
      <h1 style={{ color: '#9E092B' }}>Edit Profile</h1>

      {avatarUrl && (
        <img src={avatarUrl} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} />
      )}

      <div style={{ margin: '1rem 0' }}>
        <label style={{ color: '#A855F7' }}>Profile Image</label>
        <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: '0.5rem', color: '#f2edf5' }} />
      </div>

      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#f2edf5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#f2edf5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '120px' }} />

      <button onClick={save} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Save Profile
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
