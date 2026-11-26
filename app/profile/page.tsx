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
  const [reels, setReels] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return router.push('/login')
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
    const { data: userReels } = await supabase.from('reels').select('*').eq('creator_id', session.user.id).order('created_at', { ascending: false })
    if (userReels) setReels(userReels)
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
    else {
      setMessage('Saved!')
      setEditing(false)
    }
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

  const grouped = stories.reduce((acc: any, char) => {
    const key = char.story_title || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(char)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', paddingBottom: '90px' }}>
      <div style={{ height: '130px', background: banner ? `url(${banner}) center/cover` : 'rgba(21,18,25,0.4)', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '-32px', left: '1rem' }}>
          <img src={avatar || 'https://via.placeholder.com/68'} alt="" style={{ width: '68px', height: '68px', borderRadius: '50%', border: `3px solid ${accent}`, objectFit: 'cover' }} />
        </div>
      </div>

      <div style={{ padding: '2.6rem 1rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: accent }}>{username || 'Your Name'}</h2>
          <button onClick={() => setEditing(!editing)} style={{ background: accent, color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem' }}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <p style={{ opacity: 0.7, margin: '0.25rem 0 1rem', fontSize: '0.88rem' }}>{bio || 'No bio yet'}</p>

        {editing && (
          <div style={{ background: 'rgba(21,18,25,0.5)', borderRadius: '14px', padding: '1rem', marginBottom: '1.2rem' }}>
            <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.6rem', margin: '0.3rem 0', background: 'rgba(9,9,13,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
            <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} style={{ width: '100%', padding: '0.6rem', margin: '0.3rem 0', background: 'rgba(9,9,13,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '60px' }} />
            <input type="color" value={accent} onChange={e => setAccent(e.target.value)} style={{ width: '100%', height: '36px', margin: '0.3rem 0', border: 'none' }} />
            <input type="file" accept="image/*" onChange={e => uploadImage(e, 'avatar')} style={{ margin: '0.3rem 0', color: '#F2EDF5' }} />
            <input type="file" accept="image/*" onChange={e => uploadImage(e, 'banner')} style={{ margin: '0.3rem 0', color: '#F2EDF5' }} />
            <button onClick={save} style={{ width: '100%', padding: '0.65rem', background: accent, color: '#fff', border: 'none', borderRadius: '0.5rem' }}>Save</button>
            {message && <p style={{ marginTop: '0.4rem', color: accent }}>{message}</p>}
          </div>
        )}

        <h3 style={{ color: accent, margin: '0 0 0.7rem' }}>My Stories</h3>
        {Object.entries(grouped).map(([storyTitle, chars]: [string, any]) => {
          const cover = chars.find((c: any) => c.story_cover_url)?.story_cover_url || chars[0].image_url
          return (
            <a key={storyTitle} href={`/story/${encodeURIComponent(storyTitle)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: '0.8rem' }}>
              <div style={{ background: 'rgba(21,18,25,0.5)', borderRadius: '14px', overflow: 'hidden', display: 'flex' }}>
                {cover && <img src={cover} alt="" style={{ width: '90px', height: '90px', objectFit: 'cover' }} />}
                <div style={{ padding: '0.6rem' }}>
                  <div style={{ fontWeight: 600 }}>{storyTitle}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{chars.length} character{chars.length > 1 ? 's' : ''}</div>
                </div>
              </div>
            </a>
          )
        })}

        <h3 style={{ color: accent, margin: '1.3rem 0 0.7rem' }}>My Reels</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.7rem' }}>
          {reels.map(r => (
            <a key={r.id} href="/reels" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(21,18,25,0.5)', borderRadius: '12px', overflow: 'hidden' }}>
                {r.thumbnail_url && <img src={r.thumbnail_url} alt="" style={{ width: '100%', height: '110px', objectFit: 'cover' }} />}
                <div style={{ padding: '0.5rem', fontSize: '0.82rem' }}>{r.title}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.96)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.55rem 0 0.8rem' }}>
        <a href="/" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.68rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.68rem', textAlign: 'center' }}>✨<br/>Create</a>
        <a href="/reels" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.68rem', textAlign: 'center' }}>🎬<br/>Reels</a>
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.68rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/profile" style={{ color: accent, textDecoration: 'none', fontSize: '0.68rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
