'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Profile() {
  const [stories, setStories] = useState<any[]>([])
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: prof } = await supabase.from('profiles').select('username').eq('id', session.user.id).single()
      if (prof) setUsername(prof.username || '')
      const { data: chars } = await supabase.from('characters').select('*').eq('creator_id', session.user.id)
      if (chars) setStories(chars)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1rem', paddingBottom: '90px' }}>
      <h1 style={{ color: '#A855F7' }}>{username || 'Profile'}</h1>
      <h2 style={{ marginTop: '1.5rem' }}>My Characters ({stories.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.8rem', marginTop: '1rem' }}>
        {stories.map(s => (
          <a key={s.id} href={`/character/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'rgba(21,18,25,0.6)', borderRadius: '12px', overflow: 'hidden' }}>
              {s.image_url && <img src={s.image_url} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
              <div style={{ padding: '0.5rem' }}>{s.name}</div>
            </div>
          </a>
        ))}
      </div>
      {stories.length === 0 && <p style={{ opacity: 0.6 }}>No characters yet.</p>}
    </div>
  )
}
