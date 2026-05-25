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
    <div style={{ minHeight:'100vh', background:'#0F172A', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'#F59E0B', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#0F172A', marginBottom:16 }}>TE</div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#F8FAFC', letterSpacing:'-0.4px', marginBottom:6 }}>TutorEnglish<span style={{ color:'#F59E0B' }}>LM</span></h1>
          <p style={{ fontSize:13, color:'#475569' }}>Inicia sesión en tu workspace</p>
        </div>
        <div style={{ background:'#1E293B', borderRadius:16, padding:'32px', border:'1px solid #334155' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:500, color:'#94A3B8', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Correo electrónico</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com"
                style={{ width:'100%', padding:'10px 14px', border:'1px solid #334155', borderRadius:8, fontSize:14, color:'#F8FAFC', background:'#0F172A', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:12, fontWeight:500, color:'#94A3B8', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width:'100%', padding:'10px 14px', border:'1px solid #334155', borderRadius:8, fontSize:14, color:'#F8FAFC', background:'#0F172A', outline:'none', boxSizing:'border-box' }} />
            </div>
            {error && <div style={{ background:'#450A0A', border:'1px solid #7F1D1D', color:'#FCA5A5', fontSize:13, padding:'10px 14px', borderRadius:8, marginBottom:16 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width:'100%', padding:'11px', background:loading?'#334155':'#F59E0B', color:loading?'#64748B':'#0F172A', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer' }}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
