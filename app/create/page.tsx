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
  const [image, setImage] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function saveCharacter() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('Please log in first')
      return
    }

    let imageUrl = null

    if (image) {
      const fileName = `${user.id}-${Date.now()}-${image.name}`
      const { error: uploadError } = await supabase.storage
        .from('character-images')
        .upload(fileName, image)

      if (uploadError) {
        setMessage(uploadError.message)
        return
      }

      const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('characters').insert({
      name,
      description,
      personality,
      creator_id: user.id,
      image_url: imageUrl
    })

    if (error) setMessage(error.message)
    else {
      setMessage('Character created!')
      setTimeout(() => router.push('/'), 1500)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#9E092B' }}>Create Character</h1>
      <input placeholder="Character Name" value={name} onChange={e => setName(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '100px' }} />
      <textarea placeholder="Personality" value={personality} onChange={e => setPersonality(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '100px' }} />
      
      <label style={{ display: 'block', margin: '1rem 0', color: '#A855F7' }}>
        Character Image (optional, NSFW allowed)
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)}
          style={{ display: 'block', marginTop: '0.5rem', color: '#F2EDF5' }} />
      </label>

      <button onClick={saveCharacter}
        style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Save Character
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
      <p style={{ marginTop: '1rem' }}><a href="/" style={{ color: '#A855F7' }}>Back to Home</a></p>
    </div>
  )
}
