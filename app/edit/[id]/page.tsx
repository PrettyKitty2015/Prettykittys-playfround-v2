'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EditCharacter() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [personality, setPersonality] = useState('')
  const [scenario, setScenario] = useState('')
  const [appearance, setAppearance] = useState('')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const { data } = await supabase.from('characters').select('*').eq('id', id).single()
      if (data) {
        setName(data.name || '')
        setDescription(data.description || '')
        setPersonality(data.personality || '')
        setScenario(data.scenario || '')
        setAppearance(data.appearance || '')
        setExistingImage(data.image_url || '')
        if (session && data.creator_id === session.user.id) setIsCreator(true)
      }
    }
    if (id) load()
  }, [id])

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
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height
    ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height)
    return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  }

  async function save() {
    setMessage('Saving...')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMessage('Not logged in')
      return
    }

    let imageUrl = existingImage
    if (imageSrc && croppedAreaPixels) {
      const blob = await getCroppedImg()
      if (blob) {
        const fileName = `${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage.from('character-images').upload(fileName, blob)
        if (!uploadError) {
          const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
          imageUrl = data.publicUrl
        }
      }
    }

    const { error } = await supabase.from('characters').update({
      name,
      description,
      personality,
      scenario,
      appearance,
      image_url: imageUrl
    }).eq('id', id).eq('creator_id', session.user.id)

    if (error) setMessage(error.message)
    else {
      setMessage('Saved!')
      setTimeout(() => router.push('/'), 800)
    }
  }

  async function deleteCharacter() {
    if (!confirm('Delete this character? This cannot be undone.')) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.from('characters').delete().eq('id', id).eq('creator_id', session.user.id)
    if (error) setMessage(error.message)
    else router.push('/')
  }

  if (!isCreator) {
    return (
      <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
        <p>You can only edit characters you created.</p>
        <button onClick={() => router.back()} style={{ marginTop: '1rem', color: '#A855F7', background: 'none', border: 'none' }}>Go Back</button>
      </div>
    )
  }

  return (
    <div style={{ background: '#09090D', color: '#F2EDF5', minHeight: '100vh', padding: '1rem', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.2rem', marginRight: '0.5rem' }}>←</button>
        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#9E092B', margin: 0 }}>Edit Character</h1>
      </div>

      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '70px' }} />
      <textarea placeholder="Personality" value={personality} onChange={e => setPersonality(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '70px' }} />
      <textarea placeholder="Scenario / Intro" value={scenario} onChange={e => setScenario(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '70px' }} />
      <textarea placeholder="Appearance" value={appearance} onChange={e => setAppearance(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />

      {existingImage && !imageSrc && (
        <img src={existingImage} alt="" style={{ width: '120px', borderRadius: '12px', margin: '0.5rem 0' }} />
      )}

      <input type="file" accept="image/*" onChange={onFileChange} style={{ margin: '1rem 0', color: '#F2EDF5' }} />

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

      <button onClick={save}
        style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '1rem' }}>
        Save Changes
      </button>
      <button onClick={deleteCharacter}
        style={{ width: '100%', padding: '0.75rem', background: '#4B176D', color: '#fff', border: 'none', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
        Delete Character
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
