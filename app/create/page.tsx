'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'

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
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => setImageSrc(reader.result as string))
      reader.readAsDataURL(e.target.files[0])
    }
  }

  async function getCroppedImg() {
    if (!imageSrc || !croppedAreaPixels) return null
    const image = new Image()
    image.src = imageSrc
    await new Promise(resolve => image.onload = resolve)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )
    return new Promise<Blob>((resolve) => {
      canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.9)
    })
  }

  async function saveCharacter() {
    setMessage('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMessage('Please log in first')
      return
    }

    let imageUrl = null
    if (imageSrc) {
      const blob = await getCroppedImg()
      if (blob) {
        const fileName = `${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('character-images')
          .upload(fileName, blob)
        if (!uploadError) {
          const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
          imageUrl = data.publicUrl
        }
      }
    }

    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const { error } = await supabase.from('characters').insert({
      name,
      description,
      personality,
      scenario,
      first_message: firstMessage,
      tags: tagsArray.length > 0 ? tagsArray : null,
      image_url: imageUrl,
      creator_id: session.user.id
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Character created!')
      setTimeout(() => router.push('/'), 1000)
    }
  }

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '1rem', paddingBottom: '90px' }}>
      <div style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.1rem', cursor: 'pointer' }}>← Back</button>
      </div>

      <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', textAlign: 'center' }}>Create Character</h1>

      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />

      <textarea placeholder="Description / Bio" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />

      <textarea placeholder="Personality" value={personality} onChange={e => setPersonality(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />

      <textarea placeholder="Scenario / Setting" value={scenario} onChange={e => setScenario(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />

      <textarea placeholder="First Message (opening message from the character)" value={firstMessage} onChange={e => setFirstMessage(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />

      <input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />

      <p style={{ color: '#A855F7', margin: '1rem 0 0.3rem' }}>Character Image</p>
      <input type="file" accept="image/*" onChange={onFileChange} style={{ margin: '0.5rem 0', color: '#F2EDF5' }} />

      {imageSrc && (
        <div style={{ position: 'relative', width: '100%', height: '300px', margin: '1rem 0' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      <button onClick={saveCharacter}
        style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '1rem' }}>
        Create Character
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
