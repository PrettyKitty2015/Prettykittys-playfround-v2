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
    <div style={{
      minHeight: '100vh',
      background: '#09090D',
      color: '#F2EDF5',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        {/* Logo */}
        <img
          src="YOUR_LOGO_PUBLIC_URL_HERE"
          alt="PrettyKitty’s Playground"
          style={{ width: '100%', maxWidth: '420px', margin: '1rem auto 0.5rem', display: 'block' }}
        />

        <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
          Where imagination runs wild, fantasies come alive, and every story has a little bite.
        </p>

        <div style={{ marginBottom: '2.5rem' }}>
          <a href="/create" style={{
            background: '#9E092B',
            color: '#fff',
            padding: '0.9rem 2rem',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 600,
            marginRight: '1rem'
          }}>
            Create Character
          </a>
          <a href="/login" style={{ color: '#A855F7', textDecoration: 'none' }}>
            Login
          </a>
        </div>

        <h2 style={{ textAlign: 'left', marginBottom: '1rem' }}>Characters</h2>

        {characters.length === 0 && <p>No characters yet. Create one!</p>}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
          textAlign: 'left'
        }}>
          {characters.map((char) => (
            <div key={char.id} style={{
              background: '#151219',
              border: '1px solid #333',
              borderRadius: '1rem',
              overflow: 'hidden'
            }}>
              {char.image_url && (
                <img src={char.image_url} alt={char.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ color: '#A855F7', margin: '0 0 0.5rem 0' }}>{char.name}</h3>
                <p style={{ margin: '0.25rem 0' }}>{char.description}</p>
                <a href={`/edit/${char.id}`} style={{ color: '#9E092B', fontSize: '0.9rem' }}>Edit</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
