'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Chats() {
  const [chats, setChats] = useState<any[]>([])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('messages')
      .select('character_id, characters(name, image_url, description)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) {
      const unique: any[] = []
      const seen = new Set()
      for (const m of data) {
        if (m.character_id && !seen.has(m.character_id)) {
          seen.add(m.character_id)
          unique.push(m)
        }
      }
      setChats(unique)
    }
  }

  useEffect(() => { load() }, [])

  async function deleteChat(characterId: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('messages').delete().eq('user_id', session.user.id).eq('character_id', characterId)
    load()
  }

  async function newChat(characterId: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('messages').delete().eq('user_id', session.user.id).eq('character_id', characterId)
    window.location.href = `/chat/${characterId}`
  }

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '1rem', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', fontSize: '1.8rem', margin: 0 }}>Chats</h1>
        <a href="/personas" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.9rem' }}>+ Persona</a>
      </div>

      {chats.length === 0 && <p style={{ textAlign: 'center', opacity: 0.6 }}>No chats yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {chats.map((chat: any) => (
          <div key={chat.character_id} style={{ background: '#151219', padding: '0.7rem', borderRadius: '14px', border: '1px solid #2a2a35', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {chat.characters?.image_url && (
              <img src={chat.characters.image_url} alt="" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{chat.characters?.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.65 }}>{chat.characters?.description?.slice(0, 40)}...</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <a href={`/chat/${chat.character_id}`} style={{ background: '#4B176D', color: '#fff', padding: '0.35rem 0.6rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>Open</a>
              <button onClick={() => newChat(chat.character_id)} style={{ background: '#086B50', color: '#fff', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem' }}>New Chat</button>
              <button onClick={() => deleteChat(chat.character_id)} style={{ background: '#9E092B', color: '#fff', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.9rem' }}>
        <a href="/" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>✨<br/>Create</a>
        <a href="/chats" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/personas" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>👤<br/>Personas</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
