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
      background: 'linear-gradient(180deg, #09090D 0%, #120c18 100%)',
      color: '#F2EDF5',
      fontFamily: 'system-ui, sans-serif',
      paddingBottom: '90px',
      position: 'relative'
    }}>
      {/* Soft watermark */}
      <img
        src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_4431.jpeg"
        alt=""
        style={{
          position: 'fixed',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '260px',
          opacity: 0.06,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', padding: '1.4rem 1rem 0.8rem' }}>
          <img
            src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_4425.jpeg"
            alt="PrettyKitty’s Playground"
            style={{ width: '100%', maxWidth: '280px', margin: '0 auto', filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.3))' }}
          />
          {profile?.username && (
            <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.5rem' }}>
              {profile.avatar_url && (
                <img src={profile.avatar_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '0.4rem', border: '1px solid #A855F7' }} />
              )}
              {profile.username}
            </div>
          )}
        </div>

        <div style={{ padding: '0.5rem 1rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {characters.map(char => (
              <a key={char.id} href={`/chat/${char.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'rgba(21, 18, 25, 0.85)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(168,85,247,0.25)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                  transition: 'transform 0.2s'
                }}>
                  {char.image_url && (
                    <img src={char.image_url} alt={char.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '0.7rem 0.8rem 0.9rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#E9D5FF' }}>{char.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem', lineHeight: 1.35 }}>
                      {char.description?.slice(0, 60)}...
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bubbly bottom nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(17, 17, 22, 0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(168,85,247,0.2)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.7rem 0 1rem',
        zIndex: 100,
        borderRadius: '20px 20px 0 0'
      }}>
        <a href="/" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.8rem' }}>Create</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.8rem' }}>Profile</a>
      </div>
    </div>
  )
}
