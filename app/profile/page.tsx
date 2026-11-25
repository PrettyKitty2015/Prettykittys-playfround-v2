'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [characters, setCharacters] = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) {
        setProfile(data)
        setUsername(data.username || '')
        setBio(data.bio || '')
      }
      const { data: chars } = await supabase.from('characters').select('*').eq('creator_id', session.user.id)
      if (chars) setCharacters(chars)
    }
    load()
  }, [])

  async function save() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setMessage('Log in first')
    let avatarUrl = profile?.avatar_url
    if (avatar) {
      const fileName = `avatar-${session.user.id}-${Date.now()}.jpg`
      await supabase.storage.from('character-images').upload(fileName, avatar)
      const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
      avatarUrl = data.publicUrl
    }
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      bio,
      avatar_url: avatarUrl
    })
    setMessage(error ? error.message : 'Saved!')
  }

  return (
    <div style={{ background: '#0a0a0f', color: '#f2edf5', minHeight: '100vh', paddingBottom: '90px' }}>
      <div style={{ padding: '1.2rem', background: 'linear-gradient(180deg, #1a1025 0%, #0a0a0f 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #A855F7' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#2a2a35' }} />
          )}
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{profile?.username || 'Your Profile'}</div>
            <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>Member</div>
          </div>
        </div>
        <p style={{ margin: '1rem 0', opacity: 0.85 }}>{profile?.bio || 'Add a bio...'}</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => document.getElementById('edit')?.scrollIntoView()} style={btn}>Edit Profile</button>
          <button style={btn}>Share</button>
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        <h3 style={{ color: '#A855F7', marginBottom: '0.8rem' }}>Characters ({characters.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          {characters.map(c => (
            <a key={c.id} href={`/chat/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#151219', borderRadius: '14px', overflow: 'hidden', border: '1px solid #4B176D' }}>
                {c.image_url && <img src={c.image_url} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />}
                <div style={{ padding: '0.6rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem' }}>{c.description?.slice(0, 50)}...</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div id="edit" style={{ padding: '1rem', marginTop: '1rem' }}>
        <h3 style={{ color: '#9E092B' }}>Edit Profile</h3>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={input} />
        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" style={{ ...input, minHeight: '100px' }} />
        <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files?.[0] || null)} style={{ margin: '0.5rem 0', color: '#f2edf5' }} />
        <button onClick={save} style={{ ...btn, background: '#9E092B', width: '100%', marginTop: '0.5rem' }}>Save</button>
        {message && <p style={{ color: '#A855F7', marginTop: '0.5rem' }}>{message}</p>}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.7rem 0 1rem' }}>
        <a href="/" style={{ color: '#f2edf5', textDecoration: 'none', fontSize: '0.8rem' }}>Home</a>
        <a href="/create" style={{ color: '#f2edf5', textDecoration: 'none', fontSize: '0.8rem' }}>Create</a>
        <a href="/profile" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>Profile</a>
      </div>
    </div>
  )
}

const btn = { padding: '0.6rem 1.2rem', borderRadius: '12px', background: '#2a2a35', color: '#fff', border: 'none', fontSize: '0.85rem' }
const input = { width: '100%', padding: '0.75rem', margin: '0.4rem 0', background: '#151219', color: '#f2edf5', border: '1px solid #333', borderRadius: '10px' }