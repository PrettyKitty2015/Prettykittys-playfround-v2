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
  const [accent, setAccent] = useState('#A855F7')
  const [banner, setBanner] = useState('')
  const [avatar, setAvatar] = useState('')
  const [stories, setStories] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (prof) {
      setProfile(prof)
      setUsername(prof.username || '')
      setBio(prof.bio || '')
      setAccent(prof.accent_color || '#A855F7')
      setBanner(prof.banner_url || '')
      setAvatar(prof.avatar_url || '')
    }
    const { data: chars } = await supabase.from('characters').select('*').eq('creator_id', session.user.id).order('created_at', { ascending: false })
    if (chars) setStories(chars)
  }

  useEffect(() => { load() }, [])

  async function save() {
    setMessage('Saving...')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      bio,
      accent_color: accent,
      banner_url: banner,
      avatar_url: avatar
    })
    if (error) setMessage(error.message)
    else setMessage('Saved!')
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') {
    const file = e.target.files?.[0]
    if (!file) return
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('character-images').upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
      if (type === 'avatar') setAvatar(data.publicUrl)
      else setBanner(data.publicUrl)
    }
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', paddingBottom: '90px' }}>
      <div style={{
        height: '140px',
        background: banner ? `url(${banner}) center/cover` : 'rgba(21,18,25,0.5)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', bottom: '-36px', left: '1rem' }}>
          <img src={avatar || 'https://via.placeholder.com/72'} alt="" style={{ width: '72px', height: '72px', borderRadius: '50%', border: `3px solid ${accent}`, objectFit: 'cover' }} />
        </div>
      </div>

      <div style={{ padding: '2.8rem 1rem 1rem' }}>
        <h2 style={{ margin: 0, color: accent }}>{username || 'Your Name'}</h2>
        <p style={{ opacity: 0.7, margin: '0.3rem 0 1rem', fontSize: '0.9rem' }}>{bio || 'No bio yet'}</p>

        <div style={{ background: 'rgba(21,18,25,0.55)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', margin: '0.3rem 0', background: 'rgba(9,9,13,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
          <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', margin: '0.3rem 0', background: 'rgba(9,9,13,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '60px' }} />
          <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Accent Color</label>
          <input type="color" value={accent} onChange={e => setAccent(e.target.value)} style={{ width: '100%', height: '40px', margin: '0.3rem 0', border: 'none', borderRadius: '0.5rem' }} />
          <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Profile Picture</label>
          <input type="file" accept="image/*" onChange={e => uploadImage(e, 'avatar')} style={{ margin: '0.3rem 0', color: '#F2EDF5' }} />
          <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Banner</label>
          <input type="file" accept="image/*" onChange={e => uploadImage(e, 'banner')} style={{ margin: '0.3rem 0', color: '#F2EDF5' }} />
          <button onClick={save} style={{ width: '100%', padding: '0.7rem', background: accent, color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>Save Profile</button>
          {message && <p style={{ marginTop: '0.5rem', color: accent }}>{message}</p>}
        </div>

        <h3 style={{ color: accent, margin: '0 0 0.8rem' }}>My Characters ({stories.length})</h3>
        {stories.length === 0 && <p style={{ opacity: 0.6 }}>No characters yet.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.8rem' }}>
          {stories.map(s => (
            <a key={s.id} href={`/character/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(21,18,25,0.55)', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(168,85,247,0.2)' }}>
                {s.image_url && <img src={s.image_url} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
                <div style={{ padding: '0.6rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem' }}>{s.description?.slice(0, 50)}...</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.9rem' }}>
        <a href="/" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>✨<br/>Create</a>
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/personas" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>👤<br/>Personas</a>
        <a href="/profile" style={{ color: accent, textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
