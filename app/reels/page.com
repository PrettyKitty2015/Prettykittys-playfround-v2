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
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data } = await supabase
        .from('reels')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
      if (data) setReels(data)
    }
    load()
  }, [router])

  if (reels.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F2EDF5' }}>
        No reels yet. Create the first one!
      </div>
    )
  }

  const reel = reels[current]

  return (
    <div style={{ height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <video
        key={reel.id}
        src={reel.video_url}
        autoPlay
        loop
        playsInline
        controls
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', bottom: '100px', left: '1rem', right: '1rem', color: '#fff', textShadow: '0 1px 4px #000' }}>
        <h3 style={{ margin: 0 }}>{reel.title}</h3>
        <p style={{ margin: '0.3rem 0', opacity: 0.9 }}>{reel.description}</p>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>by {reel.profiles?.username || 'Creator'}</div>
      </div>
      <div style={{ position: 'absolute', right: '1rem', bottom: '180px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={() => setCurrent(c => (c + 1) % reels.length)} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '48px', height: '48px' }}>↓</button>
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
