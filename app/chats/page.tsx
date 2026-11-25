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
      .select('chat_id, character_id, characters(name, image_url)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) {
      const map = new Map()
      for (const m of data) {
        const key = m.chat_id || m.character_id
        if (key && !map.has(key)) {
          map.set(key, m)
        }
      }
      setChats(Array.from(map.values()))
    }
  }

  useEffect(() => { load() }, [])

  async function deleteChat(chatId: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('messages').delete().eq('user_id', session.user.id).eq('chat_id', chatId)
    load()
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1rem', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', margin: 0 }}>Chats</h1>
        <a href="/favorites" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.9rem' }}>★ Favorites</a>
      </div>
      {chats.length === 0 && <p style={{ opacity: 0.6, marginTop: '1rem' }}>No chats yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
        {chats.map((chat: any) => (
          <div key={chat.chat_id || chat.character_id} style={{ background: 'rgba(21, 18, 25, 0.55)', backdropFilter: 'blur(6px)', padding: '0.7rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid rgba(168,85,247,0.2)' }}>
            {chat.characters?.image_url && <img src={chat.characters.image_url} alt="" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{chat.characters?.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.65 }}>Storyline</div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <a href={`/chat/${chat.character_id}?chat=${chat.chat_id}`} style={{ background: '#4B176D', color: '#fff', padding: '0.4rem 0.7rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.75rem' }}>Open</a>
              <button onClick={() => deleteChat(chat.chat_id)} style={{ background: '#9E092B', color: '#fff', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem' }}>Delete</button>
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
