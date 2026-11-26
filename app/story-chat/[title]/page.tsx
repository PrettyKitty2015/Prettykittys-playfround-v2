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
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
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

      const { data: chars } = await supabase
        .from('characters')
        .select('*')
        .eq('story_title', title)
      if (chars) setCharacters(chars)

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

    // Save user message
    await supabase.from('messages').insert({
      user_id: userId,
      story_title: title,
      role: 'user',
      content: userMessage
    })

    // Build prompt with all characters
    const charList = characters.map(c => `${c.name}: ${c.description || ''}`).join('\n\n')
    const system = `You are roleplaying a multi-character story called "${title}". 
Characters:
${charList}

Respond in character as one or more of the characters. Use *italics* for actions and "quotes" for dialogue. Stay in third person for actions.`

    const history = messages.map(m => `${m.role}: ${m.content}`).join('\n')
    const prompt = `${system}\n\n${history}\nuser: ${userMessage}\nassistant:`

    // Call your AI (replace with your actual AI endpoint)
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

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#09090D', color: '#F2EDF5' }}>
      <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2a2a35', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.3rem' }}>←</button>
        <div style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{title}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '0.8rem', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              background: m.role === 'user' ? '#4B176D' : 'rgba(21,18,25,0.7)',
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

      <div style={{ padding: '0.8rem', borderTop: '1px solid #2a2a35', display: 'flex', gap: '0.5rem' }}>
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
  )
}
