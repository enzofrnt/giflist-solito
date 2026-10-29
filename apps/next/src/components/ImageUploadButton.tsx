'use client'

import { useRef, useState } from 'react'
import { getAuthToken } from 'app/lib/authStorage'

export function ImageUploadButton({
  onChange,
  label = 'Téléverser une image',
}: {
  onChange: (url: string) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function upload(file: File) {
    setBusy(true)
    setError('')
    try {
      const token = getAuthToken()
      if (!token || token instanceof Promise) throw new Error('Connectez-vous pour téléverser une image.')
      const body = new FormData()
      body.append('file', file)
      const response = await fetch('/api/uploads', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.url) throw new Error(data?.error || 'Envoi impossible.')
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="ds-stack ds-stack--gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm min-h-11 self-start" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? 'Envoi…' : label}
      </button>
      <span className="ds-hint">JPG, PNG, WebP ou GIF · 5 Mo max.</span>
      {error ? <span className="ds-error">{error}</span> : null}
    </div>
  )
}
