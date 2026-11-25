'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreateCharacter() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [personality, setPersonality] = useState('')
  const [scenario, setScenario] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [tags, setTags] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function saveCharacter() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setMessage('Please log in first')

    let imageUrl = null
    if (image) {
      const fileName = `${user.id}-${Date.now()}-${image.name}`
      const { error: uploadError } = await supabase.storage.from('character-images').upload(fileName, image)
      if (uploadError) return setMessage(uploadError.message)
      const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('characters').insert({
      name,
      description,
      personality,
      scenario,
      first_message: firstMessage,
      tags,
      creator_id: user.id,
      image_url: imageUrl
    })

    if (error) setMessage(error.message)
    else {
      setMessage('Character created!')
      setTimeout(() => router.push('/'), 1200)
    }
  }

  return (
    <div style={{ maxWidth: '520px', margin: '1.5rem auto', padding: '1rem', color: '#F2EDF5' }}>
      <h1 style={{ color: '#9E092B', textAlign: 'center' }}>Create Character</h1>

      <input placeholder="Character Name *" value={name} onChange={e => setName(e.target.value)}
        style={inputStyle} />
      <textarea placeholder="Description / Bio" value={description} onChange={e => setDescription(e.target.value)}
        style={{ ...inputStyle, minHeight: '80px' }} />
      <textarea placeholder="Personality *" value={personality} onChange={e => setPersonality(e.target.value)}
        style={{ ...inputStyle, minHeight: '100px' }} />
      <textarea placeholder="Scenario / Setting" value={scenario} onChange={e => setScenario(e.target.value)}
        style={{ ...inputStyle, minHeight: '80px' }} />
      <textarea placeholder="First Message (opening message from the character)" value={firstMessage} onChange={e => setFirstMessage(e.target.value)}
        style={{ ...inputStyle, minHeight: '100px' }} />
      <input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)}
        style={inputStyle} />

      <label style={{ display: 'block', margin: '1rem 0', color: '#A855F7' }}>
        Character Image
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: '0.5rem' }} />
      </label>

      <button onClick={saveCharacter}
        style={{ width: '100%', padding: '0.85rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, marginTop: '0.5rem' }}>
        Create Character
      </button>
      {message && <p style={{ marginTop: '1rem', textAlign: 'center', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  margin: '0.4rem 0',
  background: '#151219',
  color: '#F2EDF5',
  border: '1px solid #333',
  borderRadius: '10px',
  fontSize: '0.95rem'
}
