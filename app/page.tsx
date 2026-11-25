'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [characters, setCharacters] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: chars } = await supabase.from('characters').select('*').order('created_at', { ascending: false })
      if (chars) setCharacters(chars)

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (data) setProfile(data)
      }
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f2edf5', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <img src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_4425.jpeg" alt="Logo" style={{ width: '100%', maxWidth: '320px' }} />
        {profile && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
            {profile.avatar_url && <img src={profile.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '0.4rem' }} />}
            {profile.username || 'Your Profile'}
          </div>
        )}
      </div>

      <div style={{ padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.8rem' }}>
          {characters.map(char => (
            <a key={char.id} href={`/edit/${char.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#151219', borderRadius: '14px', overflow: 'hidden', border: '1px solid #2a2a35' }}>
                {char.image_url && <img src={char.image_url} alt={char.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />}
                <div style={{ padding: '0.6rem' }}>
                  <div style={{ fontWeight: 600 }}>{char.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.2rem' }}>{char.description?.slice(0, 60)}...</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111116', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.7rem 0', zIndex: 100 }}>
        <a href="/" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.8rem' }}>Home</a>
        <a href="/create" style={{ color: '#f2edf5', textDecoration: 'none', fontSize: '0.8rem' }}>Create</a>
        <a href="/profile" style={{ color: '#f2edf5', textDecoration: 'none', fontSize: '0.8rem' }}>Profile</a>
      </div>
    </div>
  )
}
