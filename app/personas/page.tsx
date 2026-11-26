'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreatePersona() {
  const [name, setName] = useState('')
  const [pronouns, setPronouns] = useState('None')
  const [description, setDescription] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('character-images').upload(fileName, file)
    if (!error) {
      const { data } = supabase.storage.from('character-images').getPublicUrl(fileName)
      setAvatar(data.publicUrl)
    }
  }

  async function save() {
    if (!name.trim()) return setMessage('Name is required')
    setMessage('Saving...')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return router.push('/login')

    const { error } = await supabase.from('personas').insert({
      user_id: session.user.id,
      name,
      pronouns,
      description,
      avatar_url: avatar
    })

    if (error) setMessage(error.message)
    else {
      setMessage('Persona created!')
      setTimeout(() => router.push('/personas'), 800)
    }
  }

  return (
    <div style={{ minHeight: '100vh', color: '#F2EDF5', padding: '1rem', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.2rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#A855F7', fontSize: '1.4rem' }}>←</button>
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '1.1rem' }}>Create Persona</h1>
        <button onClick={save} style={{ background: '#4B176D', color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.85rem' }}>
          Create
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <label style={{ cursor: 'pointer' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(21,18,25,0.7)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2rem' }}>📷</span>}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A855F7', marginTop: '0.4rem' }}>Upload Avatar</div>
          <input type="file" accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.85rem', opacity: 0.8 }}>My Name*</label>
        <input
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.3rem', background: 'rgba(21,18,25,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.85rem', opacity: 0.8 }}>Pronouns</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
          {['She/Her', 'He/Him', 'They/Them', 'None'].map(p => (
            <button
              key={p}
              onClick={() => setPronouns(p)}
              style={{
                padding: '0.45rem 0.8rem',
                borderRadius: '20px',
                border: pronouns === p ? '1px solid #A855F7' : '1px solid #333',
                background: pronouns === p ? 'rgba(168,85,247,0.2)' : 'rgba(21,18,25,0.7)',
                color: '#F2EDF5',
                fontSize: '0.8rem'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.2rem' }}>
        <label style={{ fontSize: '0.85rem', opacity: 0.8 }}>Description</label>
        <textarea
          placeholder="Describe the persona's appearance, personality, background..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.3rem', background: 'rgba(21,18,25,0.7)', color: '#F2EDF5', border: '1px solid #333', borderRadius: '10px', minHeight: '120px' }}
        />
      </div>

      {message && <p style={{ textAlign: 'center', color: '#A855F7' }}>{message}</p>}
    </div>
  )
}
