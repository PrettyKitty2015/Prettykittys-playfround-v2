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
  const [recentChats, setRecentChats] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: chars } = await supabase
        .from('characters')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
      if (chars) setCharacters(chars)

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) setProfile(prof)

      const { data: msgs } = await supabase
        .from('messages')
        .select('character_id, characters(name, image_url)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (msgs) {
        const unique = []
        const seen = new Set()
        for (const m of msgs) {
          if (m.character_id && !seen.has(m.character_id)) {
            seen.add(m.character_id)
            unique.push(m)
          }
        }
        setRecentChats(unique.slice(0, 6))
      }
    }
    load()
  }, [router])

  // Group characters by story_title
  const grouped = characters.reduce((acc: any, char) => {
    const key = char.story_title || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(char)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', fontFamily: 'system-ui, sans-serif', paddingBottom: '90px' }}>
      <div style={{ textAlign: 'center', padding: '1.5rem 1rem 0.8rem' }}>
        <img
          src="https://apbydthwsxupxsqdumzl.supabase.co/storage/v1/object/public/character-images/IMG_0136.png"
          alt="NightBite"
          style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}
        />
        {profile?.username && (
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.6rem' }}>
            {profile.avatar_url && <img src={profile.avatar_url} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '0.3rem' }} />}
            {profile.username}
          </div>
        )}
      </div>

      {recentChats.length > 0 && (
        <div style={{ padding: '0 1rem 1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.6rem 0', color: '#A855F7' }}>Recent Chats</h3>
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {recentChats.map((chat: any) => (
              <a key={chat.character_id} href={`/chat/${chat.character_id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
                <div style={{ width: '72px', textAlign: 'center' }}>
                  {chat.characters?.image_url && (
                    <img src={chat.characters.image_url} alt="" style={{ width: '62px', height: '62px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #4B176D' }} />
                  )}
                  <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', opacity: 0.8 }}>{chat.characters?.name?.slice(0, 10)}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '0 1rem' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 0.8rem 0' }}>All Stories</h3>
        {Object.entries(grouped).map(([storyTitle, chars]: [string, any]) => (
          <div key={storyTitle} style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#A855F7', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{storyTitle}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.8rem' }}>
              {chars.map((char: any) => (
                <div key={char.id} style={{ 
                  background: 'rgba(21, 18, 25, 0.55)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(168, 85, 247, 0.22)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <a href={`/chat/${char.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {char.image_url && <img src={char.image_url} alt={char.name} style={{ width: '100%', height: '190px', objectFit: 'cover' }} />}
                    <div style={{ padding: '0.65rem 0.75rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{char.name}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.65, marginTop: '0.2rem' }}>{char.description?.slice(0, 55)}...</div>
                      {char.profiles?.username && (
                        <div style={{ fontSize: '0.65rem', color: '#A855F7', marginTop: '0.3rem' }}>by {char.profiles.username}</div>
                      )}
                    </div>
                  </a>
                  <div style={{ padding: '0 0.75rem 0.6rem', display: 'flex', justifyContent: 'space-between' }}>
                    <a href={`/character/${char.id}`} style={{ color: '#A855F7', fontSize: '0.7rem' }}>View</a>
                    {char.creator_id === profile?.id && <a href={`/edit/${char.id}`} style={{ color: '#A855F7', fontSize: '0.7rem' }}>Edit</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.9rem' }}>
        <a href="/" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>✨<br/>Create</a>
        <a href="/reels" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🎬<br/>Reels</a>
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
