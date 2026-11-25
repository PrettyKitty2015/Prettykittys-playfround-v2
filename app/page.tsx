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
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#9E092B', fontSize: '2.5rem' }}>PrettyKitty’s Playground</h1>
      <p style={{ marginBottom: '2rem' }}>
        Where imagination runs wild, fantasies come alive, and every story has a little bite.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <a
          href="/create"
          style={{
            background: '#9E092B',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            marginRight: '1rem'
          }}
        >
          Create Character
        </a>
        <a href="/login" style={{ color: '#A855F7' }}>
          Login
        </a>
      </div>

      <h2>Your Characters</h2>
      {characters.length === 0 && <p>No characters yet. Create one!</p>}

      {characters.map((char) => (
        <div
          key={char.id}
          style={{
            background: '#151219',
            padding: '1rem',
            margin: '1rem 0',
            borderRadius: '0.5rem',
            border: '1px solid #333'
          }}
        >
          {char.image_url && (
            <img
              src={char.image_url}
              alt={char.name}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
              }}
            />
          )}
          <h3 style={{ color: '#A855F7', margin: '0 0 0.5rem 0' }}>{char.name}</h3>
          <p style={{ margin: '0.25rem 0' }}>{char.description}</p>
          <p style={{ margin: '0.25rem 0', fontStyle: 'italic' }}>{char.personality}</p>
          <a
            href={`/edit/${char.id}`}
            style={{ color: '#A855F7', fontSize: '0.9rem', display: 'inline-block', marginTop: '0.5rem' }}
          >
            Edit
          </a>
        </div>
      ))}
    </div>
  )
}
