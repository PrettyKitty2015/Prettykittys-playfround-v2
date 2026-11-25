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
      background: 'linear-gradient(180deg, #09090D 0%, #151219 100%)',
      color: '#F2EDF5',
      padding: '1.5rem 1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🐦‍⬛</div>
          <h1 style={{
            color: '#9E092B',
            fontSize: '2.8rem',
            margin: '0 0 0.5rem 0',
            fontWeight: 700
          }}>
            PrettyKitty’s Playground
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Where imagination runs wild, fantasies come alive, and every story has a little bite.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <a href="/create" style={{
            background: '#9E092B',
            color: '#fff',
            padding: '0.9rem 2rem',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 600,
            marginRight: '1rem',
            display: 'inline-block'
          }}>
            Create Character
          </a>
          <a href="/login" style={{
            color: '#A855F7',
            textDecoration: 'none',
            fontWeight: 500
          }}>
            Login
          </a>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Characters</h2>

        {characters.length === 0 && (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>No characters yet. Create your first one.</p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {characters.map((char) => (
            <div key={char.id} style={{
              background: 'rgba(21, 18, 25, 0.8)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '1rem',
              overflow: 'hidden',
              transition: 'transform 0.2s'
            }}>
              {char.image_url && (
                <img
                  src={char.image_url}
                  alt={char.name}
                  style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ color: '#A855F7', margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                  {char.name}
                </h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.95rem', opacity: 0.9 }}>
                  {char.description}
                </p>
                <p style={{ margin: '0.5rem 0', fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.75 }}>
                  {char.personality}
                </p>
                <a href={`/edit/${char.id}`} style={{
                  color: '#9E092B',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  fontWeight: 500
                }}>
                  Edit
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
