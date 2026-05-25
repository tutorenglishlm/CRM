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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    window.location.replace('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#1B2A4A', padding: '1rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '2.5rem 2rem',
        width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#1B2A4A',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#F5A623', marginBottom: '1rem'
          }}>TE</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1B2A4A' }}>
            Tutor<span style={{ color: '#F5A623' }}>English</span>LM
          </div>
          <div style={{ fontSize: 12, color: '#6B7A99', letterSpacing: '1px', textTransform: 'uppercase', marginTop: 4 }}>
            Panel Administrativo
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 13, color: '#6B7A99', display: 'block', marginBottom: 6 }}>Correo electrónico</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@tutorenglishlm.com"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #DDE2EF', borderRadius: 8, fontSize: 14, color: '#1B2A4A', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 13, color: '#6B7A99', display: 'block', marginBottom: 6 }}>Contraseña</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #DDE2EF', borderRadius: 8, fontSize: 14, color: '#1B2A4A', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ background: '#FDE8E8', color: '#A32D2D', fontSize: 13, padding: '10px 12px', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: loading ? '#6B7A99' : '#1B2A4A',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
