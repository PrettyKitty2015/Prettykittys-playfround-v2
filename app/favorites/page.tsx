'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('favorites').select('character_id, characters(*)').eq('user_id', session.user.id)
      if (data) setFavorites(data)
    }
    load()
  }, [])

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '1rem', paddingBottom: '90px' }}>
      <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B' }}>Favorites</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.8rem' }}>
        {favorites.map(f => (
          <a key={f.character_id} href={`/character/${f.character_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#151219', borderRadius: '14px', overflow: 'hidden' }}>
              {f.characters?.image_url && <img src={f.characters.image_url} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
              <div style={{ padding: '0.6rem' }}>{f.characters?.name}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
