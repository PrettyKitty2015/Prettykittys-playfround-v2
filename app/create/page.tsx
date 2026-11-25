'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreateStory() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [characters, setCharacters] = useState([{ name: '', description: '', image: null as File | null }])
  const [message, setMessage] = useState('')
  const router = useRouter()

  function addCharacter() {
    setCharacters([...characters, { name: '', description: '', image: null }])
  }

  function updateCharacter(index: number, field: string, value: any) {
    const updated = [...characters]
    updated[index] = { ...updated[index], [field]: value }
    setCharacters(updated)
  }

  async function save() {
    setMessage('Saving...')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMessage('Not logged in')
      return
    }

    const { data: story, error: storyError } = await supabase.from('stories').insert({
      title,
      description,
      user_id: session.user.id
    }).select().single()

    if (storyError || !story) {
      setMessage(storyError?.message || 'Failed to create story')
      return
    }

    for (const char of characters) {
      if (!char.name) continue
      let imageUrl = null
      if (char.image) {
        const fileName = `${Date.now()}-${char.image.name}`
        const { error: uploadError } = await supabase.storage.from('character-images').upload(fileName, char.image)
        if (!uploadError) {
          const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
          imageUrl = data.publicUrl
        }
      }
      await supabase.from('characters').insert({
        name: char.name,
        description: char.description,
        image_url: imageUrl,
        story_id: story.id,
        creator_id: session.user.id
      })
    }

    setMessage('Story created!')
    setTimeout(() => router.push('/'), 1000)
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1rem', paddingBottom: '90px' }}>
      <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', textAlign: 'center' }}>Create Story</h1>

      <input placeholder="Story Title" value={title} onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: 'rgba(21,18,25,0.6)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Story Description" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: 'rgba(21,18,25,0.6)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />

      <h2 style={{ marginTop: '1.5rem', fontSize: '1.1rem' }}>Characters</h2>
      {characters.map((char, i) => (
        <div key={i} style={{ background: 'rgba(21, 18, 25, 0.55)', backdropFilter: 'blur(6px)', padding: '0.8rem', borderRadius: '12px', marginBottom: '0.8rem', border: '1px solid rgba(168,85,247,0.2)' }}>
          <input placeholder="Character Name" value={char.name} onChange={e => updateCharacter(i, 'name', e.target.value)}
            style={{ width: '100%', padding: '0.6rem', margin: '0.3rem 0', background: 'rgba(9,9,13,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.4rem' }} />
          <textarea placeholder="Character Description" value={char.description} onChange={e => updateCharacter(i, 'description', e.target.value)}
            style={{ width: '100%', padding: '0.6rem', margin: '0.3rem 0', background: 'rgba(9,9,13,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.4rem', minHeight: '60px' }} />
          <input type="file" accept="image/*" onChange={e => updateCharacter(i, 'image', e.target.files?.[0] || null)}
            style={{ margin: '0.5rem 0', color: '#F2EDF5' }} />
        </div>
      ))}
      <button onClick={addCharacter} style={{ width: '100%', padding: '0.6rem', background: '#4B176D', color: '#fff', border: 'none', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        + Add Character
      </button>

      <button onClick={save} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>
        Save Story
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
