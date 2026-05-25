'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
    } else {
      window.location.href = '/admin'
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--navy)', padding: '1rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '2.5rem 2rem',
        width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--navy)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: 'var(--gold)',
            marginBottom: '1rem'
          }}>TE</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>
            Tutor<span style={{ color: 'var(--gold)' }}>English</span>LM
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: 4 }}>
            Panel Administrativo
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              Correo electrónico
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@tutorenglishlm.com"
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 14, color: 'var(--navy)'
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 14, color: 'var(--navy)'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#FDE8E8', color: '#A32D2D', fontSize: 13,
              padding: '10px 12px', borderRadius: 8, marginBottom: '1rem'
            }}>{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'var(--muted)' : 'var(--navy)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
