'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [character, setCharacter] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const id = params.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: char } = await supabase.from('characters').select('*').eq('id', id).single()
      setCharacter(char)
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('character_id', id)
        .order('created_at', { ascending: true })
      if (msgs) setMessages(msgs)
    }
    if (id) load()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input, character_id: id }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('messages').insert({ ...userMsg, user_id: session.user.id })
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: `You are ${character?.name}. ${character?.personality || ''} ${character?.description || ''}` },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: input }
        ]
      })
    })
    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || '...'
    const aiMsg = { role: 'assistant', content: reply, character_id: id }
    setMessages(prev => [...prev, aiMsg])
    if (session) {
      await supabase.from('messages').insert({ ...aiMsg, user_id: session.user.id })
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      {character && (
        <div style={{ padding: '1rem', borderBottom: '1px solid #2a2a35', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {character.image_url && <img src={character.image_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />}
          <div>
            <div style={{ fontWeight: 600, fontFamily: "'Cinzel Decorative', serif" }}>{character.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{character.description?.slice(0, 60)}...</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '1rem', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '0.7rem 1rem',
              borderRadius: '16px',
              background: m.role === 'user' ? '#4B176D' : '#151219',
              border: '1px solid #2a2a35'
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ opacity: 0.6, fontStyle: 'italic' }}>Typing...</div>}
        <div ref={bottomRef} />
      </div>

      <div style={{ position: 'fixed', bottom: 70, left: 0, right: 0, padding: '0.8rem', background: '#09090D', borderTop: '1px solid #2a2a35' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '0.7rem', borderRadius: '12px', border: '1px solid #333', background: '#151219', color: '#F2EDF5' }}
          />
          <button onClick={send} style={{ padding: '0 1rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '12px' }}>Send</button>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.9rem' }}>
        <a href="/" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>✨<br/>Create</a>
        <a href="/chats" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/login" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🔑<br/>Login</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>👤<br/>Profile</a>
      </div>
    </div>
  )
}
