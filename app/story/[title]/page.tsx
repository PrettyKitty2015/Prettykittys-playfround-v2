'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StoryPage() {
  const params = useParams()
  const title = decodeURIComponent(params.title as string)
  const [characters, setCharacters] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (prof) setProfile(prof)
      }
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('story_title', title)
      if (data) setCharacters(data)
    }
    load()
  }, [title])

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1rem', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.4rem', marginRight: '0.5rem' }}>←</button>
        <h1 style={{ color: '#A855F7', margin: 0 }}>{title}</h1>
      </div>

      <a href={`/story-chat/${encodeURIComponent(title)}`} style={{ display: 'inline-block', marginBottom: '1.2rem', background: '#9E092B', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '20px', textDecoration: 'none' }}>
        Start Story Chat
      </a>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Characters</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.8rem' }}>
        {characters.map(char => (
          <a key={char.id} href={char.creator_id === profile?.id ? `/edit/${char.id}` : `/character/${char.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'rgba(21,18,25,0.55)', borderRadius: '12px', overflow: 'hidden' }}>
              {char.image_url && <img src={char.image_url} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
              <div style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
                {char.name}
                {char.creator_id === profile?.id && <div style={{ fontSize: '0.7rem', color: '#A855F7' }}>Edit</div>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
