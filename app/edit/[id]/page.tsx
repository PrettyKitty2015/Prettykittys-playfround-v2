'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EditCharacter() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [personality, setPersonality] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [currentImage, setCurrentImage] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('characters').select('*').eq('id', id).single()
      if (data) {
        setName(data.name || '')
        setDescription(data.description || '')
        setPersonality(data.personality || '')
        setCurrentImage(data.image_url || '')
      }
    }
    if (id) load()
  }, [id])

  async function updateCharacter() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setMessage('Please log in')

    let imageUrl = currentImage

    if (image) {
      const fileName = `${user.id}-${Date.now()}-${image.name}`
      const { error: uploadError } = await supabase.storage.from('character-images').upload(fileName, image)
      if (uploadError) return setMessage(uploadError.message)
      const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('characters').update({
      name,
      description,
      personality,
      image_url: imageUrl
    }).eq('id', id)

    if (error) setMessage(error.message)
    else {
      setMessage('Updated!')
      setTimeout(() => router.push('/'), 1000)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#9E092B' }}>Edit Character</h1>
      {currentImage && <img src={currentImage} alt="Current" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }} />}
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '100px' }} />
      <textarea placeholder="Personality" value={personality} onChange={e => setPersonality(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '100px' }} />
      <label style={{ display: 'block', margin: '1rem 0', color: '#A855F7' }}>
        Change Image
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: '0.5rem' }} />
      </label>
      <button onClick={updateCharacter}
        style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>
        Save Changes
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
