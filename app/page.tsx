'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [characters, setCharacters] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data: chars } = await supabase.from('characters').select('*').order('created_at', { ascending: false })
      if (chars) setCharacters(chars)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) setProfile(prof)
    }
    load()
  }, [router])

  const grouped = characters.reduce((acc: any, char) => {
    const key = char.story_title || char.name
    if (!acc[key]) acc[key] = []
    acc[key].push(char)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', paddingBottom: '90px', position: 'relative' }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/im8fw.mp4"
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1, opacity: 0.4 }}
      />

      <div style={{ textAlign: 'center', padding: '1.5rem 1rem 1rem', position: 'relative' }}>
        <img src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_0136.png" alt="NightBite" style={{ width: '100%', maxWidth: '240px' }} />
        {profile?.username && <p style={{ opacity: 0.8 }}>{profile.username}</p>}
      </div>

      <div style={{ padding: '0 1rem', position: 'relative' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.7rem' }}>All Stories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(grouped).map(([storyTitle, chars]: [string, any]) => {
            const cover = chars.find((c: any) => c.story_cover_url)?.story_cover_url || chars[0].image_url
            return (
              <a key={storyTitle} href={`/story/${encodeURIComponent(storyTitle)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'rgba(21,18,25,0.6)', borderRadius: '14px', overflow: 'hidden' }}>
                  {cover && <img src={cover} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
                  <div style={{ padding: '0.6rem' }}>
                    <div style={{ fontWeight: 600 }}>{storyTitle}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{chars.length} characters</div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.96)', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.8rem' }}>
        <a href="/" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem' }}>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem' }}>Create</a>
        <a href="/reels" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem' }}>Reels</a>
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem' }}>Chats</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem' }}>Profile</a>
      </div>
    </div>
  )
}
