'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [characters, setCharacters] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setCharacters(data)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f2edf5', fontFamily: 'system-ui, sans-serif', paddingBottom: '70px' }}>
      <div style={{ textAlign: 'center', padding: '1.2rem 1rem 0.5rem' }}>
        <img
          src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_4425.jpeg"
          alt="PrettyKitty’s Playground"
          style={{ width: '100%', maxWidth: '340px', margin: '0 auto', display: 'block' }}
        />
      </div>

      <div style={{ padding: '0 1rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.8rem' }}>
          {characters.map((char) => (
            <a key={char.id} href={`/edit/${char.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#151219', borderRadius: '14px', overflow: 'hidden', border: '1px solid #2a2a35' }}>
                {char.image_url ? (
                  <img src={char.image_url} alt={char.name} style={{ width: '100%', height: '210px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: '210px', background: '#1a1520' }} />
                )}
                <div style={{ padding: '0.65rem 0.75rem 0.85rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{char.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '0.2rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {char.description}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#111116',
        borderTop: '1px solid #2a2a35',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.6rem 0 0.8rem',
        zIndex: 100
      }}>
        <a href="/" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.8rem', textAlign: 'center' }}>Home</a>
        <a href="/create" style={{ color: '#f2edf5', textDecoration: 'none', fontSize: '0.8rem', textAlign: 'center' }}>Create</a>
        <a href="/login" style={{ color: '#f2edf5', textDecoration: 'none', fontSize: '0.8rem', textAlign: 'center' }}>Profile</a>
      </div>
    </div>
  )
}
