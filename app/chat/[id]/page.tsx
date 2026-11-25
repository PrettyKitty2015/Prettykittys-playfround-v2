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
    if (!input.trim()) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert('Please log in')

    const userMsg = { character_id: id, user_id: session.user.id, content: input, role: 'user' }
    await supabase.from('messages').insert(userMsg)
    setMessages(prev => [...prev, { ...userMsg, id: Date.now() }])
    setInput('')

    // Simple placeholder reply (we'll connect real AI later)
    const reply = { character_id: id, user_id: session.user.id, content: `*${character?.name || 'Character'} smiles* That's interesting... tell me more.`, role: 'assistant' }
    await supabase.from('messages').insert(reply)
    setMessages(prev => [...prev, { ...reply, id: Date.now() + 1 }])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#09090D', color: '#F2EDF5' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #2a2a35', textAlign: 'center' }}>
        <strong>{character?.name || 'Chat'}</strong>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            margin: '0.5rem 0',
            padding: '0.75rem 1rem',
            borderRadius: '18px',
            maxWidth: '80%',
            background: msg.role === 'user' ? '#9E092B' : '#151219',
            marginLeft: msg.role === 'user' ? 'auto' : '0',
            border: msg.role === 'assistant' ? '1px solid #333' : 'none'
          }}>
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid #2a2a35', display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: '1px solid #333', background: '#151219', color: '#F2EDF5' }}
        />
        <button onClick={send} style={{ padding: '0.75rem 1.2rem', borderRadius: '20px', background: '#9E092B', color: '#fff', border: 'none' }}>
          Send
        </button>
      </div>
    </div>
  )
}
