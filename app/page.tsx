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
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f2edf5', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '1.5rem 1rem 1rem' }}>
        <img
          src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_4425.jpeg"
          alt="PrettyKitty’s Playground"
          style={{ width: '100%', maxWidth: '380px', margin: '0 auto', display: 'block' }}
        />
        <p style={{ margin: '0.75rem 0 0', opacity: 0.85, fontSize: '0.95rem' }}>
          Where imagination runs wild, fantasies come alive, and every story has a little bite.
        </p>
      </div>

      <div style={{ textAlign: 'center', padding: '0 1rem 1.5rem' }}>
        <a href="/create" style={{ background: '#9E092B', color: '#fff', padding: '0.85rem 1.8rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 600, marginRight: '0.75rem', display: 'inline-block' }}>
          Create
        </a>
        <a href="/login" style={{ color: '#A855F7', textDecoration: 'none', fontWeight: 500 }}>
          Login
        </a>
      </div>

      <div style={{ padding: '0 1rem 2rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0' }}>Characters</h2>
        {characters.length === 0 && <p style={{ textAlign: 'center', opacity: 0.6 }}>No characters yet.</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {characters.map((char) => (
            <a key={char.id} href={`/edit/${char.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#151219', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a35' }}>
                {char.image_url ? (
                  <img src={char.image_url} alt={char.name} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: '200px', background: '#1a1520' }} />
                )}
                <div style={{ padding: '0.6rem 0.7rem 0.8rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{char.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {char.description}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
