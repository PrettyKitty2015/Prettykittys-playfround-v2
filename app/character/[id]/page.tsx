'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CharacterDetail() {
  const [character, setCharacter] = useState<any>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('characters').select('*').eq('id', id).single()
      setCharacter(data)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: fav } = await supabase.from('favorites').select('id').eq('user_id', session.user.id).eq('character_id', id).single()
        setIsFavorite(!!fav)
      }
    }
    if (id) load()
  }, [id])

  async function toggleFavorite() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('character_id', id)
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, character_id: id })
    }
    setIsFavorite(!isFavorite)
  }

  async function startNewChat() {
    const chatId = crypto.randomUUID()
    router.push(`/chat/${id}?chat=${chatId}`)
  }

  if (!character) return <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '2rem' }}>Loading...</div>

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '1rem', paddingBottom: '90px' }}>
      {character.image_url && <img src={character.image_url} alt="" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '16px' }} />}
      <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', marginTop: '1rem' }}>{character.name}</h1>
      <p style={{ opacity: 0.8 }}>{character.description}</p>
      <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{character.personality}</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button onClick={startNewChat} style={{ flex: 1, padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>New Chat</button>
        <button onClick={toggleFavorite} style={{ padding: '0.75rem 1rem', background: isFavorite ? '#4B176D' : '#151219', color: '#fff', border: '1px solid #4B176D', borderRadius: '0.5rem' }}>{isFavorite ? '★' : '☆'}</button>
      </div>
      <a href={`/edit/${id}`} style={{ color: '#A855F7', display: 'inline-block', marginTop: '1rem' }}>Edit Character</a>
    </div>
  )
}
