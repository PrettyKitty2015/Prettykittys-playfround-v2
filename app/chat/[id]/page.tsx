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
  const [imagePrompt, setImagePrompt] = useState('')
  const [character, setCharacter] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const params = useParams()
  const id = params.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: char } = await supabase.from('characters').select('*').eq('id', id).single()
      setCharacter(char)
      if (char) setImagePrompt(`${char.name}, ${char.description || ''}`)
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert('Please log in')

    const userContent = input
    setInput('')
    setLoading(true)

    const userMsg = { character_id: id, user_id: session.user.id, content: userContent, role: 'user' }
    await supabase.from('messages').insert(userMsg)
    setMessages(prev => [...prev, { ...userMsg, id: Date.now() }])

    const history = messages.slice(-8).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))

    const systemPrompt = `You are ${character?.name || 'a character'}. Description: ${character?.description || ''}. Personality: ${character?.personality || ''}. Stay fully in character. Be immersive and natural.`

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: userContent }],
          temperature: 0.9
        })
      })
      const data = await res.json()
      const replyText = data.choices?.[0]?.message?.content || '...'
      const reply = { character_id: id, user_id: session.user.id, content: replyText, role: 'assistant' }
      await supabase.from('messages').insert(reply)
      setMessages(prev => [...prev, { ...reply, id: Date.now() + 1 }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Something went wrong.' }])
    }
    setLoading(false)
  }

  async function generateImage() {
    if (imageLoading || !imagePrompt.trim()) return
    setImageLoading(true)
    const encoded = encodeURIComponent(imagePrompt + ', highly detailed, cinematic')
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=768&nologo=true&enhance=true`

    setMessages(prev => [...prev, { id: Date.now(), role: 'image', content: imageUrl }])
    setImageLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#09090D', color: '#F2EDF5' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #2a2a35', textAlign: 'center', fontWeight: 600 }}>
        {character?.name || 'Chat'}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ margin: '0.6rem 0' }}>
            {msg.role === 'image' ? (
              <img src={msg.content} alt="Generated" style={{ maxWidth: '100%', borderRadius: '16px' }} />
            ) : (
              <div style={{
                padding: '0.8rem 1.1rem',
                borderRadius: '20px',
                maxWidth: '82%',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #9E092B, #c41e3a)' : '#151219',
                marginLeft: msg.role === 'user' ? 'auto' : '0',
                border: msg.role === 'assistant' ? '1px solid #333' : 'none'
              }}>
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {(loading || imageLoading) && <div style={{ opacity: 0.6, fontStyle: 'italic' }}>{imageLoading ? 'Creating image...' : 'Typing...'}</div>}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid #2a2a35' }}>
        <input
          value={imagePrompt}
          onChange={e => setImagePrompt(e.target.value)}
          placeholder="Image prompt (edit for NSFW, etc.)"
          style={{ width: '100%', padding: '0.6rem 0.8rem', marginBottom: '0.5rem', borderRadius: '12px', border: '1px solid #333', background: '#151219', color: '#F2EDF5', fontSize: '0.85rem' }}
        />
        <button
          onClick={generateImage}
          disabled={imageLoading}
          style={{ width: '100%', padding: '0.6rem', marginBottom: '0.6rem', borderRadius: '16px', background: '#4B176D', color: '#fff', border: 'none' }}
        >
          ✨ Generate Image
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Message..."
            style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '24px', border: '1px solid #333', background: '#151219', color: '#F2EDF5' }}
          />
          <button onClick={send} disabled={loading} style={{ padding: '0.8rem 1.3rem', borderRadius: '24px', background: '#9E092B', color: '#fff', border: 'none', fontWeight: 600 }}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
