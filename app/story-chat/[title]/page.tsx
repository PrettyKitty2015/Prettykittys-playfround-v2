'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StoryChat() {
  const params = useParams()
  const title = decodeURIComponent(params.title as string)
  const [characters, setCharacters] = useState<any[]>([])
  const [personas, setPersonas] = useState<any[]>([])
  const [selectedPersona, setSelectedPersona] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [sceneImage, setSceneImage] = useState<string | null>(null)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserId(session.user.id)

      const { data: chars } = await supabase.from('characters').select('*').eq('story_title', title)
      if (chars) {
        setCharacters(chars)
        const cover = chars.find(c => c.story_cover_url)?.story_cover_url || chars[0]?.image_url
        if (cover) setBgImage(cover)
      }

      const { data: pers } = await supabase.from('personas').select('*').eq('user_id', session.user.id)
      if (pers) setPersonas(pers)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('story_title', title)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
      if (msgs) setMessages(msgs)
    }
    load()
  }, [title, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || !userId) return
    setLoading(true)
    const userMessage = input
    setInput('')

    await supabase.from('messages').insert({
      user_id: userId,
      story_title: title,
      role: 'user',
      content: userMessage
    })

    const charList = characters.map(c => `${c.name}: ${c.description || ''}`).join('\n\n')
    const personaText = selectedPersona
      ? `The user is roleplaying as ${selectedPersona.name}: ${selectedPersona.description || ''}`
      : 'The user is roleplaying as themselves.'

    const system = `You are roleplaying a multi-character story called "${title}".
Characters:
${charList}

${personaText}

Respond in character as one or more of the characters. Use *italics* for actions and "quotes" for dialogue. Stay in third person for actions.`

    const history = messages.map(m => `${m.role}: ${m.content}`).join('\n')
    const prompt = `${system}\n\n${history}\nuser: ${userMessage}\nassistant:`

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()
    const reply = data.reply || '...'

    await supabase.from('messages').insert({
      user_id: userId,
      story_title: title,
      role: 'assistant',
      content: reply
    })

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: reply }
    ])
    setLoading(false)
  }

  async function generateScene() {
    const last = messages.filter(m => m.role === 'assistant').pop()
    if (!last) return
    const prompt = encodeURIComponent(`${title}, ${last.content.slice(0, 200)}, cinematic, detailed, gothic fantasy`)
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=768&nologo=true`
    setSceneImage(url)
  }

  async function rewriteLast() {
    if (messages.length < 2) return
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUser) return
    setLoading(true)

    const charList = characters.map(c => `${c.name}: ${c.description || ''}`).join('\n\n')
    const personaText = selectedPersona
      ? `The user is roleplaying as ${selectedPersona.name}: ${selectedPersona.description || ''}`
      : 'The user is roleplaying as themselves.'

    const system = `You are roleplaying a multi-character story called "${title}".
Characters:
${charList}

${personaText}

Respond in character as one or more of the characters. Use *italics* for actions and "quotes" for dialogue. Stay in third person for actions.`

    const history = messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n')
    const prompt = `${system}\n\n${history}\nuser: ${lastUser.content}\nassistant:`

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()
    const reply = data.reply || '...'

    const newMessages = [...messages.slice(0, -1), { role: 'assistant', content: reply }]
    setMessages(newMessages)

    // Update the last message in the database
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.id) {
      await supabase.from('messages').update({ content: reply }).eq('id', lastMsg.id)
    }

    setLoading(false)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', color: '#F2EDF5', position: 'relative' }}>
      {bgImage && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `url(${bgImage}) center/cover`, zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(9,9,13,0.55)', zIndex: 0 }} />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid rgba(42,42,53,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(9,9,13,0.6)' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.3rem' }}>←</button>
          <div style={{ fontWeight: 600, flex: 1 }}>{title}</div>
          <select
            value={selectedPersona?.id || ''}
            onChange={e => setSelectedPersona(personas.find(p => p.id === e.target.value) || null)}
            style={{ background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '8px', padding: '0.3rem' }}
          >
            <option value="">No Persona</option>
            {personas.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {sceneImage && (
          <div style={{ padding: '0.5rem 1rem' }}>
            <img src={sceneImage} alt="Scene" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: '0.8rem', textAlign: m.role === 'user' ? 'right' : 'left' }}>
              <div style={{
                display: 'inline-block',
                background: m.role === 'user' ? 'rgba(75,23,109,0.85)' : 'rgba(21,18,25,0.75)',
                padding: '0.6rem 0.8rem',
                borderRadius: '12px',
                maxWidth: '80%',
                whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(9,9,13,0.7)', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={generateScene} style={{ background: 'rgba(21,18,25,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', fontSize: '1.1rem' }} title="Generate Image">🖼️</button>
          <button onClick={rewriteLast} style={{ background: 'rgba(21,18,25,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', fontSize: '1.1rem' }} title="Rewrite">🔄</button>
          <button onClick={() => alert('Video generation coming soon!')} style={{ background: 'rgba(21,18,25,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', fontSize: '1.1rem' }} title="Generate Video">🎥</button>
        </div>

        <div style={{ padding: '0.8rem', display: 'flex', gap: '0.5rem', background: 'rgba(9,9,13,0.7)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Message the story..."
            style={{ flex: 1, padding: '0.7rem', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '20px' }}
          />
          <button onClick={send} disabled={loading} style={{ background: '#9E092B', color: '#fff', border: 'none', borderRadius: '50%', width: '42px', height: '42px' }}>
            {loading ? '…' : '➤'}
          </button>
        </div>
      </div>
    </div>
  )
}
