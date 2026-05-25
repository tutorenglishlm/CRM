'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/students', label: 'Alumnos', icon: '👥' },
  { href: '/admin/registrations', label: 'Inscripciones', icon: '📋' },
  { href: '/admin/financials', label: 'Finanzas', icon: '💰' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--navy)',
      display: 'flex', flexDirection: 'column', flexShrink: 0
    }}>
      {/* Brand */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'var(--navy)', flexShrink: 0
          }}>TE</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Tutor<span style={{ color: 'var(--gold)' }}>English</span>LM
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              CRM
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
        {navItems.map(item => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              background: active ? 'var(--gold)' : 'transparent',
              color: active ? 'var(--navy)' : 'rgba(255,255,255,0.65)',
              textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 400,
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Public form link */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a href="/inscripcion" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 8, fontSize: 13,
          color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.12)'
        }}>
          <span>🔗</span> Ver formulario público
        </a>
      </div>

      {/* Sign out */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={handleSignOut} style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13,
          textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span>↩</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
