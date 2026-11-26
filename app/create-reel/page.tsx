'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreateReel() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function upload() {
    if (!videoFile) return setMessage('Please choose a video')
    setMessage('Uploading...')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return router.push('/login')

    const fileName = `${Date.now()}-${videoFile.name}`
    const { error: uploadError } = await supabase.storage.from('character-images').upload(fileName, videoFile)
    if (uploadError) return setMessage(uploadError.message)

    const { data: urlData } = supabase.storage.from('character-images').getPublicUrl(fileName)

    const { error } = await supabase.from('reels').insert({
      creator_id: session.user.id,
      title,
      description,
      video_url: urlData.publicUrl
    })

    if (error) setMessage(error.message)
    else {
      setMessage('Reel created!')
      setTimeout(() => router.push('/reels'), 1000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1.5rem', paddingBottom: '90px' }}>
      <h1 style={{ color: '#A855F7' }}>Create Reel</h1>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem' }} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
        style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', background: '#151219', color: '#F2EDF5', border: '1px solid #333', borderRadius: '0.5rem', minHeight: '80px' }} />
      <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} style={{ margin: '1rem 0', color: '#F2EDF5' }} />
      <button onClick={upload} style={{ width: '100%', padding: '0.75rem', background: '#9E092B', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>
        Upload Reel
      </button>
      {message && <p style={{ marginTop: '1rem', color: '#A855F7' }}>{message}</p>}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,22,0.95)', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-around', padding: '0.6rem 0 0.9rem' }}>
        <a href="/" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🏠<br/>Home</a>
        <a href="/create-reel" style={{ color: '#A855F7', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>🎬<br/>New Reel</a>
        <a href="/reels" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>📺<br/>Reels</a>
        <a href="/chats" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>💬<br/>Chats</a>
        <a href="/profile" style={{ color: '#F2EDF5', textDecoration: 'none', fontSize: '0.7rem', textAlign: 'center' }}>⚙️<br/>Profile</a>
      </div>
    </div>
  )
}
