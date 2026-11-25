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
    <div style={{
      minHeight: '100vh',
      background: '#09090D',
      color: '#F2EDF5',
      fontFamily: 'system-ui, sans-serif',
      paddingBottom: '80px',
      position: 'relative'
    }}>
      {/* Watermark emblem */}
      <img
        src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_4431.jpeg"
        alt=""
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '280px',
          opacity: 0.07,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', padding: '1.2rem 1rem 0.5rem' }}>
          <img
            src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_4425.jpeg"
            alt="PrettyKitty’s Playground"
            style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
          />
          {profile?.username && (
            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.4rem' }}>
              {profile.avatar_url && <img src={profile.avatar_url} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '0.35rem' }} />}
              {profile.username}
            </div>
          )}
        </div>

        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.75rem' }}>
            {characters.map(char => (
              <a key={char.id} href={`/edit/${char.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#151219', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(168,85,247,0.15)' }}>
                  {char.image_url && <img src={char.image_url} alt={char.name} style={{ width: '100%', height: '190px', objectFit: 'cover' }} />}
                  <div style={{ padding: '0.55rem 0.65rem 0.7rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{char.name}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.65, marginTop: '0.15rem' }}>
                      {char.description?.slice(0, 55)}...
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.65rem 0 0.8rem', zIndex: 100 }}>
        <a href="/" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 500 }}>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.78rem' }}>Create</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.78rem' }}>Profile</a>
      </div>
    </div>
  )
}
