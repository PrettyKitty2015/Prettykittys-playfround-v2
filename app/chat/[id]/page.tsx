'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [character, setCharacter] = useState<any>(null)
  const [personas, setPersonas] = useState<any[]>([])
  const [selectedPersona, setSelectedPersona] = useState<any>(null)
  const [showPersonaPicker, setShowPersonaPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: char } = await supabase.from('characters').select('*').eq('id', id).single()
      setCharacter(char)

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: pers } = await supabase.from('personas').select('*').eq('user_id', session.user.id)
        if (pers) setPersonas(pers)
      }

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
    setError('')
    const userMsg = { role: 'user', content: input, character_id: id }
    setMessages(prev => [...prev, userMsg])
    const currentInput = input
    setInput('')
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('messages').insert({ ...userMsg, user_id: session.user.id })
    }

    const personaText = selectedPersona
      ? `The user is roleplaying as ${selectedPersona.name}. Background: ${selectedPersona.background || ''}. Appearance: ${selectedPersona.appearance || ''}.`
      : ''

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://prettykittys-playground.vercel.app',
          'X-Title': 'NightBite'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct',
          messages: [
            { role: 'system', content: `You are ${character?.name || 'a character'}. Personality: ${character?.personality || ''}. Description: ${character?.description || ''}. Scenario: ${character?.scenario || ''}. ${personaText} Stay in character and respond to the user's persona.` },
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: currentInput }
          ]
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        setError(`API Error: ${res.status} - ${errText.slice(0, 150)}`)
        setLoading(false)
        return
      }

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'No response'
      const aiMsg = { role: 'assistant', content: reply, character_id: id }
      setMessages(prev => [...prev, aiMsg])
      if (session) {
        await supabase.from('messages').insert({ ...aiMsg, user_id: session.user.id })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reach AI')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid #2a2a35', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
        {character?.image_url && <img src={character.image_url} alt="" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontFamily: "'Cinzel Decorative', serif" }}>{character?.name || 'Chat'}</div>
          <div onClick={() => setShowPersonaPicker(!showPersonaPicker)} style={{ fontSize: '0.75rem', color: '#A855F7', cursor: 'pointer' }}>
            {selectedPersona ? `Playing as: ${selectedPersona.name}` : 'Select Persona'}
          </div>
        </div>
      </div>

      {showPersonaPicker && (
        <div style={{ background: '#151219', padding: '0.8rem', borderBottom: '1px solid #2a2a35' }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Choose a Persona:</div>
          {personas.length === 0 && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>No personas yet. Create one first.</div>}
          {personas.map(p => (
            <div key={p.id} onClick={() => { setSelectedPersona(p); setShowPersonaPicker(false) }}
              style={{ padding: '0.5rem', borderRadius: '8px', background: selectedPersona?.id === p.id ? '#4B176D' : '#09090D', marginBottom: '0.3rem', cursor: 'pointer' }}>
              {p.name}
            </div>
          ))}
          <a href="/personas" style={{ color: '#A855F7', fontSize: '0.8rem' }}>+ Create New Persona</a>
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
        {error && <div style={{ color: '#ff6b6b', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</div>}
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
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/personas" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>👤<br/>Personas</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
