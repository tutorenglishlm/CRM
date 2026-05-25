'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: 'ti-layout-dashboard', exact: true },
  { href: '/admin/leads', label: 'Solicitudes', icon: 'ti-user-plus' },
  { href: '/admin/students', label: 'Alumnos', icon: 'ti-users' },
  { href: '/admin/classes', label: 'Clases', icon: 'ti-book' },
  { href: '/admin/attendance', label: 'Asistencia', icon: 'ti-calendar-check' },
  { href: '/admin/payments', label: 'Pagos', icon: 'ti-credit-card' },
  { href: '/admin/financials', label: 'Finanzas', icon: 'ti-chart-line' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside style={{ width:240, minHeight:'100vh', background:'#0F172A', display:'flex', flexDirection:'column', flexShrink:0, borderRight:'1px solid #1E293B' }}>
      <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid #1E293B' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:'#F59E0B', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'#0F172A', flexShrink:0 }}>TE</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#F8FAFC' }}>TutorEnglish<span style={{ color:'#F59E0B' }}>LM</span></div>
            <div style={{ fontSize:11, color:'#475569', marginTop:1 }}>CRM workspace</div>
          </div>
        </div>
      </div>
      <div style={{ padding:'12px', flex:1 }}>
        <div style={{ fontSize:10, fontWeight:600, color:'#475569', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0 8px', marginBottom:6 }}>Menu</div>
        {nav.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:6, marginBottom:1, background:active?'#1E293B':'transparent', color:active?'#F8FAFC':'#64748B', textDecoration:'none', fontSize:13, fontWeight:active?500:400 }}>
              <i className={`ti ${item.icon}`} style={{ fontSize:16, flexShrink:0 }} aria-hidden="true" />
              <span style={{ flex:1 }}>{item.label}</span>
              {active && <div style={{ width:4, height:4, borderRadius:'50%', background:'#F59E0B' }} />}
            </Link>
          )
        })}
        <div style={{ height:1, background:'#1E293B', margin:'12px 0' }} />
        <a href="/inscripcion" target="_blank" style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:6, color:'#64748B', textDecoration:'none', fontSize:13 }}>
          <i className="ti ti-external-link" style={{ fontSize:16 }} aria-hidden="true" />
          <span>Formulario público</span>
        </a>
      </div>
      <div style={{ padding:'12px', borderTop:'1px solid #1E293B' }}>
        <button onClick={signOut} style={{ width:'100%', padding:'8px 10px', borderRadius:6, background:'transparent', border:'none', color:'#64748B', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:10 }}>
          <i className="ti ti-logout" style={{ fontSize:16 }} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
