'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Reels() {
  const [reels, setReels] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setUserId(session.user.id)
    const { data } = await supabase
      .from('reels')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setReels(data)
  }

  useEffect(() => { load() }, [])

  async function deleteReel(id: string) {
    if (!confirm('Delete this reel?')) return
    await supabase.from('reels').delete().eq('id', id)
    load()
    setCurrent(0)
  }

  function next() { setCurrent(c => (c + 1) % reels.length) }
  function prev() { setCurrent(c => (c - 1 + reels.length) % reels.length) }

  if (reels.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#F2EDF5', padding: '1rem' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', color: '#A855F7', fontSize: '1.4rem' }}>←</button>
        <p>No reels yet.</p>
        <a href="/create-reel" style={{ background: '#9E092B', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '20px', textDecoration: 'none', marginTop: '1rem' }}>
          Create Reel
        </a>
      </div>
    )
  }

  const reel = reels[current]
  const isOwner = reel.creator_id === userId

  return (
    <div style={{ height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}
      onTouchStart={e => (e.currentTarget.dataset.y = e.touches[0].clientY.toString())}
      onTouchEnd={e => {
        const startY = Number(e.currentTarget.dataset.y)
        const endY = e.changedTouches[0].clientY
        if (startY - endY > 50) next()
        if (endY - startY > 50) prev()
      }}>
      <button onClick={() => router.back()} style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '1.3rem', width: '36px', height: '36px', borderRadius: '50%' }}>←</button>
      <a href="/create-reel" style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: '#9E092B', color: '#fff', padding: '0.5rem 1rem', borderRadius: '20px', textDecoration: 'none', fontSize: '0.85rem' }}>
        + Create
      </a>

      <video
        key={reel.id}
        src={reel.video_url}
        autoPlay
        loop
        playsInline
        controls
        poster={reel.thumbnail_url || undefined}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      <div style={{ position: 'absolute', bottom: '100px', left: '1rem', right: '1rem', color: '#fff', textShadow: '0 1px 4px #000' }}>
        {reel.series_title && <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{reel.series_title} • Ep {reel.episode_number}</div>}
        <h3 style={{ margin: '0.2rem 0' }}>{reel.title}</h3>
        <p style={{ margin: '0.3rem 0', opacity: 0.9 }}>{reel.description}</p>
        {isOwner && (
          <button onClick={() => deleteReel(reel.id)} style={{ marginTop: '0.5rem', background: '#9E092B', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem' }}>
            Delete
          </button>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.9rem' }}>
        <a href="/" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>✨<br/>Create</a>
        <a href="/reels" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🎬<br/>Reels</a>
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
