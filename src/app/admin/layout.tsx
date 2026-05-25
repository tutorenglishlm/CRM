'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Sidebar from '@/components/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = '/login'
      else setChecking(false)
    })
  }, [])

  if (checking) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0F172A' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ width:40, height:40, borderRadius:8, background:'#F59E0B', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, color:'#0F172A' }}>TE</div>
        <div style={{ color:'#475569', fontSize:13 }}>Cargando...</div>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F1F5F9' }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:'auto', minHeight:'100vh' }}>
        <div style={{ padding:'28px 32px', maxWidth:1200, margin:'0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
