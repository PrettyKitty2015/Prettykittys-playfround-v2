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
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [characters, setCharacters] = useState([{ name: '', description: '', image: null as File | null, extras: [] as File[] }])
  const [message, setMessage] = useState('')
  const router = useRouter()

  function addCharacter() {
    setCharacters([...characters, { name: '', description: '', image: null, extras: [] }])
  }

  function updateCharacter(index: number, field: string, value: any) {
    const updated = [...characters]
    updated[index] = { ...updated[index], [field]: value }
    setCharacters(updated)
  }

  async function uploadFile(file: File) {
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('character-images').upload(fileName, file)
    if (error) return null
    const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function save() {
    setMessage('Saving...')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setMessage('Not logged in')

    let coverUrl = null
    if (coverFile) coverUrl = await uploadFile(coverFile)

    for (const char of characters) {
      if (!char.name) continue
      const imageUrl = char.image ? await uploadFile(char.image) : null
      const extraUrls = []
      for (const extra of char.extras) {
        const url = await uploadFile(extra)
        if (url) extraUrls.push(url)
      }
      const { error } = await supabase.from('characters').insert({
        name: char.name,
        description: char.description || description,
        image_url: imageUrl,
        extra_images: extraUrls,
        story_title: title,
        story_cover_url: coverUrl,
        creator_id: session.user.id
      })
      if (error) return setMessage(error.message)
    }

    setMessage('Created!')
    setTimeout(() => router.push('/'), 1000)
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1rem', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.4rem', marginRight: '0.5rem' }}>←</button>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', margin: 0 }}>Create Story</h1>
      </div>

      <input placeholder="Story Title" value={title} onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: 'rgba(21,18,25,0.6)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Story Description" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: 'rgba(21,18,25,0.6)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />
      <label style={{ fontSize: '0.85rem' }}>Story Cover Image</label>
      <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} style={{ margin: '0.5rem 0', color: '#F2EDF5' }} />

      <h2 style={{ marginTop: '1.5rem', fontSize: '1.1rem' }}>Characters</h2>
      {characters.map((char, i) => (
        <div key={i} style={{ background: 'rgba(21, 18, 25, 0.55)', backdropFilter: 'blur(6px)', padding: '0.8rem', borderRadius: '12px', marginBottom: '0.8rem', border: '1px solid rgba(168,85,247,0.2)' }}>
          <input placeholder="Character Name" value={char.name} onChange={e => updateCharacter(i, 'name', e.target.value)}
            style={{ width: '100%', padding: '0.6rem', margin: '0.3rem 0', background: 'rgba(9,9,13,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.4rem' }} />
          <textarea placeholder="Character Description" value={char.description} onChange={e => updateCharacter(i, 'description', e.target.value)}
            style={{ width: '100%', padding: '0.6rem', margin: '0.3rem 0', background: 'rgba(9,9,13,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.4rem', minHeight: '60px' }} />
          <label style={{ fontSize: '0.8rem' }}>Main Image</label>
          <input type="file" accept="image/*" onChange={e => updateCharacter(i, 'image', e.target.files?.[0] || null)} style={{ margin: '0.3rem 0', color: '#F2EDF5' }} />
          <label style={{ fontSize: '0.8rem' }}>Extra Images</label>
          <input type="file" accept="image/*" multiple onChange={e => updateCharacter(i, 'extras', Array.from(e.target.files || []))} style={{ margin: '0.3rem 0', color: '#F2EDF5' }} />
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
